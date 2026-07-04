/**
 * Phaser 几何场景 — 多模式复用场景
 * 通过 init(data) 中 mode 参数切换不同模式
 * modes: identify | angles | triangle | area | transform | solid | circle | views
 */
import Phaser from 'phaser';
import { generateQuestion } from '../config/geometryQuestions';

/** 回合切换延迟（毫秒） */
const TURN_DELAY_MS = 1200;

export default class GeometryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GeometryScene' });

    this.mode = 'identify';
    this.grade = 1;
    this.currentQuestion = null;
    this.score = 0;
    this.totalQuestions = 0;
    this.correctCount = 0;
    this.onComplete = null;
    this.optionButtons = [];
    this._timeoutIds = [];
    this._destroyed = false;
    this._modeGraphics = [];
  }

  /**
   * 安全的 setTimeout，场景关闭时自动清除
   */
  _setTimeout(fn, delay) {
    const id = setTimeout(() => {
      this._timeoutIds = this._timeoutIds.filter(t => t !== id);
      if (this._destroyed) return;
      if (this.scene?.isActive()) fn();
    }, delay);
    this._timeoutIds.push(id);
    return id;
  }

  cleanup() {
    this._destroyed = true;
    this._timeoutIds.forEach(id => clearTimeout(id));
    this._timeoutIds = [];
  }

  /**
   * 接收外部数据
   * @param {object} data - { mode, grade, onComplete }
   */
  init(data) {
    this.mode = data.mode || 'identify';
    this.grade = data.grade || 1;
    this.onComplete = data.onComplete || null;
    this.score = 0;
    this.totalQuestions = 0;
    this.correctCount = 0;
    this.currentQuestion = null;
    this.optionButtons = [];
    this._modeGraphics = [];
  }

  create() {
    this.events.on('shutdown', this.cleanup, this);
    this.events.on('destroy', this.cleanup, this);

    const { width, height } = this.scale;

    this.createBackground(width, height);
    this.createTitle(width, height);

    // 生成第一道题
    this.nextQuestion();
  }

  /**
   * 创建背景
   */
  createBackground(width, height) {
    const bg = this.add.rectangle(0, 0, width, height, 0x0f1729);
    bg.setOrigin(0);

    // 装饰性网格
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x1e293b, 0.3);
    for (let x = 0; x < width; x += 40) {
      graphics.beginPath();
      graphics.moveTo(x, 0);
      graphics.lineTo(x, height);
      graphics.strokePath();
    }
    for (let y = 0; y < height; y += 40) {
      graphics.beginPath();
      graphics.moveTo(0, y);
      graphics.lineTo(width, y);
      graphics.strokePath();
    }
  }

  /**
   * 创建标题
   */
  createTitle(width, _height) {
    const modeNames = {
      identify: '🔍 图形识别',
      angles: '📐 角的世界',
      triangle: '🔺 三角形探秘',
      area: '📏 面积挑战',
      transform: '🔄 图形运动',
      solid: '🧊 立体工坊',
      circle: '⭕ 圆的奥秘',
      views: '👁️ 三视图'
    };

    this.add.text(width / 2, 30, modeNames[this.mode] || '几何王国', {
      font: 'bold 24px Microsoft YaHei',
      color: '#ffffff',
      stroke: '#334155',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 分数显示
    this.scoreText = this.add.text(width - 20, 30, `得分：${this.score}`, {
      font: 'bold 18px Microsoft YaHei',
      color: '#fbbf24'
    }).setOrigin(1, 0.5);
  }

  /**
   * 下一题
   */
  nextQuestion() {
    const { width, height } = this.scale;

    // 清除旧选项和视觉元素
    this.clearOptions();

    this.totalQuestions++;

    // 生成题目
    const question = generateQuestion(this.mode, this.grade);
    this.currentQuestion = question;

    // 显示题目
    this.createQuestionDisplay(width, height, question);
    // 创建模式专属视觉
    this.createModeVisuals(width, height, question);
    // 显示选项
    this.createOptions(width, height, question);
  }

  /**
   * 清除选项按钮和模式视觉元素
   */
  clearOptions() {
    if (this.optionButtons) {
      this.optionButtons.forEach(btn => btn.bg.destroy());
      this.optionButtons.forEach(btn => btn.label.destroy());
      this.optionButtons = [];
    }
    if (this.questionText) {
      this.questionText.destroy();
      this.questionText = null;
    }
    if (this.questionBg) {
      this.questionBg.destroy();
      this.questionBg = null;
    }
    // 清除模式视觉元素
    if (this._modeGraphics) {
      this._modeGraphics.forEach(g => {
        if (g && g.destroy) g.destroy();
      });
      this._modeGraphics = [];
    }
  }

  /**
   * 显示题目文字
   */
  createQuestionDisplay(width, height, question) {
    const qY = height * 0.32;

    // 题目背景
    this.questionBg = this.add.rectangle(width / 2, qY, width * 0.8, 80, 0x1e293b);
    this.questionBg.setStrokeStyle(2, 0x3b82f6);

    // 题目文字
    this.questionText = this.add.text(width / 2, qY, question.question, {
      font: 'bold 20px Microsoft YaHei',
      color: '#ffffff',
      wordWrap: { width: width * 0.75, useAdvancedWrap: true },
      align: 'center'
    }).setOrigin(0.5);
  }

  /**
   * 创建模式专属视觉元素
   */
  createModeVisuals(width, height, question) {
    switch (this.mode) {
      case 'angles':
        this.renderAngleVisual(width, height, question);
        break;
      case 'area':
        this.renderAreaVisual(width, height, question);
        break;
      case 'transform':
        this.renderTransformVisual(width, height, question);
        break;
      case 'solid':
        this.renderSolidVisual(width, height, question);
        break;
      case 'circle':
        this.renderCircleVisual(width, height, question);
        break;
      case 'views':
        this.renderViewVisual(width, height, question);
        break;
      default:
        break;
    }
  }

  // ============ 角的世界：角度视觉 ============

  renderAngleVisual(width, height, question) {
    const g = this.add.graphics();
    const cx = width / 2;
    const cy = height * 0.52;
    const radius = 80;

    // 角度值 — 从题目中提取
    const degree = question.degree || 90;
    const rad = (degree * Math.PI) / 180;

    // 画第一条线（水平向右）
    g.lineStyle(3, 0x60a5fa);
    g.beginPath();
    g.moveTo(cx - radius, cy);
    g.lineTo(cx + radius, cy);
    g.strokePath();

    // 画第二条线（旋转 rad 角度）
    const x2 = cx + Math.cos(-rad) * radius;
    const y2 = cy + Math.sin(-rad) * radius;
    g.lineStyle(3, 0xf472b6);
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(x2, y2);
    g.strokePath();

    // 画弧（角度弧）
    const startAngle = 0;
    const endAngle = -rad;
    const steps = Math.max(3, Math.floor(degree / 5));
    g.lineStyle(2, 0xfbbf24, 0.8);
    g.beginPath();
    for (let i = 0; i <= steps; i++) {
      const a = startAngle + (endAngle - startAngle) * (i / steps);
      const px = cx + Math.cos(a) * (radius * 0.4);
      const py = cy + Math.sin(a) * (radius * 0.4);
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.strokePath();

    // 角度数字标签
    const labelX = cx + Math.cos(-rad / 2) * (radius * 0.55);
    const labelY = cy + Math.sin(-rad / 2) * (radius * 0.55);
    const degreeLabel = this.add.text(labelX, labelY, `${degree}°`, {
      font: 'bold 16px Microsoft YaHei',
      color: '#fbbf24'
    }).setOrigin(0.5);
    this._modeGraphics.push(degreeLabel);

    // 顶点小圆点
    g.fillStyle(0xffffff);
    g.fillCircle(cx, cy, 4);

    // 量角器辅助（半圆网格）
    if (degree >= 10) {
      g.lineStyle(1, 0x475569, 0.3);
      // 画几个关键角度线
      [30, 45, 60, 90, 120, 135, 150].forEach(deg => {
        if (deg > degree) return;
        const r = (deg * Math.PI) / 180;
        const tx = cx + Math.cos(-r) * (radius * 0.7);
        const ty = cy + Math.sin(-r) * (radius * 0.7);
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(tx, ty);
        g.strokePath();
        // 标小数字
        const degLabel = this.add.text(tx, ty + 10, `${deg}°`, {
          font: '10px Microsoft YaHei',
          color: '#64748b'
        }).setOrigin(0.5);
        this._modeGraphics.push(degLabel);
      });
    }

    this._modeGraphics.push(g);
  }

  // ============ 面积挑战：几何图形视觉 ============

  renderAreaVisual(width, height, question) {
    const g = this.add.graphics();
    const cx = width / 2;
    const cy = height * 0.50;
    const dim = question.dimensions || {};
    const shape = question.shape || 'square';

    g.lineStyle(3, 0x60a5fa);

    if (shape === 'square') {
      const side = dim.side || 4;
      const size = Math.min(80, side * 12);
      g.strokeRect(cx - size / 2, cy - size / 2, size, size);
      const txt1 = this.add.text(cx, cy + size / 2 + 15, `${side}厘米`, {
        font: '14px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txt1);
      const txt2 = this.add.text(cx + size / 2 + 15, cy, `${side}厘米`, {
        font: '14px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txt2);
    } else if (shape === 'rectangle') {
      const w = dim.width || 6;
      const h = dim.height || 4;
      const pw = Math.min(120, w * 12);
      const ph = Math.min(80, h * 12);
      g.strokeRect(cx - pw / 2, cy - ph / 2, pw, ph);
      const txt3 = this.add.text(cx, cy + ph / 2 + 15, `${w}厘米`, {
        font: '14px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txt3);
      const txt4 = this.add.text(cx + pw / 2 + 15, cy, `${h}厘米`, {
        font: '14px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txt4);
    } else if (shape === 'triangle') {
      const base = dim.base || 6;
      const height = dim.height || 5;
      const pw = Math.min(120, base * 10);
      const ph = Math.min(80, height * 10);
      // 顶点在上
      g.beginPath();
      g.moveTo(cx, cy - ph / 2);
      g.lineTo(cx - pw / 2, cy + ph / 2);
      g.lineTo(cx + pw / 2, cy + ph / 2);
      g.closePath();
      g.strokePath();
      // 底和高标签
      const txt5 = this.add.text(cx, cy + ph / 2 + 15, `底=${base}厘米`, {
        font: '12px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txt5);
      const txt6 = this.add.text(cx + pw / 2 + 25, cy, `高=${height}厘米`, {
        font: '12px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txt6);
    } else if (shape === 'parallelogram') {
      const base = dim.base || 6;
      const height = dim.height || 4;
      const pw = Math.min(110, base * 10);
      const ph = Math.min(70, height * 10);
      const skew = 25;
      g.beginPath();
      g.moveTo(cx - pw / 2 + skew, cy - ph / 2);
      g.lineTo(cx + pw / 2 + skew, cy - ph / 2);
      g.lineTo(cx + pw / 2, cy + ph / 2);
      g.lineTo(cx - pw / 2, cy + ph / 2);
      g.closePath();
      g.strokePath();
      const txt7 = this.add.text(cx, cy + ph / 2 + 15, `底=${base}厘米`, {
        font: '12px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txt7);
    } else if (shape === 'trapezoid') {
      const top = dim.top || 4;
      const bottom = dim.bottom || 8;
      const height = dim.height || 4;
      const pt = Math.min(70, top * 10);
      const pb = Math.min(120, bottom * 10);
      const ph = Math.min(70, height * 10);
      g.beginPath();
      g.moveTo(cx - pt / 2, cy - ph / 2);
      g.lineTo(cx + pt / 2, cy - ph / 2);
      g.lineTo(cx + pb / 2, cy + ph / 2);
      g.lineTo(cx - pb / 2, cy + ph / 2);
      g.closePath();
      g.strokePath();
      const txt8 = this.add.text(cx, cy + ph / 2 + 15, `上底=${top} 下底=${bottom}`, {
        font: '12px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txt8);
    }

    this._modeGraphics.push(g);
  }

  // ============ 图形运动：变换视觉 ============

  renderTransformVisual(width, height, question) {
    const g = this.add.graphics();
    const cx = width / 2;
    const cy = height * 0.48;
    const data = question.transformData || {};

    if (question.subType === 'translation') {
      // 画平移：两个位置 + 箭头
      const dist = (data.distance || 3) * 15;
      const size = 30;

      // 原始位置
      g.lineStyle(3, 0x60a5fa);
      g.strokeRect(cx - size / 2 - dist / 2, cy - size / 2, size, size);
      const txtA = this.add.text(cx - dist / 2, cy + size / 2 + 10, 'A', {
        font: '14px Microsoft YaHei', color: '#60a5fa'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtA);

      // 平移后位置（虚线）
      g.lineStyle(3, 0xf472b6, 0.6);
      g.strokeRect(cx + size / 2 + dist / 2, cy - size / 2, size, size);
      const txtB = this.add.text(cx + dist / 2, cy + size / 2 + 10, 'B', {
        font: '14px Microsoft YaHei', color: '#f472b6'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtB);

      // 箭头
      const arrowStartX = cx - dist / 2 + size / 2;
      const arrowEndX = cx + dist / 2 - size / 2;
      g.lineStyle(2, 0xfbbf24);
      g.beginPath();
      g.moveTo(arrowStartX, cy);
      g.lineTo(arrowEndX, cy);
      g.strokePath();
      // 箭头头
      g.beginPath();
      g.moveTo(arrowEndX, cy);
      g.lineTo(arrowEndX - 10, cy - 6);
      g.lineTo(arrowEndX - 10, cy + 6);
      g.closePath();
      g.fillStyle(0xfbbf24);
      g.fillPath();
    } else if (question.subType === 'rotation') {
      // 画旋转：原始 + 旋转后
      const r = 40;
      const deg = data.degrees || 90;
      const rad = (deg * Math.PI) / 180;

      // 中心点 O
      g.fillStyle(0xffffff);
      g.fillCircle(cx, cy, 4);
      const txtO = this.add.text(cx + 8, cy - 8, 'O', {
        font: '14px Microsoft YaHei', color: '#ffffff'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtO);

      // 原始位置（右侧一个点）
      g.fillStyle(0x60a5fa);
      g.fillCircle(cx + r, cy, 6);
      const txtA2 = this.add.text(cx + r, cy + 15, 'A', {
        font: '14px Microsoft YaHei', color: '#60a5fa'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtA2);

      // 旋转弧线
      g.lineStyle(2, 0xfbbf24, 0.6);
      g.beginPath();
      const steps2 = Math.max(3, Math.floor(deg / 10));
      for (let i = 0; i <= steps2; i++) {
        const a = (deg * i / steps2 * Math.PI) / 180;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();

      // 旋转后位置
      const tx = cx + Math.cos(rad) * r;
      const ty = cy + Math.sin(rad) * r;
      g.fillStyle(0xf472b6);
      g.fillCircle(tx, ty, 6);
      const txtAprime = this.add.text(tx, ty + 15, 'A\'', {
        font: '14px Microsoft YaHei', color: '#f472b6'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtAprime);

      // 角度标签
      const midAngle = rad / 2;
      const lx = cx + Math.cos(midAngle) * (r * 0.6);
      const ly = cy + Math.sin(midAngle) * (r * 0.6);
      const txtDeg = this.add.text(lx, ly, `${deg}°`, {
        font: '12px Microsoft YaHei', color: '#fbbf24'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtDeg);
    } else if (question.subType === 'symmetry') {
      // 轴对称
      const size = 35;
      const isSymmetric = data.isSymmetric;

      // 画对称轴（竖线）
      g.lineStyle(2, 0x64748b, 0.5);
      g.beginPath();
      g.moveTo(cx, cy - size - 10);
      g.lineTo(cx, cy + size + 10);
      g.strokePath();

      if (isSymmetric) {
        // 左侧半
        g.lineStyle(3, 0x60a5fa);
        g.beginPath();
        g.moveTo(cx - size, cy);
        g.lineTo(cx, cy - size);
        g.lineTo(cx, cy + size);
        g.closePath();
        g.strokePath();
        // 右侧镜像
        g.lineStyle(3, 0xf472b6, 0.6);
        g.beginPath();
        g.moveTo(cx + size, cy);
        g.lineTo(cx, cy - size);
        g.lineTo(cx, cy + size);
        g.closePath();
        g.strokePath();
      } else {
        // 不对称图形
        g.lineStyle(3, 0x60a5fa);
        g.beginPath();
        g.moveTo(cx - size, cy - size);
        g.lineTo(cx, cy - size / 2);
        g.lineTo(cx - size / 2, cy + size);
        g.closePath();
        g.strokePath();
      }
    }

    this._modeGraphics.push(g);
  }

  // ============ 立体工坊：立体图形视觉 ============

  renderSolidVisual(width, height, question) {
    const g = this.add.graphics();
    const cx = width / 2;
    const cy = height * 0.50;
    const dim = question.dimensions || {};
    const solid = question.solid || 'cube';

    g.lineStyle(2, 0x60a5fa);

    if (solid === 'cube') {
      const side = dim.side || 3;
      const s = Math.min(70, side * 15);
      const offset = s * 0.35;

      // 前面
      g.strokeRect(cx - s / 2, cy - s / 2, s, s);
      // 后面（偏移）
      g.strokeRect(cx - s / 2 + offset, cy - s / 2 - offset, s, s);
      // 连接
      g.beginPath();
      g.moveTo(cx - s / 2, cy - s / 2);
      g.lineTo(cx - s / 2 + offset, cy - s / 2 - offset);
      g.moveTo(cx + s / 2, cy - s / 2);
      g.lineTo(cx + s / 2 + offset, cy - s / 2 - offset);
      g.moveTo(cx - s / 2, cy + s / 2);
      g.lineTo(cx - s / 2 + offset, cy + s / 2 - offset);
      g.moveTo(cx + s / 2, cy + s / 2);
      g.lineTo(cx + s / 2 + offset, cy + s / 2 - offset);
      g.strokePath();

      const txtCube = this.add.text(cx, cy + s / 2 + 18, `棱长=${side}厘米`, {
        font: '12px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtCube);
    } else if (solid === 'cuboid') {
      const w = Math.min(90, (dim.width || 4) * 12);
      const h = Math.min(60, (dim.height || 3) * 12);
      const d = Math.min(40, (dim.depth || 2) * 12);
      const offset = d * 0.5;

      // 前面
      g.strokeRect(cx - w / 2, cy - h / 2, w, h);
      // 后面
      g.strokeRect(cx - w / 2 + offset, cy - h / 2 - offset, w, h);
      // 连接
      g.beginPath();
      g.moveTo(cx - w / 2, cy - h / 2);
      g.lineTo(cx - w / 2 + offset, cy - h / 2 - offset);
      g.moveTo(cx + w / 2, cy - h / 2);
      g.lineTo(cx + w / 2 + offset, cy - h / 2 - offset);
      g.moveTo(cx - w / 2, cy + h / 2);
      g.lineTo(cx - w / 2 + offset, cy + h / 2 - offset);
      g.moveTo(cx + w / 2, cy + h / 2);
      g.lineTo(cx + w / 2 + offset, cy + h / 2 - offset);
      g.strokePath();

      const txtCuboid = this.add.text(cx, cy + h / 2 + 18, `${dim.width||4}×${dim.depth||2}×${dim.height||3}厘米`, {
        font: '12px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtCuboid);
    } else if (solid === 'cylinder') {
      const r = Math.min(50, (dim.radius || 2) * 14);
      const h = Math.min(60, (dim.height || 4) * 10);

      // 顶面椭圆
      g.strokeEllipse(cx, cy - h / 2, r * 2, r * 0.5);
      // 底面椭圆
      g.strokeEllipse(cx, cy + h / 2, r * 2, r * 0.5);
      // 侧面
      g.beginPath();
      g.moveTo(cx - r, cy - h / 2);
      g.lineTo(cx - r, cy + h / 2);
      g.moveTo(cx + r, cy - h / 2);
      g.lineTo(cx + r, cy + h / 2);
      g.strokePath();

      const txtCyl = this.add.text(cx, cy + h / 2 + 18, `r=${dim.radius||2} h=${dim.height||4}`, {
        font: '12px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtCyl);
    } else if (solid === 'cone') {
      const r = Math.min(50, (dim.radius || 2) * 14);
      const h = Math.min(60, (dim.height || 4) * 10);

      // 底面椭圆
      g.strokeEllipse(cx, cy + h / 2, r * 2, r * 0.5);
      // 侧面（从顶点到底面两侧）
      g.beginPath();
      g.moveTo(cx, cy - h / 2);
      g.lineTo(cx - r, cy + h / 2);
      g.moveTo(cx, cy - h / 2);
      g.lineTo(cx + r, cy + h / 2);
      g.strokePath();

      const txtCone = this.add.text(cx, cy + h / 2 + 18, `r=${dim.radius||2} h=${dim.height||4}`, {
        font: '12px Microsoft YaHei', color: '#94a3b8'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtCone);
    }

    this._modeGraphics.push(g);
  }

  // ============ 圆的奥秘：圆相关视觉 ============

  renderCircleVisual(width, height, question) {
    const g = this.add.graphics();
    const cx = width / 2;
    const cy = height * 0.50;
    const radius = 60;
    const subType = question.subType || 'radiusDiameter';
    const data = question.circleData || {};

    // 画圆
    g.lineStyle(3, 0x60a5fa);
    g.strokeCircle(cx, cy, radius);

    if (subType === 'radiusDiameter') {
      // 画半径
      const r = data.radius || 3;
      const pct = Math.min(1, r / 6);
      const endX = cx + radius * pct;
      g.lineStyle(2, 0xf472b6);
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(endX, cy);
      g.strokePath();
      // 圆心
      g.fillStyle(0xffffff);
      g.fillCircle(cx, cy, 3);
      // 标签
      const txtR = this.add.text((cx + endX) / 2, cy - 12, `r=${r}厘米`, {
        font: '13px Microsoft YaHei', color: '#f472b6'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtR);

      // 画直径
      const dEndX = cx + radius;
      g.lineStyle(2, 0x4ade80, 0.6);
      g.beginPath();
      g.moveTo(cx - dEndX + cx, cy);
      g.lineTo(dEndX, cy);
      g.strokePath();
      const txtD = this.add.text(cx, cy - 25, `d=${data.diameter || r*2}厘米`, {
        font: '13px Microsoft YaHei', color: '#4ade80'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtD);
    } else if (subType === 'circumference') {
      // 画圆周标注
      g.lineStyle(2, 0xf472b6);
      const cr = radius + 10;
      g.beginPath();
      for (let i = 0; i <= 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const px = cx + Math.cos(a) * cr;
        const py = cy + Math.sin(a) * cr;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();
      const txtC = this.add.text(cx, cy + radius + 20, `C=2πr`, {
        font: '14px Microsoft YaHei', color: '#f472b6'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtC);

      // 半径
      g.lineStyle(2, 0x60a5fa);
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + radius, cy);
      g.strokePath();
      const txtR2 = this.add.text(cx + radius / 2, cy - 12, 'r', {
        font: '13px Microsoft YaHei', color: '#60a5fa'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtR2);

      g.fillStyle(0xffffff);
      g.fillCircle(cx, cy, 3);
    } else if (subType === 'sector') {
      // 扇形
      const sectorAngle = Math.PI / 2; // 90度
      g.fillStyle(0x3b82f6, 0.2);
      g.beginPath();
      g.moveTo(cx, cy);
      for (let i = 0; i <= 10; i++) {
        const a = -sectorAngle * (i / 10);
        const px = cx + Math.cos(a) * radius;
        const py = cy + Math.sin(a) * radius;
        if (i === 0) g.lineTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fillPath();

      // 扇形弧线
      g.lineStyle(3, 0xfbbf24);
      g.beginPath();
      for (let i = 0; i <= 10; i++) {
        const a = -sectorAngle * (i / 10);
        const px = cx + Math.cos(a) * radius;
        const py = cy + Math.sin(a) * radius;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();

      // 半径
      g.lineStyle(2, 0x60a5fa);
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + radius, cy);
      g.lineTo(cx + Math.cos(-sectorAngle) * radius, cy + Math.sin(-sectorAngle) * radius);
      g.strokePath();
      g.fillStyle(0xffffff);
      g.fillCircle(cx, cy, 3);
    }

    this._modeGraphics.push(g);
  }

  // ============ 三视图：立体观察视觉 ============

  renderViewVisual(width, height, question) {
    const g = this.add.graphics();
    const cx = width / 2;
    const cy = height * 0.48;
    const direction = question.subType || '正面';

    // 画一个简易3D方块组
    g.lineStyle(2, 0x60a5fa);

    // 3个方块组成L形（俯视角度）
    const bs = 25;

    // 底部方块
    g.fillStyle(0x3b82f6, 0.3);
    g.fillRect(cx - bs - 5, cy - bs / 2, bs, bs);
    g.strokeRect(cx - bs - 5, cy - bs / 2, bs, bs);
    // 底部方块2
    g.fillRect(cx + 5, cy - bs / 2, bs, bs);
    g.strokeRect(cx + 5, cy - bs / 2, bs, bs);
    // 顶部方块
    g.fillRect(cx + 5, cy - bs - bs / 2, bs, bs);
    g.strokeRect(cx + 5, cy - bs - bs / 2, bs, bs);

    // 视角方向指示
    const arrowColors = { '正面': 0xf472b6, '侧面': 0x4ade80, '上面': 0xfbbf24 };
    const ac = arrowColors[direction] || 0xffffff;

    g.lineStyle(2, ac);
    if (direction === '正面') {
      // 从下往上看
      g.beginPath();
      g.moveTo(cx, cy + bs);
      g.lineTo(cx, cy + bs + 20);
      g.lineTo(cx - 6, cy + bs + 14);
      g.moveTo(cx, cy + bs + 20);
      g.lineTo(cx + 6, cy + bs + 14);
      g.strokePath();
      const txtFront = this.add.text(cx, cy + bs + 28, '正面→', {
        font: '12px Microsoft YaHei', color: '#f472b6'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtFront);
    } else if (direction === '侧面') {
      g.beginPath();
      g.moveTo(cx + bs + 5, cy);
      g.lineTo(cx + bs + 25, cy);
      g.lineTo(cx + bs + 19, cy - 6);
      g.moveTo(cx + bs + 25, cy);
      g.lineTo(cx + bs + 19, cy + 6);
      g.strokePath();
      const txtSide = this.add.text(cx + bs + 30, cy, '→侧面', {
        font: '12px Microsoft YaHei', color: '#4ade80'
      }).setOrigin(0, 0.5);
      this._modeGraphics.push(txtSide);
    } else {
      g.beginPath();
      g.moveTo(cx, cy - bs - 5);
      g.lineTo(cx, cy - bs - 25);
      g.lineTo(cx - 6, cy - bs - 19);
      g.moveTo(cx, cy - bs - 25);
      g.lineTo(cx + 6, cy - bs - 19);
      g.strokePath();
      const txtTop = this.add.text(cx, cy - bs - 30, '上面→', {
        font: '12px Microsoft YaHei', color: '#fbbf24'
      }).setOrigin(0.5);
      this._modeGraphics.push(txtTop);
    }

    this._modeGraphics.push(g);
  }

  /**
   * 创建选项
   */
  createOptions(width, height, question) {
    const choices = question.choices || [];
    const optionWidth = 160;
    const optionHeight = 55;
    const spacing = 16;
    const rows = Math.ceil(choices.length / 2);
    const cols = Math.min(choices.length, 2);
    const totalWidth = cols * optionWidth + (cols - 1) * spacing;
    const totalHeight = rows * optionHeight + (rows - 1) * spacing;
    const startX = (width - totalWidth) / 2 + optionWidth / 2;
    const startY = height * 0.68 - totalHeight / 2 + optionHeight / 2;

    choices.forEach((choice, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = startX + col * (optionWidth + spacing);
      const y = startY + row * (optionHeight + spacing);

      const bg = this.add.rectangle(x, y, optionWidth, optionHeight, 0x334155);
      bg.setStrokeStyle(2, 0x64748b);
      bg.setInteractive({ useHandCursor: true });

      const label = this.add.text(x, y, `${choice}`, {
        font: 'bold 18px Microsoft YaHei',
        color: '#ffffff'
      }).setOrigin(0.5);

      bg.on('pointerover', () => bg.setFillStyle(0x475569));
      bg.on('pointerout', () => bg.setFillStyle(0x334155));
      bg.on('pointerdown', () => this.selectOption(choice, bg, label));

      this.optionButtons.push({ bg, label, choice });
    });
  }

  /**
   * 选择选项
   */
  selectOption(selected, button) {
    // 禁用所有按钮
    this.optionButtons.forEach(btn => {
      btn.bg.disableInteractive();
    });

    const isCorrect = String(selected) === String(this.currentQuestion.answer);

    if (isCorrect) {
      button.setFillStyle(0x22c55e);
      this.score += 10;
      this.correctCount++;
      this.scoreText.setText(`得分：${this.score}`);
    } else {
      button.setFillStyle(0xef4444);
      // 高亮正确答案
      this.optionButtons.forEach(btn => {
        if (String(btn.choice) === String(this.currentQuestion.answer)) {
          btn.bg.setFillStyle(0x22c55e);
        }
      });
    }

    // 延迟后下一题
    this._setTimeout(() => {
      if (this.totalQuestions < 10) {
        this.nextQuestion();
      } else {
        this.endGame();
      }
    }, TURN_DELAY_MS);
  }

  /**
   * 结束游戏
   */
  endGame() {
    const { width, height } = this.scale;

    this.clearOptions();

    // 结果背景
    const dialog = this.add.rectangle(width / 2, height / 2, 400, 280, 0x0f1729);
    dialog.setStrokeStyle(3, 0x3b82f6);

    // 结果标题
    this.add.text(width / 2, height / 2 - 90, '🎉 挑战完成！', {
      font: 'bold 28px Microsoft YaHei',
      color: '#fbbf24'
    }).setOrigin(0.5);

    // 统计
    this.add.text(width / 2, height / 2 - 40, `答对：${this.correctCount} / ${this.totalQuestions}`, {
      font: 'bold 20px Microsoft YaHei',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, `得分：${this.score}`, {
      font: 'bold 20px Microsoft YaHei',
      color: '#4ade80'
    }).setOrigin(0.5);

    // 评级
    const rate = this.correctCount / this.totalQuestions;
    let starText = '';
    if (rate >= 0.9) starText = '⭐⭐⭐ 太棒了！';
    else if (rate >= 0.7) starText = '⭐⭐ 很好！';
    else if (rate >= 0.5) starText = '⭐ 继续加油！';
    else starText = '💪 再试一次！';

    this.add.text(width / 2, height / 2 + 40, starText, {
      font: 'bold 22px Microsoft YaHei',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 返回按钮
    const btnBg = this.add.rectangle(width / 2, height / 2 + 105, 160, 48, 0x3b82f6);
    btnBg.setStrokeStyle(2, 0xffffff);
    btnBg.setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height / 2 + 105, '返回', {
      font: 'bold 20px Microsoft YaHei',
      color: '#ffffff'
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x2563eb));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x3b82f6));
    btnBg.on('pointerdown', () => {
      if (this.onComplete) {
        this.onComplete({ score: this.score, correctCount: this.correctCount, total: this.totalQuestions });
        // onComplete triggers handleGameComplete → destroyGame → game.destroy(true),
        // which fully destroys the Phaser game including all scenes
      } else {
        this.scene.stop('GeometryScene');
      }
    });
  }
}
