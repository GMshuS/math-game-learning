/**
 * 英语语音管理器 - Web Speech API 封装
 * 单例模式，参考 src/utils/audioManager.js
 */
class EnglishSpeech {
  constructor() {
    this.synth = null;
    this.voice = null;
    this._supported = false;
    this._initialized = false;
    this._onVoicesChanged = null;
    this._voicesChangedTimer = null;
  }

  /**
   * 检测浏览器是否支持 SpeechSynthesis
   * @returns {boolean}
   */
  isSupported() {
    return 'speechSynthesis' in window;
  }

  /**
   * 清理 voiceschanged 事件监听器和超时定时器
   */
  _cleanupVoicesChanged() {
    if (this._onVoicesChanged && this.synth) {
      this.synth.removeEventListener('voiceschanged', this._onVoicesChanged);
      this._onVoicesChanged = null;
    }
    if (this._voicesChangedTimer) {
      clearTimeout(this._voicesChangedTimer);
      this._voicesChangedTimer = null;
    }
  }

  /**
   * 初始化语音系统，预选取 en-US 语音
   * @returns {Promise<boolean>} 初始化是否成功
   */
  init() {
    if (this._initialized) {
      return Promise.resolve(this._supported);
    }

    this._supported = this.isSupported();

    if (!this._supported) {
      console.warn('EnglishSpeech: 当前浏览器不支持 Web Speech API');
      this._initialized = true;
      return Promise.resolve(false);
    }

    this.synth = window.speechSynthesis;

    return new Promise((resolve) => {
      // voices 可能在页面加载后异步加载
      const tryLoadVoices = () => {
        const voices = this.synth.getVoices();

        if (voices.length > 0) {
          // 优先选取 en-US 语音
          this.voice = voices.find(v => v.lang === 'en-US') ||
                       voices.find(v => v.lang.startsWith('en')) ||
                       voices[0];
          this._initialized = true;
          this._supported = true;
          this._cleanupVoicesChanged();
          resolve(true);
          return;
        }

        // 如果还没有语音，等待 voiceschanged 事件
        if (typeof window !== 'undefined') {
          this._onVoicesChanged = () => {
            const updatedVoices = this.synth.getVoices();
            this.voice = updatedVoices.find(v => v.lang === 'en-US') ||
                         updatedVoices.find(v => v.lang.startsWith('en')) ||
                         updatedVoices[0];
            this._initialized = true;
            this._supported = true;
            this._cleanupVoicesChanged();
            resolve(true);
          };
          window.speechSynthesis.addEventListener('voiceschanged', this._onVoicesChanged);
          // 设置超时防止无限等待
          this._voicesChangedTimer = setTimeout(() => {
            if (!this._initialized) {
              this._initialized = true;
              this._supported = true;
              this._cleanupVoicesChanged();
              resolve(true);
            }
          }, 3000);
        } else {
          this._initialized = true;
          resolve(true);
        }
      };

      tryLoadVoices();
    });
  }

  /**
   * 朗读指定的英文文本
   * @param {string} text 要朗读的文本
   * @param {object} [options] 可选项
   * @param {number} [options.rate=0.9] 语速 (0.1 - 10)
   * @param {number} [options.pitch=1] 音高 (0 - 2)
   * @param {number} [options.volume=1] 音量 (0 - 1)
   * @param {Function} [options.onEnd] 朗读结束回调
   * @param {Function} [options.onStart] 朗读开始回调
   * @param {Function} [options.onError] 朗读出错回调
   */
  speak(text, options = {}) {
    if (!this._supported || !this.synth) {
      if (options.onError) {
        options.onError(new Error('SpeechSynthesis not supported'));
      }
      return;
    }

    // 取消当前正在进行的朗读
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);

    // 应用语音设置
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.lang = 'en-US';
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;

    // 绑定回调
    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }
    if (options.onStart) {
      utterance.onstart = options.onStart;
    }
    if (options.onError) {
      utterance.onerror = options.onError;
    }

    this.synth.speak(utterance);
  }

  /**
   * 停止当前语音朗读
   */
  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * 暂停朗读
   */
  pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  /**
   * 恢复暂停的朗读
   */
  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * 是否正在朗读中
   * @returns {boolean}
   */
  isSpeaking() {
    return this.synth ? this.synth.speaking : false;
  }

  /**
   * 销毁语音管理器，清理事件监听
   */
  destroy() {
    this.stop();
    this._cleanupVoicesChanged();
    this.synth = null;
    this._initialized = false;
    this._supported = false;
  }
}

// 创建并导出单例
const englishSpeech = new EnglishSpeech();

export default englishSpeech;
