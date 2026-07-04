<template>
  <div class="voice-compare">
    <!-- 顶部标题 -->
    <div class="header">
      <div class="header-left">
        <h3>🎤 语音跟读</h3>
      </div>
      <div class="header-right">
        <button class="btn-back" @click="handleSkip">← 返回</button>
      </div>
    </div>

    <!-- 句子展示 -->
    <div class="sentence-area">
      <p class="prompt-label">请跟读以下句子：</p>
      <p class="sentence-text">{{ expectedText }}</p>
    </div>

    <!-- 阶段: idle — 闲置 -->
    <div v-if="phase === 'idle'" class="action-area">
      <div class="action-buttons">
        <button
          class="btn-action btn-demo"
          :disabled="!speechSupported"
          @click="playDemo"
        >
          🔊 听示范
        </button>
        <button
          class="btn-action btn-skip"
          @click="handleSkip"
        >
          ⏭️ 跳过
        </button>
      </div>
      <p v-if="!speechSupported" class="hint-text hint-error">
        当前浏览器不支持语音合成，无法播放示范朗读
      </p>
    </div>

    <!-- 阶段: demoDone — 示范播放完成 -->
    <div v-if="phase === 'demoDone'" class="action-area">
      <div class="action-buttons">
        <button
          class="btn-action btn-demo"
          @click="playDemo"
        >
          🔊 再听一次
        </button>
        <button
          v-if="recognitionSupported"
          class="btn-action btn-record"
          @click="startRecording"
        >
          🎤 开始录音
        </button>
        <button
          class="btn-action btn-skip"
          @click="handleSkip"
        >
          跳过
        </button>
      </div>
      <p v-if="!recognitionSupported" class="hint-text hint-warning">
        浏览器不支持语音识别，可跳过此项练习
      </p>
    </div>

    <!-- 阶段: recording — 录音中 -->
    <div v-if="phase === 'recording'" class="recording-area">
      <div class="recording-indicator">
        <span class="pulse-dot" />
        <span class="recording-text">录音中...</span>
      </div>
      <div class="waveform">
        <span v-for="i in 5" :key="i" class="wave-bar" />
      </div>
      <div class="timeout-hint">自动停止倒计时 {{ recordingTimeLeft }}s</div>
      <button class="btn-action btn-stop" @click="stopRecording">
        ■ 停止录音
      </button>
    </div>

    <!-- 阶段: processing — 处理中 -->
    <div v-if="phase === 'processing'" class="processing-area">
      <div class="processing-indicator">
        <span class="spinner" />
        <span>正在识别对比...</span>
      </div>
    </div>

    <!-- 阶段: result — 结果显示 -->
    <div v-if="phase === 'result'" class="result-area">
      <div class="compare-result">
        <div class="word-row">
          <div
            v-for="(item, index) in compareResult"
            :key="index"
            class="word-item"
            :class="getWordClass(item.status)"
          >
            <span class="word-text">{{ item.word || item.expected }}</span>
            <span class="word-status-icon">{{ getStatusIcon(item.status) }}</span>
            <span v-if="item.status === 'missing' && item.expected" class="word-expected">
              应为: {{ item.expected }}
            </span>
          </div>
        </div>
        <div class="result-summary" :class="{ 'all-correct': allCorrect }">
          <template v-if="allCorrect">
            <span class="summary-icon">✅</span>
            <span class="summary-text">全部正确！太棒了！🎉</span>
          </template>
          <template v-else>
            <span class="summary-icon">📊</span>
            <span class="summary-text">
              正确 {{ correctCount }}/{{ totalWords }} 个词
            </span>
          </template>
        </div>
      </div>
      <div class="result-actions">
        <button class="btn-action btn-continue" @click="handleComplete">
          继续闯关
        </button>
        <button class="btn-action btn-retry" @click="resetAll">
          再说一次
        </button>
        <button class="btn-action btn-skip" @click="handleSkip">
          跳过
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import englishSpeech from '../utils/englishSpeech';
import englishRecognition from '../utils/englishRecognition';

