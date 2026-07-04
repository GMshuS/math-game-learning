<template>
  <div class="english-speed-spell">
    <GameTutorial
      v-if="showTutorial"
      title="⚡ 单词速拼玩法说明"
      :steps="tutorialSteps"
      @close="closeTutorial"
    />

    <!-- 模式选择（仅 game 模式显示） -->
    <div v-if="practiceMode === 'game' && !store.isPlaying && !store.gameResult" class="mode-select">
      <div class="header">
        <div class="header-left">
          <h2>⚡ 单词速拼</h2>
          <p class="level-info">
            Level {{ effectiveLevel }} · {{ levelTheme }}
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-help" @click="showTutorial = true">❓ 玩法说明</button>
          <button class="btn-back" @click="$emit('back')">← 返回</button>
        </div>
      </div>

      <p class="subtitle">选择模式开始英语单词挑战！</p>

      <div class="mode-cards">
        <div
          v-for="mode in modes"
          :key="mode.id"
          class="mode-card"
          @click="startMode(mode.id)"
        >
          <div class="mode-icon">{{ mode.icon }}</div>
          <h3>{{ mode.name }}</h3>
          <p>{{ mode.description }}</p>
          <div v-if="bestScores[mode.id]" class="mode-best">
            最佳: {{ bestScores[mode.id].score }}分 ({{ bestScores[mode.id].rating }})
          </div>
          <div v-else class="mode-best empty">
            暂无记录
          </div>
        </div>
      </div>

      <!-- 专项训练 -->
      <div class="practice-section">
        <h3 class="section-subtitle">🏋️ 专项训练</h3>
        <div class="mode-cards">
          <div class="mode-card practice-card" @click="startPractice('translation')">
            <div class="mode-icon">🔄</div>
            <h3>中英互译</h3>
            <p>看英文选中文/看中文选英文</p>
          </div>
          <div class="mode-card practice-card" @click="startPractice('listening')">
            <div class="mode-icon">🔊</div>
            <h3>听力训练</h3>
            <p>听发音选择正确释义</p>
          </div>
          <div class="mode-card practice-card" @click="startPractice('reading')">
            <div class="mode-icon">🎤</div>
            <h3>跟读训练</h3>
            <p>跟读评分，纠正发音</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 阅读模式（reading）- 跟读界面 -->
    <div v-if="practiceMode === 'reading' && !store.isPlaying && !showVoiceCompare" class="reading-area">
      <div class="header">
        <div class="header-left">
          <h2>🎤 跟读训练</h2>
          <p class="level-info">
            Level {{ effectiveLevel }} · {{ levelTheme }}
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-back" @click="$emit('back')">← 返回</button>
        </div>
      </div>
      <div class="reading-content">
        <p class="reading-label">朗读下面的单词或句子：</p>
        <div class="reading-text">{{ readingText }}</div>
        <button class="btn-start-reading" @click="openVoiceCompare">
          🎤 开始跟读
        </button>
      </div>
    </div>

    <!-- 阅读模式 - 语音跟读组件 -->
    <div v-else-if="practiceMode === 'reading' && showVoiceCompare" class="voice-compare-wrapper">
      <div class="header">
        <div class="header-left">
          <h2>🎤 语音跟读</h2>
        </div>
        <div class="header-actions">
          <button class="btn-back" @click="closeVoiceCompare">← 返回文本</button>
        </div>
      </div>
      <EnglishVoiceCompare
        :expected-text="readingText"
        :auto-start="true"
        @complete="onVoiceComplete"
        @skip="onVoiceSkip"
      />
    </div>

    <!-- 答题模式（game / translation / listening） -->
    <div v-else-if="store.isPlaying" class="game-area">
      <div class="game-header">
        <!-- game 模式显示计时器/分数/连击/生命值/AI -->
        <template v-if="practiceMode === 'game'">
          <div v-if="store.currentMode !== 'survival'" class="timer" :class="{ warning: store.timeLeft <= 10 }">
            ⏱️ {{ store.timeLeft }}s
          </div>
          <div v-if="store.currentMode === 'survival'" class="timer survival-timer">
            ♾️ 无限时
          </div>
          <div class="score">得分: {{ store.score }}</div>
          <div v-if="store.combo > 1" class="combo">🔥 {{ store.combo }}连击</div>
          <div v-if="store.currentMode === 'survival'" class="lives">
            ❤️ {{ filledHearts }}{{ emptyHearts }}
          </div>
          <div v-if="store.currentMode === 'blitz'" class="ai-bar">
            <div class="ai-label">AI 对手</div>
            <div class="ai-progress-bar">
              <div class="ai-fill" :style="{ width: store.aiProgress + '%' }" />
            </div>
          </div>
        </template>
        <!-- translation/listening 模式显示简洁头部 -->
        <template v-else>
          <span class="practice-title">{{ practiceMode === 'translation' ? '🔄 中英互译' : '🔊 听力训练' }}</span>
        </template>
        <button class="btn-back" @click="goBackFromGame">← 返回</button>
      </div>

      <div class="question-area">
        <!-- 听音题型（game模式+listening训练） -->
        <div v-if="store.currentQuestion?.type === 'listening'" class="question listening">
          <button
            class="btn-listen"
            :class="{ playing: isSpeaking }"
            @click="playListening"
          >
            🔊
          </button>
          <span class="listen-hint">请选择对应的释义</span>
          <div v-if="practiceMode === 'listening'" class="question-hint">点击播放，选择正确的答案</div>
        </div>

        <!-- en2cn 题型（game模式+translation训练） -->
        <div v-else-if="store.currentQuestion?.type === 'en2cn'" class="question">
          <span class="word-en">{{ store.currentQuestion?.word?.en }}</span>
          <span class="question-hint">选择正确的中文释义</span>
        </div>

        <!-- cn2en 题型（game模式+translation训练） -->
        <div v-else-if="store.currentQuestion?.type === 'cn2en'" class="question">
          <span class="word-cn">{{ store.currentQuestion?.word?.cn }}</span>
          <span class="question-hint">选择正确的英文单词</span>
        </div>

        <div class="options">
          <button
            v-for="(opt, index) in store.currentQuestion?.options"
            :key="index"
            class="option-btn"
            :class="{
              correct: feedbackState === 'correct' && index === store.currentQuestion?.correctIndex,
              wrong: feedbackState === 'wrong' && index === feedbackIndex,
              locked: isLocked
            }"
            :disabled="isLocked"
            @click="handleAnswer(index)"
          >
            {{ opt }}
          </button>
        </div>

        <!-- Progress indicator -->
        <div v-if="practiceMode === 'game'" class="progress-info">
          已答: {{ store.correctCount + store.wrongCount }}题
          · 正确: {{ store.correctCount }}
          · 错误: {{ store.wrongCount }}
        </div>
        <div v-else class="progress-info practice-progress">
          已答: {{ store.correctCount + store.wrongCount }}题
          · 正确: {{ store.correctCount }}
          · 错误: {{ store.wrongCount }}
        </div>
      </div>
    </div>

    <!-- 结算（仅 game 模式） -->
    <div v-else-if="practiceMode === 'game' && store.gameResult" class="result-area">
      <h2>🏁 挑战结束</h2>
      <div class="result-stats">
        <div class="stat">
          <div class="stat-value">{{ store.gameResult.score }}</div>
          <div class="stat-label">得分</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ store.gameResult.rating }}</div>
          <div class="stat-label">评级</div>
        </div>
        <div class="stat">
          <div class="stat-value">💰 {{ store.gameResult.coins }}</div>
          <div class="stat-label">金币</div>
        </div>
        <div v-if="store.gameResult.gems > 0" class="stat">
          <div class="stat-value">💎 {{ store.gameResult.gems }}</div>
          <div class="stat-label">钻石</div>
        </div>
      </div>
      <div class="result-details">
        <p>✅ 正确: {{ store.gameResult.correct }} | ❌ 错误: {{ store.gameResult.wrong }}</p>
        <p>🔥 最大连击: {{ store.gameResult.maxCombo }}</p>
        <p>📊 正确率: {{ accuracy }}%</p>
        <p v-if="store.gameResult.aiWon">😤 AI 获胜！下次加油！</p>
        <p v-else-if="store.currentMode === 'blitz' && !store.gameResult.aiWon">🎉 你击败了 AI！</p>
      </div>
      <div class="result-actions">
        <button class="btn-retry" @click="startMode(store.currentMode)">再来一次</button>
        <button class="btn-back-result" @click="goBackToModeSelect">返回模式选择</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import GameTutorial from './GameTutorial.vue';
