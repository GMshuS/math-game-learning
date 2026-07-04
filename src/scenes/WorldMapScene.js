/**
 * Phaser 游戏主场景 - 世界地图
 */
import Phaser from 'phaser';
import { getAllAreas } from '../config/adventure';

export default class WorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldMapScene' });
    
    this.areas = [];
    this.areaNodes = [];
    this.selectedArea = null;
    this.unlockedAreas = [];
    this.currentAreaId = null;
    this.dialogContainer = null;
    this._timeoutIds = [];
  }

  /**
   * 安全的 setTimeout，场景关闭时自动清除
   */
  _setTimeout(fn, delay) {
    const id = setTimeout(() => {
      this._timeoutIds = this._timeoutIds.filter(t => t !== id);
      if (this.scene && this.scene.isActive()) fn();
    }, delay);
    this._timeoutIds.push(id);
    return id;
  }

  cleanup() {
    this._timeoutIds.forEach(id => clearTimeout(id));
    this._timeoutIds = [];
    if (this.dialogContainer) {
      this.dialogContainer.destroy();
      this.dialogContainer = null;
    }
  }

  init(data) {
    this.unlockedAreas = data.unlockedAreas || ['area_1'];
    this.currentAreaId = data.currentAreaId || 'area_1';
    this.onAreaSelect = data.onAreaSelect || null;
  }

  create() {
    // 注册场景生命周期清理
    this.events.on('shutdown', this.cleanup, this);
    this.events.on('destroy', this.cleanup, this);

    const { width, height } = this.scale;
    
    // 添加背景
    this.createBackground(width, height);
    
    // 添加标题
    this.createTitle(width);
    
    // 创建世界地图节点
    this.createMapNodes(width, height);
    
    // 添加说明文字
    this.createHintText(width, height);
  }

  /**
   * 创建背景
   */
  createBackground(width, height) {
    // 渐变背景
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      0x1a1a2e, 0x1a1a2e,
      0x16213e, 0x16213e,
      1
    );
    graphics.fillRect(0, 0, width, height);
    
    // 添加装饰性星星
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
    this.add.text(width / 2, 50, '🗺️ 世界地图', {
      font: 'bold 36px Microsoft YaHei',
      color: '#ffffff',
      stroke: '#667eea',
      strokeThickness: 6
    }).setOrigin(0.5);
  }

  /**
   * 创建地图节点
   */
  createMapNodes(width, height) {
    this.areas = getAllAreas();
    
    // 使用折线路径布局，交替左右位置避免重叠
    const pathLayout = [
      { x: width * 0.3, y: height * 0.2 },
      { x: width * 0.7, y: height * 0.33 },
      { x: width * 0.5, y: height * 0.46 },
      { x: width * 0.3, y: height * 0.59 },
      { x: width * 0.7, y: height * 0.72 }
    ];
    
    this.areas.forEach((area, index) => {
      const { x, y } = pathLayout[index] || { x: width / 2, y: 120 + index * 100 };
      
      const isUnlocked = this.unlockedAreas.includes(area.id);
      const isCurrent = this.currentAreaId === area.id;
      
      // 绘制连接线
      if (index > 0) {
        const prev = pathLayout[index - 1];
        const lineGraphics = this.add.graphics();
        lineGraphics.lineStyle(2, 0x667eea, 0.3);
        lineGraphics.beginPath();
        lineGraphics.moveTo(prev.x, prev.y);
        lineGraphics.lineTo(x, y);
        lineGraphics.strokePath();
      }
      
      // 创建节点容器
      const container = this.add.container(x, y);
      
      // 节点背景（圆形）
      const circle = this.add.circle(0, 0, 40, isUnlocked ? this.hexToColor(area.color) : 0x444444);
      circle.setStrokeStyle(isCurrent ? 4 : 2, isCurrent ? 0xffffff : 0x666666);
      container.add(circle);
      
      // 区域图标
      const icon = this.add.text(0, 0, this.getAreaIcon(index), {
        font: 'bold 24px Arial',
        color: isUnlocked ? '#ffffff' : '#888888'
      }).setOrigin(0.5);
      container.add(icon);
      
      // 锁定图标
      if (!isUnlocked) {
        const lockIcon = this.add.text(0, 0, '🔒', {
          font: 'bold 22px Arial'
        }).setOrigin(0.5);
        container.add(lockIcon);
      }
      
      // 区域名称
      const nameLabel = this.add.text(0, 55, area.name, {
        font: 'bold 16px Microsoft YaHei',
        color: isUnlocked ? '#ffffff' : '#888888',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      container.add(nameLabel);
      
      // 点击事件（挂在 circle 上确保交互准确）
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
          this.selectArea(area);
        });
      }
      
      this.areaNodes.push({
        container,
        circle,
        area,
        isUnlocked,
        isCurrent
      });
    });
  }

  /**
   * 创建提示文字
   */
  createHintText(width, height) {
    this.add.text(width / 2, height - 30, '点击区域查看详情，再选择"进入冒险"', {
      font: '14px Microsoft YaHei',
      color: '#888888'
    }).setOrigin(0.5);
  }

  /**
   * 选择区域
   */
  selectArea(area) {
    // 重置所有节点状态
    this.areaNodes.forEach(node => {
      if (node.circle) {
        node.circle.setStrokeStyle(2, 0x666666);
      }
    });
    
    // 设置选中状态
    const selectedNode = this.areaNodes.find(n => n.area.id === area.id);
    if (selectedNode && selectedNode.circle) {
      selectedNode.circle.setStrokeStyle(4, 0xffffff);
    }
    
    this.selectedArea = area;
    
    // 显示区域选择提示（不触发回调，等用户点击"进入冒险"才触发）
    this.showAreaSelectDialog(area);
  }

  /**
   * 显示区域选择对话框
   */
  showAreaSelectDialog(area) {
    // 先关闭之前的对话框
    if (this.dialogContainer) {
      this.dialogContainer.destroy();
      this.dialogContainer = null;
    }
    
    const { width, height } = this.scale;
    
    // 创建对话框容器
    const dialogWidth = 400;
    const dialogHeight = 250;
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
    
    // 对话框背景 - 相对于容器中心点
    const bg = this.add.rectangle(0, 0, dialogWidth, dialogHeight, 0x1a1a2e);
    bg.setStrokeStyle(3, this.hexToColor(area.color));
    this.dialogContainer.add(bg);
    
    // 区域名称
    this.dialogContainer.add(this.add.text(0, -80, area.name, {
      font: 'bold 28px Microsoft YaHei',
      color: '#ffffff'
    }).setOrigin(0.5));
    
    // 区域描述
    this.dialogContainer.add(this.add.text(0, -40, area.description, {
      font: '16px Microsoft YaHei',
      color: '#cccccc'
    }).setOrigin(0.5));
    
    // 关卡信息
    this.dialogContainer.add(this.add.text(0, 0, `关卡数：${Array.isArray(area.levels) ? area.levels.length : area.levels}`, {
      font: '16px Microsoft YaHei',
      color: area.color
    }).setOrigin(0.5));
    
    // 进入按钮 - 直接使用矩形而非容器
    const btnX = 0;
    const btnY = 60;
    const btnWidth = 200;
    const btnHeight = 50;
    
    const enterBtnBg = this.add.rectangle(btnX, btnY, btnWidth, btnHeight, this.hexToColor(area.color));
    enterBtnBg.setStrokeStyle(2, 0xffffff);
    this.dialogContainer.add(enterBtnBg);

    const enterBtnText = this.add.text(btnX, btnY, '进入冒险', {
      font: 'bold 20px Microsoft YaHei',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.dialogContainer.add(enterBtnText);
    
    // 使背景矩形可交互
    enterBtnBg.setInteractive({ useHandCursor: true });
    
    enterBtnBg.on('pointerover', () => enterBtnBg.setScale(1.05));
    enterBtnBg.on('pointerout', () => enterBtnBg.setScale(1));
    enterBtnBg.on('pointerdown', () => {
      this.enterArea(area);
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
  
  closeDialog() {
    if (this.dialogContainer) {
      this.dialogContainer.destroy();
      this.dialogContainer = null;
    }
  }

  /**
   * 进入区域
   */
  enterArea(area) {
    // 关闭对话框
    this.closeDialog();
    // 触发选择回调
    if (this.onAreaSelect) {
      this.onAreaSelect(area);
    }
    this.scene.stop('WorldMapScene');
  }

  /**
   * 获取区域图标
   */
  // NOTE: Keep in sync with LevelSelect.vue areaIcon — same 5 icons in same order
  getAreaIcon(index) {
    const icons = ['🌲', '🏔️', '🏰', '🏝️', '👑'];
    return icons[index] || '⭐';
  }

  /**
   * 颜色转换
   */
  hexToColor(hex) {
    return parseInt(hex.slice(1), 16);
  }
}
