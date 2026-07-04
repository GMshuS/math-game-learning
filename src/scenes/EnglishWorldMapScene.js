/**
 * Phaser 英语世界地图场景
 * 显示4个英语学习区域节点，支持解锁状态和点击选择
 * 参考 WorldMapScene.js 的实现风格
 */
import Phaser from 'phaser';
import { getAllEnglishRegions } from '../config/english/adventure';

export default class EnglishWorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EnglishWorldMapScene' });

    this.regions = [];
    this.regionNodes = [];
    this.selectedRegion = null;
    this.unlockedRegions = [];
    this.currentRegionId = null;
    this.dialogContainer = null;
    this._timeoutIds = [];
  }

  /**
   * 安全的 setTimeout，场景关闭时自动清除
   */
  _setTimeout(fn, delay) {
    const id = setTimeout(() => {
      this._timeoutIds = this._timeoutIds.filter(t => t !== id);
      if (this.scene && typeof this.scene.isActive === 'function' && this.scene.isActive()) fn();
    }, delay);
    this._timeoutIds.push(id);
    return id;
  }

  /**
   * 清理定时器和对话框
   */
  cleanup() {
    this._timeoutIds.forEach(id => clearTimeout(id));
    this._timeoutIds = [];
    if (this.dialogContainer) {
      this.dialogContainer.destroy();
      this.dialogContainer = null;
    }
  }

  /**
   * 初始化场景数据
   * @param {object} data - { unlockedRegions, currentRegionId, onRegionSelect }
   */
  init(data) {
    const opts = data || {};
    this.unlockedRegions = opts.unlockedRegions || ['region_1'];
    this.currentRegionId = opts.currentRegionId || 'region_1';
    this.onRegionSelect = opts.onRegionSelect || null;
  }

  /**
   * 创建场景
   */
  create() {
    // 注册场景生命周期清理
    this.events.on('shutdown', this.cleanup, this);
    this.events.on('destroy', this.cleanup, this);

    const { width, height } = this.scale;

    this.createBackground(width, height);
    this.createTitle(width);
    this.createMapNodes(width, height);
    this.createHintText(width, height);
  }

  /**
   * 创建渐变背景 + 星星装饰
   */
  createBackground(width, height) {
    const graphics = this.add.graphics();
    // 紫蓝色渐变背景
    graphics.fillGradientStyle(
      0x1a1a3e, 0x1a1a3e,
      0x2d1b4e, 0x2d1b4e,
      1
    );
    graphics.fillRect(0, 0, width, height);

    // 装饰性星星
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1;
      const alpha = Math.random() * 0.5 + 0.3;
      this.add.circle(x, y, size, 0xffffff, alpha);
    }
  }

  /**
   * 创建标题
   */
  createTitle(width) {
    this.add.text(width / 2, 50, '🏰 英语冒险世界', {
      font: 'bold 36px Microsoft YaHei',
      color: '#ffffff',
      stroke: '#7c3aed',
      strokeThickness: 6
    }).setOrigin(0.5);
  }

  /**
   * 创建地图节点
   * 使用两列交错的路径布局，区域间绘制连线
   */
  createMapNodes(width, height) {
    this.regions = getAllEnglishRegions();

    // 布局：4个区域交替左右排列
    const layout = [
      { x: width * 0.3, y: height * 0.22 },
      { x: width * 0.7, y: height * 0.38 },
      { x: width * 0.3, y: height * 0.54 },
      { x: width * 0.7, y: height * 0.70 }
    ];

    this.regions.forEach((region, index) => {
      const { x, y } = layout[index] || { x: width / 2, y: 120 + index * 110 };

      const isUnlocked = this.unlockedRegions.includes(region.id);
      const isCurrent = this.currentRegionId === region.id;

      // 绘制从前一个节点到当前节点的连接线
      if (index > 0) {
        const prev = layout[index - 1];
        const prevRegion = this.regions[index - 1];
        const prevUnlocked = this.unlockedRegions.includes(prevRegion.id);
        const lineColor = (prevUnlocked && isUnlocked) ? 0x7c3aed : 0x444444;
        const lineAlpha = (prevUnlocked && isUnlocked) ? 0.6 : 0.2;

        const lineGraphics = this.add.graphics();
        lineGraphics.lineStyle(3, lineColor, lineAlpha);
        lineGraphics.beginPath();
        lineGraphics.moveTo(prev.x, prev.y + 40);
        lineGraphics.lineTo(x, y - 40);
        lineGraphics.strokePath();

        // 箭头小圆点
        if (isUnlocked) {
          this.add.circle(x, y - 45, 4, 0x7c3aed, 0.8);
        }
      }

      // 创建节点容器
      const container = this.add.container(x, y);

      // 节点背景（圆形）
      const circleColor = isUnlocked ? 0x7c3aed : 0x444444;
      const circle = this.add.circle(0, 0, 42, circleColor);
      circle.setStrokeStyle(isCurrent ? 4 : 2, isCurrent ? 0xffffff : (isUnlocked ? 0xa78bfa : 0x666666));
      container.add(circle);

      // 区域图标
      const icon = this.add.text(0, 0, region.icon, {
        font: 'bold 28px Arial'
      }).setOrigin(0.5);
      container.add(icon);

      // 锁定图标（未解锁区域覆盖锁图标）
      if (!isUnlocked) {
        const lockIcon = this.add.text(0, 0, '🔒', {
          font: 'bold 24px Arial'
        }).setOrigin(0.5);
        container.add(lockIcon);
      }

      // 区域名称
      const nameLabel = this.add.text(0, 56, region.name, {
        font: 'bold 16px Microsoft YaHei',
        color: isUnlocked ? '#ffffff' : '#888888',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      container.add(nameLabel);

      // 塔数量标签
      const towerLabel = this.add.text(0, 74, `${region.towers.length}座塔`, {
        font: '12px Microsoft YaHei',
        color: isUnlocked ? '#a78bfa' : '#666666'
      }).setOrigin(0.5);
      container.add(towerLabel);

      // 点击交互（仅已解锁区域可点击）
      if (isUnlocked) {
        circle.setInteractive({ useHandCursor: true });

        circle.on('pointerover', () => {
          if (!isCurrent) {
            circle.setScale(1.15);
          }
        });

        circle.on('pointerout', () => {
          circle.setScale(1);
        });

        circle.on('pointerdown', () => {
          this.selectRegion(region);
        });
      }

      this.regionNodes.push({
        container,
        circle,
        region,
        isUnlocked,
        isCurrent
      });
    });
  }

  /**
   * 创建底部提示文字
   */
  createHintText(width, height) {
    this.add.text(width / 2, height - 30, '点击已解锁的区域开始冒险', {
      font: '14px Microsoft YaHei',
      color: '#888888'
    }).setOrigin(0.5);
  }

  /**
   * 选择区域
   */
  selectRegion(region) {
    // 重置所有节点选中样式
    this.regionNodes.forEach(node => {
      if (node.circle) {
        node.circle.setStrokeStyle(2, node.isCurrent ? 0xffffff : (node.isUnlocked ? 0xa78bfa : 0x666666));
      }
    });

    // 设置当前选中高亮
    const selectedNode = this.regionNodes.find(n => n.region.id === region.id);
    if (selectedNode && selectedNode.circle) {
      selectedNode.circle.setStrokeStyle(4, 0xffffff);
    }

    this.selectedRegion = region;

    // 显示区域详情对话框
    this.showRegionDialog(region);
  }

  /**
   * 显示区域详情对话框
   */
  showRegionDialog(region) {
    // 关闭之前的对话框
    if (this.dialogContainer) {
      this.dialogContainer.destroy();
      this.dialogContainer = null;
    }

    const { width, height } = this.scale;
    const dialogWidth = 380;
    const dialogHeight = 280;
    const dialogX = width / 2;
    const dialogY = height / 2;

    this.dialogContainer = this.add.container(dialogX, dialogY);

    // 半透明遮罩
    const mask = this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0.5);
    mask.setInteractive();
    mask.on('pointerdown', () => {
      this.closeDialog();
    });
    this.dialogContainer.add(mask);

    // 对话框背景
    const bg = this.add.rectangle(0, 0, dialogWidth, dialogHeight, 0x1a1a3e);
    bg.setStrokeStyle(3, 0x7c3aed);
    this.dialogContainer.add(bg);

    // 区域图标 + 名称
    this.dialogContainer.add(this.add.text(0, -95, `${region.icon} ${region.name}`, {
      font: 'bold 26px Microsoft YaHei',
      color: '#ffffff'
    }).setOrigin(0.5));

    // 语法塔列表
    const towersText = `语法塔: ${region.towers.join(' · ')}`;
    this.dialogContainer.add(this.add.text(0, -55, towersText, {
      font: '14px Microsoft YaHei',
      color: '#a78bfa'
    }).setOrigin(0.5));

    // BOSS信息
    if (region.boss) {
      this.dialogContainer.add(this.add.text(0, -25, `BOSS: ${region.boss.icon} ${region.boss.name}`, {
        font: '16px Microsoft YaHei',
        color: '#fbbf24'
      }).setOrigin(0.5));
    }

    // 通关条件
    this.dialogContainer.add(this.add.text(0, 5, '通关条件: 完成所有语法塔 + 击败BOSS', {
      font: '13px Microsoft YaHei',
      color: '#cccccc'
    }).setOrigin(0.5));

    // 进入按钮
    const btnX = 0;
    const btnY = 55;
    const btnWidth = 200;
    const btnHeight = 48;

    const enterBtnBg = this.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x7c3aed);
    enterBtnBg.setStrokeStyle(2, 0xa78bfa);
    this.dialogContainer.add(enterBtnBg);

    const enterBtnText = this.add.text(btnX, btnY, '🗺️ 进入区域', {
      font: 'bold 18px Microsoft YaHei',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.dialogContainer.add(enterBtnText);

    enterBtnBg.setInteractive({ useHandCursor: true });

    enterBtnBg.on('pointerover', () => enterBtnBg.setScale(1.05));
    enterBtnBg.on('pointerout', () => enterBtnBg.setScale(1));
    enterBtnBg.on('pointerdown', () => {
      this.enterRegion(region);
    });

    // 关闭按钮
    const closeBtnX = dialogWidth / 2 - 20;
    const closeBtnY = -dialogHeight / 2 + 20;

    const closeBtn = this.add.text(closeBtnX, closeBtnY, '✕', {
      font: 'bold 20px Arial',
      color: '#888888'
    }).setOrigin(0.5);

    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.closeDialog();
    });

    this.dialogContainer.add(closeBtn);
  }

  /**
   * 关闭对话框
   */
  closeDialog() {
    if (this.dialogContainer) {
      this.dialogContainer.destroy();
      this.dialogContainer = null;
    }
  }

  /**
   * 进入区域
   */
  enterRegion(region) {
    this.closeDialog();
    const cb = this.onRegionSelect;
    if (cb) {
      cb(region);
    }
    // 使用 _setTimeout 确保回调完全执行后再 stop
    this._setTimeout(() => {
      this.scene.stop('EnglishWorldMapScene');
    }, 50);
  }
}