import EnglishVoiceCompare from './EnglishVoiceCompare.vue';
import { useEnglishSpeedSpellStore } from '../store/englishSpeedSpellStore';
import { useSettingsStore } from '../store/settingsStore';
import { useGameStore } from '../store/gameStore';
import { englishGradesConfig } from '../config/english/grades';
import { speedSpellConfig } from '../config/english/speedSpell';
import englishSpeech from '../utils/englishSpeech';

const props = defineProps({
  practiceMode: {
    type: String,
    default: 'game',
    validator: v => ['game', 'translation', 'listening', 'reading'].includes(v)
  }
});

const emit = defineEmits(['back', 'challengeEnd', 'startReading', 'startPractice']);

// 非游戏模式直接显示答题界面，不需要 Tutorial 和模式选择
const showTutorial = ref(false);

const tutorialSteps = [
  {
    title: '选择模式',
    description: '单词速拼有三种模式：基础模式、闪电模式和生存模式，每种模式有不同的规则和挑战方式。'
  },
  {
    title: '基础模式',
    description: '60秒内尽可能多答题，答对一题得10分。设有连击加成机制，连续答对可获得额外分数加成！'
  },
  {
    title: '闪电模式',
    description: '45秒内与AI对手竞速，答对一题得15分。注意AI的进度条，在AI完成前答对更多题目才能获胜。'
  },
  {
    title: '生存模式',
    description: '无时间限制，但有3条生命值。答对一题得20分，答错扣一条命。3条命用完游戏结束，挑战你的极限！'
  },
  {
    title: '评级与奖励',
    description: '根据得分获得 D/C/B/A/S 评级，得分越高奖励越丰厚。可获取金币和钻石，用于解锁更多内容！'
  }
];