const props = defineProps({
  expectedText: {
    type: String,
    required: true
  },
  autoStart: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['complete', 'skip']);

// ============ State ============
const phase = ref('idle');
const speechSupported = ref(false);
const recognitionSupported = ref(false);
const compareResult = ref([]);
const recordingTimeLeft = ref(8);
const recognizedText = ref('');

let recordingTimer = null;
let isComponentMounted = false;

// ============ Computed ============
const correctCount = computed(() => {
  return compareResult.value.filter(item => item.status === 'correct').length;
});

const totalWords = computed(() => {
  // 总词数以 expected 分词数为准
  return props.expectedText.trim().split(/\s+/).filter(Boolean).length;
});

const allCorrect = computed(() => {
  if (compareResult.value.length === 0) return false;
  const hasMissing = compareResult.value.some(item => item.status !== 'correct');
  return !hasMissing;
});

// ============ Methods ============

/**
 * 初始化：检测浏览器能力
 */
function init() {
  speechSupported.value = englishSpeech.isSupported();
  recognitionSupported.value = englishRecognition.isSupported();
}

/**
 * 播放示范朗读
 */
async function playDemo() {
  if (!speechSupported.value) return;

  const initialized = await englishSpeech.init();
  if (!initialized) return;

  englishSpeech.speak(props.expectedText, {
    rate: 0.9,
    onEnd: () => {
      if (isComponentMounted) {
        phase.value = 'demoDone';
      }
    },
    onError: () => {
      if (isComponentMounted) {
        phase.value = 'demoDone';
      }
    }
  });
}

/**
 * 开始录音
 */
async function startRecording() {
  try {
    const permitted = await englishRecognition.requestPermission();
    if (!permitted) {
      // 权限被拒绝，降级处理
      phase.value = 'demoDone';
      return;
    }

    phase.value = 'recording';
    recordingTimeLeft.value = 8;

    // 启动倒计时
    recordingTimer = setInterval(() => {
      recordingTimeLeft.value--;
      if (recordingTimeLeft.value <= 0) {
        stopRecording();
      }
    }, 1000);

    // 启动语音识别（用 Promise 方式）
    englishRecognition.startRecognition('en-US')
      .then((transcript) => {
        recognizedText.value = transcript;
        if (isComponentMounted && phase.value === 'recording') {
          stopRecordingTimer();
          processResult(transcript);
        }
      })
      .catch((error) => {
        console.warn('EnglishVoiceCompare: 语音识别失败', error);
        if (isComponentMounted) {
          stopRecordingTimer();
          // 即使识别失败也尝试用空结果对比
          processResult('');
        }
      });
  } catch (e) {
    console.warn('EnglishVoiceCompare: 启动录音失败', e);
    phase.value = 'demoDone';
  }
}

/**
 * 停止录音 - 用户主动停止
 */
function stopRecording() {
  stopRecordingTimer();
  englishRecognition.stopRecognition();
  // 如果没有识别结果，用空字符串
  if (!recognizedText.value) {
    processResult('');
  }
}

/**
 * 处理识别结果，与预期文本对比
 */
function processResult(recognized) {
  phase.value = 'processing';

  // 延迟一小段时间以显示处理动画
  setTimeout(() => {
    if (!isComponentMounted) return;

    const result = englishRecognition.compare(recognized, props.expectedText);
    compareResult.value = result;
    phase.value = 'result';
  }, 300);
}

/**
 * 获取单词状态对应的 CSS 类名
 */
function getWordClass(status) {
  switch (status) {
  case 'correct':
    return 'word-correct';
  case 'missing':
    return 'word-missing';
  case 'extra':
    return 'word-extra';
  default:
    return '';
  }
}

/**
 * 获取状态图标
 */
function getStatusIcon(status) {
  switch (status) {
  case 'correct':
    return '\u2713';
  case 'missing':
    return '\u2717';
  case 'extra':
    return '?';
  default:
    return '';
  }
}

/**
 * 停止录音计时器
 */
function stopRecordingTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
}

/**
 * 重置所有状态回到初始
 */
function resetAll() {
  stopRecordingTimer();
  englishRecognition.stopRecognition();
  englishSpeech.stop();
  phase.value = 'idle';
  compareResult.value = [];
  recognizedText.value = '';
  recordingTimeLeft.value = 8;
}

/**
 * 通知父组件完成
 */
function handleComplete() {
  emit('complete', {
    correctCount: correctCount.value,
    totalWords: totalWords.value,
    allCorrect: allCorrect.value
  });
}

/**
 * 通知父组件跳过
 */
function handleSkip() {
  stopRecordingTimer();
  englishRecognition.stopRecognition();
  englishSpeech.stop();
  emit('skip');
}

// ============ Lifecycle ============
onMounted(() => {
  isComponentMounted = true;
  init();

  if (props.autoStart && speechSupported.value) {
    // autoStart 为 true 时自动播放示范
    setTimeout(() => {
      playDemo();
    }, 500);
  }
});

onUnmounted(() => {
  isComponentMounted = false;
  stopRecordingTimer();
  englishRecognition.stopRecognition();
  englishSpeech.stop();
});
</script>

