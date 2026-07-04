/**
 * Phaser 钟表场景 — 绘制模拟钟面
 * 通过 init(data) 接收要显示的时间
 * 支持指针平滑动画
 */
import Phaser from 'phaser';

export default class ClockScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ClockScene' });

    this.hour = 0;
    this.minute = 0;
    this.targetHour = 0;
    this.targetMinute = 0;
    this.clockRadius = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.hourHand = null;
    this.minuteHand = null;
    this.animating = false;
    this._timeoutIds = [];
    this._destroyed = false;
  }

  /**
   * 安全的 setTimeout
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
   * @param {object} data
   * @param {number} data.hour - 要显示的小时 (1-12)
   * @param {number} data.minute - 要显示的分钟 (0-59)
   * @param {boolean} data.animate - 是否动画过渡（默认 true）
   * @param {number} data.grade - 年级（用于样式调整）
   */
  init(data) {
    this.targetHour = data.hour || 0;
    this.targetMinute = data.minute || 0;
    this.targetAnimate = data.animate !== false;
    this.grade = data.grade || 1;
    this.onComplete = data.onComplete || null;
  }

  create() {
    this.events.on('shutdown', this.cleanup, this);
    this.events.on('destroy', this.cleanup, this);

    const { width, height } = this.scale;
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.clockRadius = Math.min(width, height) * 0.35;

    // 绘制钟表
    this.drawClockFace();

    // 创建指针（起始在 12:00 位置）
    this.createHands();

    // 动画到目标时间
    if (this.targetAnimate) {
      this.animateToTime(this.targetHour, this.targetMinute);
    } else {
      this.setTimeInstant(this.targetHour, this.targetMinute);
    }
  }

  /**
   * 绘制钟表盘面
   */
  drawClockFace() {
    const { centerX, centerY, clockRadius } = this;

    // 钟面外圈
    const outerCircle = this.add.circle(centerX, centerY, clockRadius + 10, 0xffffff);
    outerCircle.setStrokeStyle(4, 0x334155);

    // 钟面底色
    this.add.circle(centerX, centerY, clockRadius, 0xf8fafc);

    // 刻度线和数字
    const innerRadius = clockRadius * 0.88;
    const numberRadius = clockRadius * 0.76;

    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const isHourMark = true;

      // 刻度线
      const outerX = centerX + Math.cos(angle) * (clockRadius * 0.92);
      const outerY = centerY + Math.sin(angle) * (clockRadius * 0.92);
      const innerX = centerX + Math.cos(angle) * innerRadius;
      const innerY = centerY + Math.sin(angle) * innerRadius;

      const graphics = this.add.graphics();
      graphics.lineStyle(isHourMark ? 3 : 1, 0x334155);
      graphics.beginPath();
      graphics.moveTo(outerX, outerY);
      graphics.lineTo(innerX, innerY);
      graphics.strokePath();

      // 数字
      const numX = centerX + Math.cos(angle) * numberRadius;
      const numY = centerY + Math.sin(angle) * numberRadius;
      this.add.text(numX, numY, String(i), {
        font: `bold ${Math.round(clockRadius * 0.12)}px Microsoft YaHei`,
        color: '#1e293b'
      }).setOrigin(0.5);
    }

    // 分钟刻度线（在整点之间的小刻度）
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue; // 整点刻度已画
      const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const outerX = centerX + Math.cos(angle) * (clockRadius * 0.92);
      const outerY = centerY + Math.sin(angle) * (clockRadius * 0.92);
      const innerX = centerX + Math.cos(angle) * (clockRadius * 0.88);
      const innerY = centerY + Math.sin(angle) * (clockRadius * 0.88);

      const miniGraphics = this.add.graphics();
      miniGraphics.lineStyle(1, 0x94a3b8);
      miniGraphics.beginPath();
      miniGraphics.moveTo(outerX, outerY);
      miniGraphics.lineTo(innerX, innerY);
      miniGraphics.strokePath();
    }

    // 中心圆点
    this.add.circle(centerX, centerY, clockRadius * 0.04, 0x334155);
  }

  /**
   * 创建时针和分针
   */
  createHands() {
    const { centerX, centerY, clockRadius } = this;

    // 时针（较短、较粗）
    const hourLength = clockRadius * 0.5;
    const hourWidth = clockRadius * 0.06;
    const hourGraphics = this.add.graphics();
    hourGraphics.lineStyle(hourWidth, 0x1e293b);
    hourGraphics.beginPath();
    hourGraphics.moveTo(centerX, centerY);
    // 起始在 12:00
    const hourAngle = -Math.PI / 2;
    hourGraphics.lineTo(
      centerX + Math.cos(hourAngle) * hourLength,
      centerY + Math.sin(hourAngle) * hourLength
    );
    hourGraphics.strokePath();
    this.hourHand = hourGraphics;

    // 分针（较长、较细）
    const minuteLength = clockRadius * 0.72;
    const minuteWidth = clockRadius * 0.035;
    const minuteGraphics = this.add.graphics();
    minuteGraphics.lineStyle(minuteWidth, 0x3b82f6);
    minuteGraphics.beginPath();
    minuteGraphics.moveTo(centerX, centerY);
    // 起始在 12:00
    const minuteAngle = -Math.PI / 2;
    minuteGraphics.lineTo(
      centerX + Math.cos(minuteAngle) * minuteLength,
      centerY + Math.sin(minuteAngle) * minuteLength
    );
    minuteGraphics.strokePath();
    this.minuteHand = minuteGraphics;
  }

  /**
   * 计算指针角度
   * 0 度 = 12:00, 顺时针递增
   */
  getHourAngle(hour, minute) {
    return ((hour % 12) + minute / 60) / 12 * Math.PI * 2 - Math.PI / 2;
  }

  getMinuteAngle(minute) {
    return minute / 60 * Math.PI * 2 - Math.PI / 2;
  }

  /**
   * 重绘指针到指定角度
   */
  redrawHands(hourAngle, minuteAngle) {
    const { centerX, centerY, clockRadius } = this;

    // 时针
    const hourLength = clockRadius * 0.5;
    const hourWidth = clockRadius * 0.06;
    if (this.hourHand) this.hourHand.destroy();
    const hg = this.add.graphics();
    hg.lineStyle(hourWidth, 0x1e293b);
    hg.beginPath();
    hg.moveTo(centerX, centerY);
    hg.lineTo(
      centerX + Math.cos(hourAngle) * hourLength,
      centerY + Math.sin(hourAngle) * hourLength
    );
    hg.strokePath();
    this.hourHand = hg;

    // 分针
    const minuteLength = clockRadius * 0.72;
    const minuteWidth = clockRadius * 0.035;
    if (this.minuteHand) this.minuteHand.destroy();
    const mg = this.add.graphics();
    mg.lineStyle(minuteWidth, 0x3b82f6);
    mg.beginPath();
    mg.moveTo(centerX, centerY);
    mg.lineTo(
      centerX + Math.cos(minuteAngle) * minuteLength,
      centerY + Math.sin(minuteAngle) * minuteLength
    );
    mg.strokePath();
    this.minuteHand = mg;
  }

  /**
   * 立即设置时间（无动画）
   */
  setTimeInstant(hour, minute) {
    const hourAngle = this.getHourAngle(hour, minute);
    const minuteAngle = this.getMinuteAngle(minute);
    this.redrawHands(hourAngle, minuteAngle);
    this.hour = hour;
    this.minute = minute;

    if (this.onComplete) {
      this.onComplete({ hour, minute });
    }
  }

  /**
   * 动画过渡到目标时间
   */
  animateToTime(targetHour, targetMinute) {
    if (this.animating) return;
    this.animating = true;

    const startHourAngle = this.getHourAngle(this.hour, this.minute);
    const startMinuteAngle = this.getMinuteAngle(this.minute);
    const targetHourAngle = this.getHourAngle(targetHour, targetMinute);
    const targetMinuteAngle = this.getMinuteAngle(targetMinute);

    const duration = 800; // 动画时长（毫秒）
    const startTime = Date.now();

    const animate = () => {
      if (this._destroyed) return;
      if (!this.scene || !this.scene.isActive()) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      // 缓动函数（ease-out）
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentHourAngle = startHourAngle + (targetHourAngle - startHourAngle) * eased;
      const currentMinuteAngle = startMinuteAngle + (targetMinuteAngle - startMinuteAngle) * eased;

      this.redrawHands(currentHourAngle, currentMinuteAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.animating = false;
        this.hour = targetHour;
        this.minute = targetMinute;

        if (this.onComplete) {
          this.onComplete({ hour: targetHour, minute: targetMinute });
        }
      }
    };

    animate();
  }
}