const closeTutorial = () => {
  showTutorial.value = false;
};

const store = useEnglishSpeedSpellStore();
const settingsStore = useSettingsStore();
const gameStore = useGameStore();

let timer = null;

// 反馈状态
const feedbackState = ref(null);   // 'correct' | 'wrong' | null
const feedbackIndex = ref(-1);      // 用户点击的选项索引
const isLocked = ref(false);        // 反馈期间锁定操作
const isSpeaking = ref(false);      // 语音是否正在播放
const feedbackTimer = ref(null);    // 反馈延迟定时器
const hasEmittedEnd = ref(false);   // 防止双重发射

// ====== 专项训练模式 ======
const readingText = ref('');
const showVoiceCompare = ref(false);

// 根据 practiceMode 自动启动
watch(() => props.practiceMode, (mode) => {
  if (mode !== 'game') {
    startPracticeMode(mode);
  }
}, { immediate: true });

function startPracticeMode(mode) {
  hasEmittedEnd.value = false;
  feedbackState.value = null;
  feedbackIndex.value = -1;
  isLocked.value = false;

  if (mode === 'reading') {
    // reading 模式：从 grades 取当前等级的句子
    const level = effectiveLevel.value;
    const grade = englishGradesConfig[level];
    if (grade && grade.words.length > 0) {
      const wordsWithSentence = grade.words.filter(w => w.sentence);
      if (wordsWithSentence.length > 0) {
        const idx = Math.floor(Math.random() * wordsWithSentence.length);
        readingText.value = wordsWithSentence[idx].sentence || wordsWithSentence[idx].en;
      } else {
        readingText.value = grade.words[0].en;
      }
    } else {
      readingText.value = 'Hello, how are you?';
    }
    return;
  }

  // translation / listening 模式：直接启动 Store，不启动计时器
  const modeId = 'base';
  store.startGame(modeId);
}