<style scoped>
.voice-compare {
  width: 100%;
  padding: 1.5rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* ========== 头部 ========== */
.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h3 {
  margin: 0;
  font-size: 1.4rem;
  color: #fbbf24;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-back {
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 18px;
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ========== 句子区域 ========== */
.sentence-area {
  text-align: center;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
}

.prompt-label {
  margin: 0 0 0.8rem;
  font-size: 0.95rem;
  opacity: 0.7;
}

.sentence-text {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #5eead4;
  letter-spacing: 0.05em;
  line-height: 1.4;
  word-break: break-word;
}

/* ========== 操作按钮区 ========== */
.action-area {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-action {
  padding: 0.75rem 1.8rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #fff;
}

.btn-action:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-demo {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.btn-demo:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
}

.btn-record {
  background: linear-gradient(135deg, #10b981, #059669);
}

.btn-record:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-stop {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.btn-stop:hover {
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.btn-continue {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.btn-continue:hover {
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.btn-retry {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.btn-retry:hover {
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.btn-skip {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.btn-skip:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* ========== 提示文本 ========== */
.hint-text {
  margin: 0;
  font-size: 0.85rem;
  text-align: center;
}

.hint-error {
  color: #fca5a5;
}

.hint-warning {
  color: #fbbf24;
}

/* ========== 录音中 ========== */
.recording-area {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  padding: 2rem;
  background: rgba(239, 68, 68, 0.08);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 20px;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.1rem;
  font-weight: bold;
}

.pulse-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulseRecording 1s ease-in-out infinite;
}

.recording-text {
  color: #ef4444;
}

.waveform {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 40px;
}

.wave-bar {
  width: 6px;
  background: #ef4444;
  border-radius: 3px;
  animation: waveAnim 0.6s ease-in-out infinite alternate;
}

.wave-bar:nth-child(1) { height: 20px; animation-delay: 0s; }
.wave-bar:nth-child(2) { height: 35px; animation-delay: 0.1s; }
.wave-bar:nth-child(3) { height: 28px; animation-delay: 0.2s; }
.wave-bar:nth-child(4) { height: 38px; animation-delay: 0.3s; }
.wave-bar:nth-child(5) { height: 24px; animation-delay: 0.4s; }

.timeout-hint {
  font-size: 0.85rem;
  opacity: 0.6;
}

/* ========== 处理中 ========== */
.processing-area {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.processing-indicator {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1rem;
  opacity: 0.8;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #5eead4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ========== 结果展示 ========== */
.result-area {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.compare-result {
  width: 100%;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
}

.word-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
  margin-bottom: 1.2rem;
}

.word-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  min-width: 50px;
}

.word-text {
  font-size: 1.3rem;
  font-weight: bold;
}

.word-status-icon {
  font-size: 1rem;
  font-weight: bold;
}

.word-expected {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.2rem;
}

/* 正确词 */
.word-correct {
  background: rgba(52, 211, 153, 0.2);
  border: 1px solid rgba(52, 211, 153, 0.4);
}

.word-correct .word-text {
  color: #34d399;
}

.word-correct .word-status-icon {
  color: #34d399;
}

/* 漏词/错词 */
.word-missing {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.word-missing .word-text {
  color: #fca5a5;
}

.word-missing .word-status-icon {
  color: #ef4444;
}

/* 多余词 */
.word-extra {
  background: rgba(148, 163, 184, 0.15);
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.word-extra .word-text {
  color: #94a3b8;
}

.word-extra .word-status-icon {
  color: #94a3b8;
}

/* 汇总行 */
.result-summary {
  text-align: center;
  padding: 0.8rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  background: rgba(148, 163, 184, 0.1);
}

.result-summary.all-correct {
  background: rgba(52, 211, 153, 0.15);
  animation: celebrate 0.6s ease;
}

.summary-icon {
  margin-right: 0.4rem;
}

.summary-text {
  vertical-align: middle;
}

.result-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* ========== 动画 ========== */
@keyframes pulseRecording {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.3);
  }
}

@keyframes waveAnim {
  0% {
    height: 10px;
  }
  100% {
    height: 40px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes celebrate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .voice-compare {
    padding: 1rem;
  }

  .sentence-text {
    font-size: 1.4rem;
  }

  .sentence-area {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-action {
    width: 100%;
    text-align: center;
  }

  .result-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .word-item {
    min-width: 40px;
    padding: 0.4rem 0.6rem;
  }

  .word-text {
    font-size: 1.1rem;
  }
}
</style>
