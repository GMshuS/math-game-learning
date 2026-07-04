<template>
  <div class="clock-game">
    <div class="top-bar">
      <button class="btn-back" @click="$emit('back')">← 返回</button>
    </div>

    <!-- 设置界面：年级 + 模式选择 -->
    <div v-if="phase === 'setup'" class="setup-screen">
      <h2 class="game-title">🕐 钟表学院</h2>
      <p class="game-desc">认读时间，掌握时刻！选择年级和模式开始学习。</p>

      <div class="mode-select">
        <div
          class="mode-card"
          :class="{ active: selectedMode === 'read' }"
          @click="selectedMode = 'read'"
        >
          <span class="mode-icon">👀</span>
          <span class="mode-name">认读时间</span>
          <span class="mode-desc">看钟面，选时间</span>
        </div>
        <div
          class="mode-card"
          :class="{ active: selectedMode === 'set' }"
          @click="selectedMode = 'set'"
        >
          <span class="mode-icon">✋</span>
          <span class="mode-name">拨钟练习</span>
          <span class="mode-desc">根据时间调指针</span>
        </div>
      </div>

      <button class="btn-start" @click="startGame">
        开始学习
      </button>
    </div>

    <!-- 游戏主界面 -->
    <div v-else class="game-screen">
      <!-- 顶部信息栏 -->
      <div class="game-header">
        <div class="header-left">
          <span class="header-grade">{{ settingsStore.gradeRange.max }}年级</span>
          <span class="header-mode">{{ selectedMode === 'read' ? '认读' : '拨钟' }}</span>
        </div>
        <div class="header-center">
          <div class="score-display">
            <span class="score-label">得分</span>
            <span class="score-value">{{ score }}</span>
          </div>
          <div v-if="combo > 1" class="combo-display">
            <span class="combo-label">连对</span>
            <span class="combo-value">{{ combo }}</span>
          </div>
        </div>
        <div class="header-right">
          <span class="question-count">{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</span>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (currentQuestionIndex / totalQuestions) * 100 + '%' }" />
      </div>

      <!-- Phaser 钟面容器 -->
      <div ref="gameContainer" class="phaser-container" />

      <!-- 问题提示 -->
      <div v-if="selectedMode === 'set'" class="question-prompt">
        <span class="prompt-label">请将指针拨到：</span>
        <span class="prompt-time">{{ targetTimeDisplay }}</span>
      </div>

      <!-- 模式1: 4选1 认读 -->
      <div v-if="selectedMode === 'read'" class="choices-area">
        <button
          v-for="(choice, idx) in currentChoices"
          :key="idx"
          class="choice-btn"
          :class="{
            correct: feedback === 'correct' && choice === currentAnswer,
            wrong: feedback === 'wrong' && selectedChoice === choice,
            disabled: feedback !== null
          }"
          :disabled="feedback !== null"
          @click="submitChoice(choice)"
        >
          {{ choice }}
        </button>
      </div>

      <!-- 模式2: 拨钟控制区 -->
      <div v-if="selectedMode === 'set'" class="clock-controls">
        <div class="control-row">
          <span class="control-label">时针：</span>
          <button class="control-btn" :disabled="feedback !== null" @click="adjustHour(-1)">−</button>
          <span class="control-value">{{ setHour }} 时</span>
          <button class="control-btn" :disabled="feedback !== null" @click="adjustHour(1)">+</button>
        </div>
        <div class="control-row">
          <span class="control-label">分针：</span>
          <button class="control-btn" :disabled="feedback !== null" @click="adjustMinute(-5)">−</button>
          <span class="control-value">{{ String(setMinute).padStart(2, '0') }} 分</span>
          <button class="control-btn" :disabled="feedback !== null" @click="adjustMinute(5)">+</button>
        </div>
        <button class="btn-confirm" :disabled="feedback !== null" @click="submitTime">
          确认时间
        </button>
      </div>

      <!-- 反馈区域 -->
      <div v-if="feedback" class="feedback-area" :class="feedback">
        <span class="feedback-icon">{{ feedback === 'correct' ? '✅' : '❌' }}</span>
        <span class="feedback-text">
          {{ feedback === 'correct' ? '回答正确！' : `回答错误，正确答案是 ${currentAnswer}` }}
        </span>
      </div>

      <!-- 下一题按钮 -->
      <button v-if="feedback" class="btn-next" @click="nextQuestion">
        {{ currentQuestionIndex < totalQuestions - 1 ? '下一题 →' : '查看成绩' }}
      </button>
    </div>

    <!-- 结算界面 -->
    <div v-if="phase === 'result'" class="result-screen">
      <h2 class="result-title">🎉 练习完成！</h2>
      <div class="result-stats">
        <div class="stat-item">
          <span class="stat-icon">📝</span>
          <span class="stat-label">总题数</span>
          <span class="stat-value">{{ totalQuestions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">✅</span>
          <span class="stat-label">正确</span>
          <span class="stat-value correct">{{ correctCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">❌</span>
          <span class="stat-label">错误</span>
          <span class="stat-value wrong">{{ totalQuestions - correctCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⭐</span>
          <span class="stat-label">得分</span>
          <span class="stat-value star">{{ score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <span class="stat-label">正确率</span>
          <span class="stat-value">{{ accuracy }}%</span>
        </div>
      </div>
      <div class="result-buttons">
        <button class="btn-retry" @click="resetGame">再练一次</button>
        <button class="btn-back-result" @click="$emit('back')">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Phaser from 'phaser';
import { useSettingsStore } from '../store/settingsStore';
import ClockScene from '../scenes/ClockScene';
import { generateRandomTime, generateWrongTimes } from '../config/clock';

defineEmits(['back']);

const settingsStore = useSettingsStore();

// 状态变量
const phase = ref('setup');         // 'setup' | 'game' | 'result'
const selectedMode = ref('read');   // 'read' | 'set'
const score = ref(0);
const combo = ref(0);
const correctCount = ref(0);
const currentQuestionIndex = ref(0);
const totalQuestions = ref(10);

// 当前题目
const currentTime = ref({ hour: 0, minute: 0, display: '' });
const targetTimeDisplay = ref('');
const currentAnswer = ref('');
const currentChoices = ref([]);
const selectedChoice = ref(null);
const setHour = ref(12);
const setMinute = ref(0);
const feedback = ref(null);         // null | 'correct' | 'wrong'

// Phaser
const gameContainer = ref(null);
let game = null;

const accuracy = computed(() => {
  const answered = currentQuestionIndex.value; // 已答题目数为当前索引
  if (answered === 0) return 0;
  return Math.round((correctCount.value / answered) * 100);
});

/**
 * 获取 Phaser 场景实例
 */
function getScene() {
  return game?.scene?.getScene('ClockScene') || null;
}

/**
 * 设置钟面时间（带游戏实例活跃性检查）
 */
function setClockTime(hour, minute) {
  if (!game) return;
  const scene = getScene();
  if (scene && scene.scene && scene.scene.isActive()) {
    scene.animateToTime(hour, minute);
  }
}

/**
 * 生成一道新题目
 */
function generateQuestion() {
  const time = generateRandomTime(settingsStore.gradeRange.max);
  currentTime.value = time;

  if (selectedMode.value === 'read') {
    // 模式1：显示钟面 → 4选1
    currentAnswer.value = time.display;

    // 使用 clock.js 的干扰选项生成（含 maxAttempts 保护）
    const wrongOptions = generateWrongTimes(time, settingsStore.gradeRange.max, 3);
    const choices = [time.display, ...wrongOptions];
    // 打乱
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    currentChoices.value = choices;

    // 设置钟面
    setClockTime(time.hour, time.minute);
  } else {
    // 模式2：显示目标时间 → 学生调整指针
    targetTimeDisplay.value = time.display;
    currentAnswer.value = time.display;

    // 设置初始随机指针位置
    setHour.value = Math.floor(Math.random() * 12) + 1;
    setMinute.value = Math.floor(Math.random() * 12) * 5;
    setClockTime(setHour.value, setMinute.value);
  }

  selectedChoice.value = null;
  feedback.value = null;
}

/**
 * 开始游戏
 */
function startGame() {
  phase.value = 'game';
  score.value = 0;
  combo.value = 0;
  correctCount.value = 0;
  currentQuestionIndex.value = 0;
  generateQuestion();
}

/**
 * 提交选择（模式1）
 */
function submitChoice(choice) {
  if (feedback.value) return;
  selectedChoice.value = choice;
  const isCorrect = choice === currentAnswer.value;
  handleAnswer(isCorrect);
}

/**
 * 调整时针
 */
function adjustHour(delta) {
  let h = setHour.value + delta;
  if (h > 12) h = 1;
  if (h < 1) h = 12;
  setHour.value = h;
  setClockTime(setHour.value, setMinute.value);
}

/**
 * 调整分针
 */
function adjustMinute(delta) {
  let m = setMinute.value + delta;
  if (m >= 60) {
    m = 0;
    // 逢60进1小时
    let h = setHour.value + 1;
    if (h > 12) h = 1;
    setHour.value = h;
  }
  if (m < 0) {
    m = 55;
    let h = setHour.value - 1;
    if (h < 1) h = 12;
    setHour.value = h;
  }
  setMinute.value = m;
  setClockTime(setHour.value, setMinute.value);
}

/**
 * 提交时间（模式2）
 */
function submitTime() {
  if (feedback.value) return;
  const userTime = `${setHour.value}:${String(setMinute.value).padStart(2, '0')}`;
  const isCorrect = userTime === currentAnswer.value;
  handleAnswer(isCorrect);
}

/**
 * 处理答题结果
 */
function handleAnswer(isCorrect) {
  if (isCorrect) {
    feedback.value = 'correct';
    score.value += 10 + combo.value * 2;
    combo.value++;
    correctCount.value++;
  } else {
    feedback.value = 'wrong';
    combo.value = 0;
  }
}

/**
 * 下一题
 */
function nextQuestion() {
  currentQuestionIndex.value++;
  if (currentQuestionIndex.value >= totalQuestions.value) {
    phase.value = 'result';
  } else {
    generateQuestion();
  }
}

/**
 * 重置游戏（回到开始界面）
 */
function resetGame() {
  phase.value = 'setup';
  score.value = 0;
  combo.value = 0;
  correctCount.value = 0;
  currentQuestionIndex.value = 0;
}

// 管理 Phaser 生命周期
onMounted(() => {
  if (gameContainer.value) {
    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: gameContainer.value,
      width: 400,
      height: 350,
      backgroundColor: '#1e293b',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [ClockScene]
    });
  }
});

onUnmounted(() => {
  if (game) {
    game.destroy(true);
    game = null;
  }
});
</script>

<style scoped>
.clock-game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  color: #fff;
  overflow-y: auto;
  position: relative;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ====== 设置界面 ====== */
.setup-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  max-width: 500px;
  gap: 2rem;
}

.game-title {
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-desc {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0;
}

.mode-select {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.mode-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-3px);
}

.mode-card.active {
  background: rgba(102, 126, 234, 0.15);
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.mode-icon {
  font-size: 2.5rem;
}

.mode-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.mode-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.btn-start {
  padding: 1rem 3rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 30px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-start:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* ====== 游戏界面 ====== */
.game-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
  gap: 0.8rem;
  padding-top: 1rem;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0;
}

.header-left {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.header-grade {
  padding: 0.3rem 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 0.85rem;
}

.header-mode {
  padding: 0.3rem 0.8rem;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 0.85rem;
}

.header-center {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.score-display, .combo-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-label, .combo-label {
  font-size: 0.7rem;
  opacity: 0.7;
}

.score-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #fbbf24;
}

.combo-value {
  font-size: 1rem;
  font-weight: bold;
  color: #4ade80;
}

.question-count {
  font-size: 0.85rem;
  opacity: 0.7;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.phaser-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 400px;
}

.question-prompt {
  text-align: center;
  padding: 0.5rem 1rem;
}

.prompt-label {
  font-size: 1rem;
  opacity: 0.8;
}

.prompt-time {
  font-size: 1.6rem;
  font-weight: bold;
  color: #fbbf24;
  margin-left: 0.5rem;
}

/* 模式1：选择区 */
.choices-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  width: 100%;
  max-width: 400px;
}

.choice-btn {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.choice-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.choice-btn.correct {
  background: rgba(74, 222, 128, 0.3);
  border-color: #4ade80;
}

.choice-btn.wrong {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
}

.choice-btn.disabled {
  cursor: default;
  opacity: 0.7;
}

/* 模式2：拨钟控制 */
.clock-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  max-width: 350px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.control-label {
  width: 3rem;
  font-size: 0.95rem;
  opacity: 0.8;
}

.control-btn {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.control-value {
  font-size: 1.3rem;
  font-weight: bold;
  min-width: 5rem;
  text-align: center;
  color: #fbbf24;
}

.btn-confirm {
  margin-top: 0.5rem;
  padding: 0.8rem 2.5rem;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 222, 128, 0.3);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: default;
}

/* 反馈区 */
.feedback-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-size: 1rem;
}

.feedback-area.correct {
  background: rgba(74, 222, 128, 0.15);
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.feedback-area.wrong {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.feedback-icon {
  font-size: 1.3rem;
}

.btn-next {
  padding: 0.7rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-next:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* ====== 结算界面 ====== */
.result-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  max-width: 450px;
  gap: 2rem;
}

.result-title {
  font-size: 2rem;
  margin: 0;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  gap: 0.3rem;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.7;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-value.correct {
  color: #4ade80;
}

.stat-value.wrong {
  color: #ef4444;
}

.stat-value.star {
  color: #fbbf24;
}

.result-buttons {
  display: flex;
  gap: 1rem;
}

.btn-retry {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}

.btn-back-result {
  padding: 0.8rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back-result:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .setup-screen {
    padding: 1rem;
  }

  .mode-select {
    flex-direction: column;
  }

  .grade-buttons {
    gap: 0.4rem;
  }

  .grade-btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }

  .choices-area {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .result-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 1rem 2rem 0 0;
}
</style>