// ====== 阅读模式 - 语音跟读控制 ======
function openVoiceCompare() {
  showVoiceCompare.value = true;
}

function closeVoiceCompare() {
  showVoiceCompare.value = false;
}

function onVoiceComplete(_result) {
  showVoiceCompare.value = false;
}

function onVoiceSkip() {
  showVoiceCompare.value = false;
}

// 监听 currentQuestion，过滤题型：translation 模式只保留 en2cn/cn2en，listening 模式只保留 listening
watch(() => store.currentQuestion?.type, (newType) => {
  if (practiceMode === 'game' || !newType || !store.isPlaying) return;

  if (practiceMode === 'translation' && newType === 'listening') {
    // translation 模式下遇到 listening 题型，重新生成
    store.generateQuestion();
  } else if (practiceMode === 'listening' && newType !== 'listening') {
    // listening 模式下遇到非 listening 题型，重新生成
    store.generateQuestion();
  }
});

// 重写 handleAnswer 以支持 practice 模式
function handlePracticeAnswer(index) {
  if (isLocked.value || !store.currentQuestion) return;

  isLocked.value = true;
  feedbackIndex.value = index;

  const isCorrect = store.answer(index);

  if (isCorrect) {
    feedbackState.value = 'correct';
  } else {
    feedbackState.value = 'wrong';
  }

  // translation/listening 模式下：延迟后自动下一题，不写成绩
  const delay = isCorrect ? 400 : 700;
  feedbackTimer.value = setTimeout(() => {
    feedbackTimer.value = null;
    feedbackState.value = null;
    feedbackIndex.value = -1;
    isLocked.value = false;
    // 不触发 emit
  }, delay);
}

// ====== 等级信息 ======
const effectiveLevel = computed(() => settingsStore.getEffectiveEnglishLevel);

const levelTheme = computed(() => {
  const cfg = englishGradesConfig[effectiveLevel.value];
  return cfg ? cfg.theme : '';
});

// 模式列表（从 speedSpellConfig 读取，避免与 EnglishHall 重复定义）
const modes = Object.values(speedSpellConfig.modes).map(m => ({
  id: m.id,
  icon: m.icon,
  name: m.name,
  description: m.description
}));

// 最佳成绩
const bestScores = computed(() => gameStore.englishSpeedSpell?.bestScores || {});

// 生命值显示（生存模式）
const filledHearts = computed(() => '❤️'.repeat(store.lives));
const emptyHearts = computed(() => '🖤'.repeat(store.maxLives - store.lives));

// 正确率
const accuracy = computed(() => {
  const result = store.gameResult;
  if (!result) return 0;
  const total = (result.correct || 0) + (result.wrong || 0);
  if (total === 0) return 0;
  return ((result.correct / total) * 100).toFixed(1);
});

/**
 * 开始游戏
 * @param {string} modeId
 */
function startMode(modeId) {
  hasEmittedEnd.value = false;
  feedbackState.value = null;
  feedbackIndex.value = -1;
  isLocked.value = false;
  store.startGame(modeId);
  startTimer();
}

/**
 * 处理答题
 * @param {number} index
 */
function handleAnswer(index) {
  if (practiceMode !== 'game') {
    // translation/listening 模式：简单反馈，不写成绩
    handlePracticeAnswer(index);
    return;
  }

  if (isLocked.value || !store.currentQuestion) return;

  isLocked.value = true;
  feedbackIndex.value = index;

  const isCorrect = store.answer(index);

  if (isCorrect) {
    feedbackState.value = 'correct';
  } else {
    feedbackState.value = 'wrong';
  }

  // 延迟后自动下一题
  const delay = isCorrect ? 500 : 800;
  feedbackTimer.value = setTimeout(() => {
    feedbackTimer.value = null;
    feedbackState.value = null;
    feedbackIndex.value = -1;
    isLocked.value = false;

    // 如果游戏已结束，触发事件（防止双重发射）
    if (!store.isPlaying && !hasEmittedEnd.value) {
      hasEmittedEnd.value = true;
      emit('challengeEnd', store.gameResult);
    }
  }, delay);
}

/**
 * 播放听音
 */
async function playListening() {
  if (!store.currentQuestion?.word?.en) return;

  // 确保语音引擎已初始化
  await englishSpeech.init();

  isSpeaking.value = true;
  englishSpeech.speak(store.currentQuestion.word.en, {
    rate: 0.9,
    onEnd: () => {
      isSpeaking.value = false;
    },
    onError: () => {
      isSpeaking.value = false;
    }
  });
}

/**
 * 启动计时器
 */
function startTimer() {
  stopTimer();
  if (store.currentMode === 'survival') return;
  timer = setInterval(() => {
    store.tick();
    if (!store.isPlaying) {
      stopTimer();
      emit('challengeEnd', store.gameResult);
    }
  }, 1000);
}

/**
 * 停止计时器
 */
function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

/**
 * 从游戏中返回（停止游戏并返回上一层）
 */
function goBackFromGame() {
  if (feedbackTimer.value) {
    clearTimeout(feedbackTimer.value);
    feedbackTimer.value = null;
  }
  hasEmittedEnd.value = false;
  stopTimer();
  englishSpeech.stop();
  store.$reset();
  emit('back');
}

/**
 * 返回模式选择
 */
function goBackToModeSelect() {
  if (feedbackTimer.value) {
    clearTimeout(feedbackTimer.value);
    feedbackTimer.value = null;
  }
  hasEmittedEnd.value = false;
  stopTimer();
  englishSpeech.stop();
  store.$reset();
}

/**
 * 启动专项训练模式
 * @param {string} mode - 'translation' | 'listening' | 'reading'
 */
function startPractice(mode) {
  if (mode === 'reading') {
    emit('startReading');
    return;
  }
  emit('startPractice', mode);
}

onMounted(() => {
  // 如果从 EnglishHall 直接进入游戏（isPlaying 已为 true），启动定时器
  if (store.isPlaying && store.currentMode !== 'survival') {
    startTimer();
  }
});

onUnmounted(() => {
  if (feedbackTimer.value) {
    clearTimeout(feedbackTimer.value);
    feedbackTimer.value = null;
  }
  stopTimer();
  englishSpeech.stop();
});
</script>

<style scoped>
.english-speed-spell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  color: #fff;
  overflow-y: auto;
  background: linear-gradient(135deg, #0f766e 0%, #155e75 100%);
}

/* ========== 模式选择 ========== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.header-left h2 {
  margin: 0;
  font-size: 1.8rem;
}

.level-info {
  margin: 0.3rem 0 0;
  font-size: 0.95rem;
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-help {
  padding: 0.5rem 1.2rem;
  background: rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-help:hover {
  background: rgba(102, 126, 234, 0.5);
}

.btn-back {
  padding: 0.5rem 1.2rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.25);
}

.subtitle {
  margin: 0 0 2rem;
  opacity: 0.7;
  font-size: 0.95rem;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.mode-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.mode-card:hover {
  transform: translateY(-3px);
  border-color: #34d399;
  box-shadow: 0 8px 25px rgba(52, 211, 153, 0.2);
}

.mode-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.mode-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.mode-card p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.mode-best {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #34d399;
}

.mode-best.empty {
  color: rgba(255, 255, 255, 0.35);
}

/* 专项训练区域 */
.practice-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.section-subtitle {
  margin: 0 0 1rem;
  font-size: 1rem;
  opacity: 0.7;
  font-weight: 600;
}

.practice-card {
  background: rgba(255, 255, 255, 0.06);
}

.practice-card:hover {
  border-color: #fbbf24;
  box-shadow: 0 8px 25px rgba(251, 191, 36, 0.15);
}

/* ========== 阅读模式 ========== */
.reading-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.voice-compare-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reading-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.reading-label {
  font-size: 1.2rem;
  opacity: 0.8;
}

.reading-text {
  font-size: 2.8rem;
  font-weight: bold;
  color: #5eead4;
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  max-width: 80%;
  word-break: break-word;
  line-height: 1.4;
}

.btn-start-reading {
  padding: 1rem 2.5rem;
  font-size: 1.3rem;
  font-weight: bold;
  background: linear-gradient(135deg, #06b6d4, #10b981);
  border: none;
  border-radius: 30px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-start-reading:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* ========== 练习完成 ========== */
.practice-done {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  text-align: center;
}

.practice-done h2 {
  font-size: 2.5rem;
}

.practice-done p {
  font-size: 1.2rem;
  opacity: 0.7;
}

.practice-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.practice-progress {
  opacity: 0.7;
}

/* ========== 游戏态 ========== */
.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.timer {
  font-size: 1.5rem;
  font-weight: bold;
}

.timer.warning {
  color: #ef4444;
  animation: pulse 0.5s infinite;
}

.survival-timer {
  font-size: 1.2rem;
  font-weight: normal;
  opacity: 0.7;
}

.score {
  font-size: 1.2rem;
  color: #34d399;
}

.combo {
  font-size: 1.2rem;
  color: #f97316;
}

.lives {
  font-size: 1.2rem;
}

.ai-bar {
  width: 100%;
}

.ai-label {
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
}

.ai-progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.ai-fill {
  height: 100%;
  background: linear-gradient(90deg, #f97316, #ef4444);
  transition: width 0.3s;
}

.question-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.question {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.question.listening {
  gap: 1rem;
}

.word-en {
  font-size: 2.5rem;
  font-weight: bold;
  color: #5eead4;
  letter-spacing: 0.05em;
}

.word-cn {
  font-size: 2.5rem;
  font-weight: bold;
  color: #fbbf24;
}

.question-hint {
  font-size: 0.9rem;
  opacity: 0.6;
}

.listen-hint {
  font-size: 1rem;
  opacity: 0.7;
}

.btn-listen {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 2.5rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-listen:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #34d399;
  transform: scale(1.1);
}

.btn-listen.playing {
  animation: listenPulse 1s infinite;
  border-color: #34d399;
  background: rgba(52, 211, 153, 0.3);
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 500px;
}

.option-btn {
  padding: 1.2rem 1rem;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  word-break: break-word;
}

.option-btn:hover:not(.locked) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.option-btn.correct {
  background: rgba(52, 211, 153, 0.4);
  border-color: #34d399;
  animation: correctFlash 0.5s ease;
}

.option-btn.wrong {
  background: rgba(239, 68, 68, 0.4);
  border-color: #ef4444;
  animation: shake 0.4s ease;
}

.option-btn.locked {
  cursor: default;
  opacity: 0.8;
}

.progress-info {
  font-size: 0.8rem;
  opacity: 0.5;
}

/* ========== 结算态 ========== */
.result-area {
  text-align: center;
  padding: 2rem;
}

.result-area h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.7;
}

.result-details {
  margin: 1.5rem 0;
  opacity: 0.8;
  line-height: 1.8;
}

.result-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn-retry,
.btn-back-result {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry {
  background: linear-gradient(135deg, #06b6d4, #10b981);
  color: #fff;
}

.btn-retry:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-back-result {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.btn-back-result:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ========== 动画 ========== */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes correctFlash {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
  75% { transform: translateX(-4px); }
}

@keyframes listenPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
  50% { box-shadow: 0 0 0 15px rgba(52, 211, 153, 0); }
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .english-speed-spell {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 0.8rem;
  }

  .header-actions {
    align-self: flex-end;
  }

  .mode-cards {
    grid-template-columns: 1fr;
  }

  .word-en,
  .word-cn {
    font-size: 1.8rem;
  }

  .options {
    grid-template-columns: 1fr;
  }

  .option-btn {
    padding: 1rem;
    font-size: 1rem;
  }
}
</style>
