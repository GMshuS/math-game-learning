<template>
  <div class="english-grammar-game">
    <GameTutorial
      v-if="showTutorial"
      title="🏰 语法闯关玩法说明"
      :steps="grammarGameTutorialSteps"
      @close="closeTutorial"
    />

    <!-- ========== 状态栏 ========== -->
    <header class="status-bar">
      <div class="status-left">
        <span class="lives-display">
          <span v-for="i in grammarStore.maxLives" :key="i" class="heart-icon">
            {{ i <= grammarStore.lives ? '❤️' : '🖤' }}
          </span>
        </span>
        <span class="tower-name">🏰 {{ towerData?.name || '' }} {{ grammarStore.currentFloor > 0 ? grammarStore.currentFloor + 'F' : '' }}</span>
      </div>
      <div class="status-center">
        <button class="btn-help" @click="showTutorial = true">❓ 玩法说明</button>
      </div>
      <div class="status-right">
        <button class="btn-back-sm" @click="goBack">← 返回</button>
        <span class="score-display">⭐ {{ grammarStore.score }}</span>
        <span v-if="grammarStore.combo > 1" class="combo-display">🔥 x{{ grammarStore.combo }}</span>
      </div>
    </header>

    <!-- ========== 计时条（仅 playing 阶段） ========== -->
    <div v-if="grammarStore.gamePhase === 'playing'" class="timer-bar">
      <div
        class="timer-fill"
        :class="{ warning: grammarStore.timeLeft <= 5 }"
        :style="{ width: (grammarStore.timeLeft / 15) * 100 + '%' }"
      />
      <span class="timer-text" :class="{ warning: grammarStore.timeLeft <= 5 }">
        {{ grammarStore.timeLeft }}s
      </span>
    </div>

    <!-- ========== 教学关 ========== -->
    <div v-if="grammarStore.gamePhase === 'tutorial'" class="tutorial-view">
      <div class="tutorial-top-bar">
        <button class="btn-back-sm" @click="goBack">← 返回</button>
      </div>
      <div class="tutorial-header">
        <span class="tutorial-icon">📖</span>
        <h3>{{ currentTutorial.title }}</h3>
      </div>
      <div class="tutorial-rules">
        <div
          v-for="(rule, i) in currentTutorial.rules"
          :key="i"
          class="rule-card"
        >
          <div class="rule-formula">
            {{ rule.rule || rule.subject + ' → ' + rule.verb }}
          </div>
          <div class="rule-example">"{{ rule.example }}"</div>
          <div class="rule-explanation">{{ rule.explanation }}</div>
          <button class="btn-listen" title="听发音" @click="playTTS(rule.example)">
            🔊
          </button>
        </div>
      </div>
      <div class="tutorial-actions">
        <button class="btn-skip" @click="skipTutorial">⏭️ 跳过教学</button>
        <button class="btn-start" @click="startGame">✅ 开始闯关</button>
      </div>
    </div>

    <!-- ========== 游戏答题区（playing 阶段） ========== -->
    <div v-else-if="grammarStore.gamePhase === 'playing'" class="game-area">
      <!-- 语音跟读组件 -->
      <EnglishVoiceCompare
        v-if="showVoiceCompare"
        :expected-text="voiceExpectedText"
        :auto-start="true"
        @complete="onVoiceComplete"
        @skip="onVoiceSkip"
      />

      <!-- 普通答题（voice compare 隐藏时显示） -->
      <template v-if="!showVoiceCompare">
        <!-- ===== 识别题 ===== -->
        <div v-if="currentType === 'choice'" class="question-type choice-question">
          <!-- eslint-disable-next-line vue/no-v-html 已做 HTML 转义，安全 -->
          <p class="question-sentence" v-html="renderSentence(currentQuestion.sentence, currentQuestion.blanks)" />
          <div class="options-grid">
            <button
              v-for="(opt, i) in currentQuestion.options"
              :key="i"
              class="option-btn"
              :class="{
                correct: answered && opt === currentQuestion.answer,
                wrong: answered && selectedAnswer === opt && opt !== currentQuestion.answer
              }"
              :disabled="answered"
              @click="selectAnswer(opt)"
            >
              {{ opt }}
            </button>
          </div>
          <button class="btn-voice-hint" title="听句子" @click="playTTS(currentQuestion.voicePrompt || currentQuestion.sentence)">
            🔊 听句子
          </button>
        </div>

        <!-- ===== 填空题 ===== -->
        <div v-else-if="currentType === 'fillBlank'" class="question-type fill-blank">
          <p class="question-sentence">{{ renderFillSentence(currentQuestion.sentence) }}</p>
          <div class="input-area">
            <input
              v-model="fillInput"
              type="text"
              class="fill-input"
              :class="{ correct: answered && answeredCorrectly, wrong: answered && !answeredCorrectly }"
              placeholder="请输入合适的 be 动词"
              :disabled="answered"
              @keyup.enter="submitFill"
            >
            <button
              class="btn-confirm"
              :disabled="answered || !fillInput.trim()"
              @click="submitFill"
            >
              确认
            </button>
          </div>
          <div v-if="answered && !answeredCorrectly" class="feedback-wrong">
            正确答案: <strong>{{ currentQuestion.answer }}</strong>
          </div>
          <button class="btn-voice-hint" title="听句子" @click="playTTS(currentQuestion.voicePrompt || currentQuestion.sentence)">
            🔊 听句子
          </button>
        </div>

        <!-- ===== 排序题 ===== -->
        <div v-else-if="currentType === 'dragOrder'" class="question-type drag-order">
          <p class="question-hint">{{ currentQuestion.sentence || '点击单词组成正确的句子' }}</p>
          <p class="order-target">{{ currentQuestion.answer }}</p>
          <div class="word-bank">
            <span
              v-for="(word, i) in shuffledWords"
              :key="i"
              class="word-chip"
              :class="{ used: placedOrder.includes(i) }"
              @click="placeWord(i)"
            >
              {{ word }}
            </span>
          </div>
          <div class="sentence-area">
            <span
              v-for="(wordIdx, i) in placedOrder"
              :key="i"
              class="word-placed"
              :class="{
                wrong: answered && !answeredCorrectly
              }"
              @click="removeWord(i)"
            >
              {{ shuffledWords[wordIdx] }}
            </span>
            <span v-if="placedOrder.length === 0" class="placement-hint">点击上方单词放置到此</span>
          </div>
          <button
            v-if="placedOrder.length === shuffledWords.length && !answered"
            class="btn-check"
            @click="checkOrder"
          >
            检查答案
          </button>
          <div v-if="answered && !answeredCorrectly" class="feedback-wrong">
            正确顺序: <strong>{{ currentQuestion.answer }}</strong>
          </div>
          <button class="btn-voice-hint" title="听句子" @click="playTTS(currentQuestion.voicePrompt || currentQuestion.answer)">
            🔊 听句子
          </button>
        </div>

        <!-- ===== BOSS战 ===== -->
        <div v-else-if="currentType === 'bossFight'" class="question-type boss-fight">
          <div class="boss-area">
            <div class="boss-info">
              <span class="boss-icon">{{ boss.icon || '👹' }}</span>
              <span class="boss-name">{{ boss.name || '语法魔王' }}</span>
              <div class="boss-hp-bar">
                <div
                  class="boss-hp-fill"
                  :style="{ width: (grammarStore.bossHp / boss.hp) * 100 + '%' }"
                />
              </div>
              <span class="boss-hp-text">HP: {{ grammarStore.bossHp }}/{{ boss.hp }}</span>
            </div>
            <div class="boss-speech">
              <p class="boss-sentence-label">👹 说：</p>
              <p class="boss-sentence">
                "<span class="error-part">{{ bossErrorPart }}</span> {{ bossRestPart }}"
              </p>
            </div>
          </div>
          <p class="boss-action-hint">选择正确的词修复句子：</p>
          <div class="options-grid">
            <button
              v-for="(opt, i) in currentQuestion.options"
              :key="i"
              class="option-btn boss-option"
              :class="{
                correct: answered && opt === currentQuestion.answer,
                wrong: answered && selectedAnswer === opt && opt !== currentQuestion.answer
              }"
              :disabled="answered"
              @click="selectAnswer(opt)"
            >
              {{ opt }}
            </button>
          </div>
          <div class="boss-combo">
            <span
              v-for="i in (floorData?.winCondition?.consecutiveCorrect || 3)"
              :key="i"
              class="combo-dot"
              :class="{ filled: i <= grammarStore.bossConsecutiveCorrect }"
            >
              {{ i <= grammarStore.bossConsecutiveCorrect ? '🟢' : '⚪' }}
            </span>
            <span class="combo-label">
              还需 {{ Math.max(0, (floorData?.winCondition?.consecutiveCorrect || 3) - grammarStore.bossConsecutiveCorrect) }} 次击败魔王
            </span>
          </div>
        </div>

        <!-- ===== 分类题（新题型） ===== -->
        <div v-else-if="currentType === 'categorize'" class="question-type">
          <EnglishCategorize
            :question="currentQuestion"
            :disabled="answered"
            @answer="handleNewTypeAnswer"
          />
        </div>

        <!-- ===== 配对题（新题型） ===== -->
        <div v-else-if="currentType === 'match'" class="question-type">
          <EnglishMatch
            :question="currentQuestion"
            :disabled="answered"
            @answer="handleNewTypeAnswer"
          />
        </div>

        <!-- ===== 看图题（新题型） ===== -->
        <div v-else-if="currentType === 'imageChoice'" class="question-type">
          <EnglishImageChoice
            :question="currentQuestion"
            :disabled="answered"
            @answer="handleNewTypeAnswer"
          />
        </div>

        <!-- ===== 动词变形表（新题型） ===== -->
        <div v-else-if="currentType === 'verbTable'" class="question-type">
          <EnglishVerbTable
            :question="currentQuestion"
            :disabled="answered"
            @answer="handleNewTypeAnswer"
          />
        </div>

        <!-- ===== 句式转换题（新题型） ===== -->
        <div v-else-if="currentType === 'transform'" class="question-type">
          <EnglishTransform
            :question="currentQuestion"
            :disabled="answered"
            @answer="handleNewTypeAnswer"
          />
        </div>

        <!-- ===== 连词连接题（新题型） ===== -->
        <div v-else-if="currentType === 'connector'" class="question-type">
          <EnglishConnector
            :question="currentQuestion"
            :disabled="answered"
            @answer="handleNewTypeAnswer"
          />
        </div>

        <!-- ===== 情景对话选择题（新题型） ===== -->
        <div v-else-if="currentType === 'dialogueChoice'" class="question-type">
          <EnglishDialogueChoice
            :question="currentQuestion"
            :disabled="answered"
            @answer="handleNewTypeAnswer"
          />
        </div>

        <!-- ===== 未知题型兜底 ===== -->
        <div v-else class="question-type unknown-type">
          <p class="unknown-hint">暂不支持的题型：{{ currentType }}</p>
        </div>

        <!-- 题目进度 -->
        <div class="question-progress">
          题目 {{ grammarStore.currentQuestionIndex + 1 }} / {{ grammarStore.floorQuestions.length }}
        </div>
      </template>
    </div>

    <!-- ========== 层结算 ========== -->
    <div v-else-if="grammarStore.gamePhase === 'floorResult'" class="floor-result">
      <div class="result-card">
        <h2>第 {{ grammarStore.currentFloor }} 层 通关！</h2>
        <div class="stars-display">
          <span
            v-for="i in 3"
            :key="i"
            class="star-icon"
            :class="{ filled: i <= floorStars }"
          >
            {{ i <= floorStars ? '⭐' : '☆' }}
          </span>
        </div>
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-label">答对</span>
            <span class="stat-value correct">{{ grammarStore.floorCorrectCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">失误</span>
            <span class="stat-value wrong">{{ grammarStore.floorWrongCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最大连击</span>
            <span class="stat-value combo">{{ grammarStore.maxCombo }}</span>
          </div>
        </div>
        <div class="floor-result-actions">
          <button class="btn-next-floor" @click="goNextFloor">
            下一层 →
          </button>
          <button class="btn-back-castle" @click="goBack">🏰 返回城堡</button>
        </div>
      </div>
    </div>

    <!-- ========== 塔结算 ========== -->
    <div v-else-if="grammarStore.gamePhase === 'victory'" class="tower-result">
      <div class="result-card victory-card">
        <h2>🎉 {{ towerData?.name || '语法塔' }} 通关！</h2>
        <div class="stars-summary">
          <span v-for="(s, f) in (grammarStore.gameResult?.floorStars || {})" :key="f" class="floor-star-row">
            {{ f }}F: {{ '⭐'.repeat(s) }}{{ '☆'.repeat(3 - s) }}
          </span>
        </div>
        <div class="total-stars">
          总星数: {{ grammarStore.gameResult?.stars || 0 }}
        </div>
        <div class="reward-stats">
          <div class="reward-item">
            <span class="reward-label">得分</span>
            <span class="reward-value">{{ grammarStore.score }}</span>
          </div>
          <div class="reward-item">
            <span class="reward-label">金币</span>
            <span class="reward-value coin">+{{ grammarStore.gameResult?.coins || 0 }} 💰</span>
          </div>
          <div class="reward-item">
            <span class="reward-label">经验</span>
            <span class="reward-value exp">+{{ grammarStore.gameResult?.exp || 0 }} ⭐</span>
          </div>
          <div v-if="grammarStore.gameResult?.keysEarned" class="reward-item">
            <span class="reward-label">钥匙</span>
            <span class="reward-value key">+{{ grammarStore.gameResult.keysEarned }} 🔑</span>
          </div>
        </div>
        <div class="victory-actions">
          <button class="btn-retry-tower" @click="retryTower">🔄 再来一次</button>
          <button class="btn-back-castle" @click="goBack">🏰 返回城堡</button>
        </div>
      </div>
    </div>

    <!-- ========== 游戏结束 ========== -->
    <div v-else-if="grammarStore.gamePhase === 'gameOver'" class="game-over">
      <div class="result-card fail-card">
        <h2>😢 挑战失败</h2>
        <p class="fail-floor">第 {{ grammarStore.currentFloor }} 层 未能通关</p>
        <div class="fail-stats">
          <p>答对 {{ grammarStore.floorCorrectCount }} / {{ grammarStore.floorQuestions.length }}</p>
          <p>得分: {{ grammarStore.score }}</p>
        </div>
        <div class="fail-actions">
          <button class="btn-retry-floor" @click="retryFloor">🔄 重试本层</button>
          <button class="btn-back-castle" @click="goBack">🏰 返回城堡</button>
        </div>
      </div>
    </div>

    <!-- ========== 空态/加载中 ========== -->
    <div v-else class="empty-state">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useEnglishGrammarStore } from '../store/englishGrammarStore';
import { getTowerById, getFloorByNumber } from '../config/english/grammar';
import englishSpeech from '../utils/englishSpeech';
import GameTutorial from './GameTutorial.vue';
import EnglishVoiceCompare from './EnglishVoiceCompare.vue';
import EnglishCategorize from './EnglishCategorize.vue';
import EnglishMatch from './EnglishMatch.vue';
import EnglishImageChoice from './EnglishImageChoice.vue';
import EnglishVerbTable from './EnglishVerbTable.vue';
import EnglishTransform from './EnglishTransform.vue';
import EnglishConnector from './EnglishConnector.vue';
import EnglishDialogueChoice from './EnglishDialogueChoice.vue';

const props = defineProps({
  towerId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['back', 'towerComplete']);

// ============ Store ============
const grammarStore = useEnglishGrammarStore();

// ============ 玩法说明 ============
const showTutorial = ref(false);

const closeTutorial = () => {
  showTutorial.value = false;
};

const grammarGameTutorialSteps = [
  {
    title: '教学关',
    description: '进入新语法塔后，先观看本塔的语法规则教学，学习核心知识点和例句后再开始闯关。'
  },
  {
    title: '答题闯关',
    description: '教学关之后进入正式挑战，每层包含多道题目，需要全部解答才能通关。'
  },
  {
    title: '题型介绍',
    description: '包含选择题、填空题、排序题、分类题、配对题、看图题、动词变形、句式转换等多种题型，丰富不枯燥。'
  },
  {
    title: '生命力',
    description: '每层开始时有一定数量的生命力（❤️），答错题目会扣除生命力。生命力归零则本层挑战失败。'
  },
  {
    title: '计时规则',
    description: '每道题限时15秒作答，超时自动判错并进入下一题。注意顶部计时条的变化！'
  },
  {
    title: '连击与计分',
    description: '连续答对可累积连击（🔥），连击越高单题得分越多。答错会打断连击计数。'
  },
  {
    title: 'BOSS战',
    description: '每层最后有BOSS战，需要连续答对指定次数才能击败BOSS通关。BOSS战时生命力不会减少！'
  }
];

// ============ 本地状态 ============
const answered = ref(false);
const selectedAnswer = ref(null);
const fillInput = ref('');
const answeredCorrectly = ref(false);
const showVoiceCompare = ref(false);
const voiceExpectedText = ref('');

// 排序题本地状态
const shuffledWords = ref([]);
const placedOrder = ref([]);

// 计时器
let timerInterval = null;
let feedbackTimer = null;
let isComponentMounted = false;

// ============ 计算属性 ============
const towerData = computed(() => getTowerById(props.towerId));

const currentQuestion = computed(() => grammarStore.currentQuestion);

const currentType = computed(() => grammarStore.currentType);

const currentTutorial = computed(() => {
  const tower = towerData.value;
  return tower?.tutorial || { title: '', rules: [] };
});

const floorData = computed(() => {
  if (!towerData.value || grammarStore.currentFloor <= 0) return null;
  return getFloorByNumber(props.towerId, grammarStore.currentFloor);
});

const boss = computed(() => {
  return floorData.value?.boss || { name: '语法魔王', icon: '👹', hp: 3 };
});

const floorStars = computed(() => grammarStore.floorStars);

// BOSS 战错误部分提取
const bossErrorPart = computed(() => {
  const q = currentQuestion.value;
  if (!q || !q.wrongSentence) return '';
  const words = q.wrongSentence.trim().split(/\s+/);
  const options = (q.options || []).map(o => o.toLowerCase());
  const answer = (q.answer || '').toLowerCase();
  for (let i = 0; i < words.length; i++) {
    const clean = words[i].replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (options.includes(clean) && clean !== answer) {
      return words[i];
    }
  }
  return '';
});

const bossRestPart = computed(() => {
  const q = currentQuestion.value;
  if (!q || !q.wrongSentence) return '';
  const words = q.wrongSentence.trim().split(/\s+/);
  const options = (q.options || []).map(o => o.toLowerCase());
  const answer = (q.answer || '').toLowerCase();
  let errorIndex = -1;
  for (let i = 0; i < words.length; i++) {
    const clean = words[i].replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (options.includes(clean) && clean !== answer) {
      errorIndex = i;
      break;
    }
  }
  if (errorIndex === -1) return words.join(' ');
  return words.slice(errorIndex + 1).join(' ');
});

// ============ 渲染辅助函数 ============
function renderSentence(sentence, blanks) {
  if (!sentence) return '';
  // HTML 转义防止 XSS
  const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  let html = escapeHtml(sentence);
  if (blanks && blanks.length > 0) {
    for (const blank of blanks) {
      html = html.replace(escapeHtml(blank), '<span class="sentence-blank">______</span>');
    }
  }
  return html;
}

function renderFillSentence(sentence) {
  if (!sentence) return '';
  return sentence.replace(/___/g, '______');
}

// ============ 洗牌工具 ============
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============ 语音播放 ============
async function playTTS(text) {
  if (!text) return;
  const initialized = await englishSpeech.init();
  if (!initialized) return;
  englishSpeech.speak(text, { rate: 0.9 });
}

// ============ 教学控制 ============
function skipTutorial() {
  grammarStore.skipTutorial();
  // gamePhase 变为 playing, startFloor 被调用
  startTimerIfNeeded();
}

function startGame() {
  grammarStore.completeTutorial();
  startTimerIfNeeded();
}

// ============ 计时器管理 ============
function startTimerIfNeeded() {
  stopTimer();
  if (grammarStore.gamePhase === 'playing') {
    timerInterval = setInterval(() => {
      if (isComponentMounted) {
        grammarStore.useTimerTick();
      }
    }, 1000);
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ============ 排序题初始化 ============
function initDragOrder() {
  const q = currentQuestion.value;
  if (q && q.words && q.words.length > 0) {
    const correctAnswer = q.answer.trim().split(/\s+/).filter(Boolean);
    if (q.words.length === correctAnswer.length) {
      shuffledWords.value = shuffleArray([...q.words]);
    } else {
      shuffledWords.value = shuffleArray([...q.words]);
    }
  } else {
    shuffledWords.value = [];
  }
  placedOrder.value = [];
}

// ============ 排序题交互 ============
function placeWord(index) {
  if (answered.value) return;
  if (placedOrder.value.includes(index)) return;
  placedOrder.value.push(index);
}

function removeWord(index) {
  if (answered.value) return;
  placedOrder.value.splice(index, 1);
}

function checkOrder() {
  if (answered.value) return;
  const answerWords = placedOrder.value.map(i => shuffledWords.value[i]);
  answered.value = true;
  selectedAnswer.value = null;

  const isCorrect = grammarStore.answerQuestion(answerWords);
  answeredCorrectly.value = isCorrect;

  const delay = isCorrect ? 500 : 1000;
  feedbackTimer = setTimeout(() => {
    if (!isComponentMounted) return;
    handlePostAnswer(isCorrect);
  }, delay);
}

// ============ 选择题/填空题/BOSS战答题 ============
function selectAnswer(answer) {
  if (answered.value) return;

  answered.value = true;
  selectedAnswer.value = answer;

  const isCorrect = grammarStore.answerQuestion(answer);
  answeredCorrectly.value = isCorrect;

  const delay = isCorrect ? 500 : 1000;
  feedbackTimer = setTimeout(() => {
    if (!isComponentMounted) return;
    handlePostAnswer(isCorrect);
  }, delay);
}

function submitFill() {
  if (answered.value || !fillInput.value.trim()) return;

  answered.value = true;
  selectedAnswer.value = fillInput.value.trim();

  const isCorrect = grammarStore.answerQuestion(fillInput.value.trim());
  answeredCorrectly.value = isCorrect;

  const delay = isCorrect ? 500 : 1000;
  feedbackTimer = setTimeout(() => {
    if (!isComponentMounted) return;
    handlePostAnswer(isCorrect);
  }, delay);
}

// ============ 新题型答题处理 ============
function handleNewTypeAnswer(payload) {
  if (answered.value) return;

  answered.value = true;
  selectedAnswer.value = payload.answer;

  const isCorrect = grammarStore.answerQuestion(payload.answer);
  answeredCorrectly.value = isCorrect;

  const delay = isCorrect ? 500 : 1000;
  feedbackTimer = setTimeout(() => {
    if (!isComponentMounted) return;
    handlePostAnswer(isCorrect);
  }, delay);
}

// ============ 答题后处理 ============
function handlePostAnswer(isCorrect) {
  feedbackTimer = null;

  if (grammarStore.gamePhase === 'playing') {
    // 检查是否随机插入语音跟读
    if (isCorrect && Math.random() < 0.3 && voicePromptText.value) {
      showVoiceCompare.value = true;
      voiceExpectedText.value = voicePromptText.value;
    } else {
      advanceQuestion();
    }
  } else {
    // 阶段切换: floorResult / gameOver / victory
    resetAnswerState();
    if (grammarStore.gamePhase !== 'playing') {
      stopTimer();
    }
  }
}

const voicePromptText = computed(() => {
  // 使用当前题目的 voicePrompt 或句子作为跟读文本
  const q = currentQuestion.value;
  if (q?.voicePrompt) return q.voicePrompt;
  if (q?.sentence) return q.sentence;
  if (q?.answer) return q.answer;
  return '';
});

function advanceQuestion() {
  resetAnswerState();
  // store 已自动推进到下一题
  if (currentType.value === 'dragOrder') {
    initDragOrder();
  }
}

function resetAnswerState() {
  answered.value = false;
  selectedAnswer.value = null;
  fillInput.value = '';
  answeredCorrectly.value = false;
}

// ============ 语音跟读回调 ============
function onVoiceComplete(_result) {
  showVoiceCompare.value = false;
  voiceExpectedText.value = '';
  advanceQuestion();
}

function onVoiceSkip() {
  showVoiceCompare.value = false;
  voiceExpectedText.value = '';
  advanceQuestion();
}

// ============ 楼层导航 ============
function goNextFloor() {
  stopTimer();
  grammarStore.nextFloor();
  // 如果进入新的 playing，启动计时器
  if (grammarStore.gamePhase === 'playing') {
    if (currentType.value === 'dragOrder') {
      // wait for next tick for question to update
      setTimeout(() => initDragOrder(), 50);
    }
    startTimerIfNeeded();
  } else if (grammarStore.gamePhase === 'victory') {
    emit('towerComplete', grammarStore.gameResult);
  }
}

function retryFloor() {
  stopTimer();
  grammarStore.startFloor(grammarStore.currentFloor);
  if (currentType.value === 'dragOrder') {
    setTimeout(() => initDragOrder(), 50);
  }
  startTimerIfNeeded();
}

function retryTower() {
  stopTimer();
  grammarStore.enterTower(props.towerId);
  if (grammarStore.gamePhase === 'playing') {
    startTimerIfNeeded();
  }
}

function goBack() {
  stopTimer();
  grammarStore.resetGame();
  emit('back');
}

// ============ 阶段变化监听 ============
watch(() => grammarStore.gamePhase, (newPhase, oldPhase) => {
  if (newPhase === 'playing') {
    // 初始化排序题
    if (currentType.value === 'dragOrder') {
      initDragOrder();
    }
    startTimerIfNeeded();
  } else if (oldPhase === 'playing') {
    stopTimer();
  }
});

// ============ 生命周期 ============
onMounted(() => {
  isComponentMounted = true;

  // 初始化语音
  englishSpeech.init();

  // 进入塔
  grammarStore.enterTower(props.towerId);

  // 如果直接进入 playing（恢复进度），启动计时器
  if (grammarStore.gamePhase === 'playing') {
    if (currentType.value === 'dragOrder') {
      initDragOrder();
    }
    startTimerIfNeeded();
  }
});

onUnmounted(() => {
  isComponentMounted = false;
  stopTimer();
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }
  englishSpeech.stop();
  // Reset 由父组件控制，不在 unmount 时自动 reset
});
</script>

<style scoped>
.english-grammar-game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  color: #fff;
  overflow-y: auto;
  background: linear-gradient(
    180deg,
    rgba(30, 10, 60, 1) 0%,
    rgba(20, 5, 40, 1) 100%
  );
  position: relative;
}

/* ========== 状态栏 ========== */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: rgba(180, 120, 255, 0.1);
  border: 1px solid rgba(180, 120, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.lives-display {
  display: flex;
  gap: 2px;
  font-size: 1.1rem;
}

.tower-name {
  font-size: 1rem;
  color: #e8c8ff;
  font-weight: bold;
}

.status-center {
  display: flex;
  align-items: center;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-display {
  font-size: 1rem;
  color: #ffd700;
  font-weight: bold;
}

.btn-help {
  padding: 0.35rem 0.9rem;
  background: rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-help:hover {
  background: rgba(102, 126, 234, 0.5);
}

.combo-display {
  font-size: 0.95rem;
  color: #f97316;
  font-weight: bold;
  animation: comboPulse 0.5s ease;
}

/* ========== 计时条 ========== */
.timer-bar {
  position: relative;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4, #10b981);
  border-radius: 12px;
  transition: width 1s linear;
}

.timer-fill.warning {
  background: linear-gradient(90deg, #ef4444, #dc2626);
  animation: timerPulse 0.5s infinite;
}

.timer-text {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.timer-text.warning {
  color: #fca5a5;
}

/* ========== 教学关 ========== */
.tutorial-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
}

.tutorial-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.tutorial-icon {
  font-size: 2.5rem;
}

.tutorial-header h3 {
  margin: 0;
  font-size: 1.6rem;
  background: linear-gradient(135deg, #e8c8ff, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tutorial-rules {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 500px;
}

.rule-card {
  position: relative;
  padding: 1.2rem 1.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(180, 120, 255, 0.25);
  border-radius: 14px;
  transition: all 0.3s;
}

.rule-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(180, 120, 255, 0.4);
}

.rule-formula {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 0.3rem;
}

.rule-formula strong {
  color: #5eead4;
}

.rule-example {
  font-size: 1.1rem;
  color: #d4b8ff;
  margin-bottom: 0.3rem;
  font-style: italic;
}

.rule-explanation {
  font-size: 0.85rem;
  opacity: 0.7;
}

.btn-listen {
  position: absolute;
  right: 1rem;
  top: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-listen:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.tutorial-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-skip {
  padding: 0.7rem 1.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: #d4b8ff;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-skip:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-start {
  padding: 0.7rem 1.8rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  border-radius: 25px;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

/* ========== 游戏区域 ========== */
.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.question-type {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

/* ========== 题目句子 ========== */
.question-sentence {
  font-size: 1.6rem;
  text-align: center;
  font-weight: bold;
  color: #e8c8ff;
  line-height: 1.6;
  padding: 1.2rem 1.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(180, 120, 255, 0.2);
  border-radius: 14px;
  width: 100%;
  word-break: break-word;
}

:deep(.sentence-blank) {
  color: #fbbf24;
  text-decoration: underline;
  text-decoration-style: wavy;
  text-underline-offset: 4px;
  font-weight: bold;
}

/* ========== 选项网格 ========== */
.options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  width: 100%;
  max-width: 400px;
}

.option-btn {
  padding: 1rem 0.8rem;
  font-size: 1.3rem;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(180, 120, 255, 0.3);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.option-btn:hover:not(:disabled) {
  background: rgba(180, 120, 255, 0.2);
  border-color: #b078ff;
  transform: translateY(-2px);
}

.option-btn:disabled {
  cursor: default;
  opacity: 0.85;
}

.option-btn.correct {
  background: rgba(52, 211, 153, 0.3);
  border-color: #34d399;
  animation: correctFlash 0.5s ease;
}

.option-btn.wrong {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
  animation: shake 0.4s ease;
}

/* ========== 填空题 ========== */
.fill-blank .question-sentence {
  font-size: 1.5rem;
  letter-spacing: 0.05em;
}

.input-area {
  display: flex;
  gap: 0.8rem;
  width: 100%;
  max-width: 400px;
}

.fill-input {
  flex: 1;
  padding: 0.8rem 1rem;
  font-size: 1.3rem;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(180, 120, 255, 0.3);
  border-radius: 10px;
  color: #fff;
  outline: none;
  text-align: center;
  transition: all 0.2s;
}

.fill-input:focus {
  border-color: #b078ff;
  box-shadow: 0 0 15px rgba(180, 120, 255, 0.3);
}

.fill-input.correct {
  border-color: #34d399;
  background: rgba(52, 211, 153, 0.15);
}

.fill-input.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.btn-confirm {
  padding: 0.8rem 1.4rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.btn-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.feedback-wrong {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.95rem;
}

.feedback-wrong strong {
  color: #fbbf24;
}

/* ========== 排序题 ========== */
.question-hint {
  font-size: 1rem;
  opacity: 0.7;
  text-align: center;
  margin: 0;
}

.order-target {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
  margin: 0;
  word-break: break-all;
}

.word-bank {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  min-height: 50px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 2px dashed rgba(180, 120, 255, 0.2);
  border-radius: 12px;
  width: 100%;
}

.word-chip {
  padding: 0.5rem 1rem;
  background: rgba(180, 120, 255, 0.15);
  border: 1px solid rgba(180, 120, 255, 0.4);
  border-radius: 20px;
  font-size: 1.1rem;
  color: #e8c8ff;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.word-chip:hover:not(.used) {
  background: rgba(180, 120, 255, 0.3);
  transform: translateY(-2px);
}

.word-chip.used {
  opacity: 0.3;
  cursor: default;
  text-decoration: line-through;
}

.sentence-area {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  min-height: 50px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(180, 120, 255, 0.25);
  border-radius: 12px;
  width: 100%;
}

.placement-hint {
  opacity: 0.35;
  font-size: 0.9rem;
  color: #d4b8ff;
}

.word-placed {
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.2);
  border: 2px solid rgba(16, 185, 129, 0.4);
  border-radius: 20px;
  font-size: 1.1rem;
  color: #5eead4;
  cursor: pointer;
  transition: all 0.2s;
  animation: placeIn 0.2s ease;
}

.word-placed:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.word-placed.wrong {
  background: rgba(239, 68, 68, 0.25);
  border-color: #ef4444;
  color: #fca5a5;
}

.btn-check {
  padding: 0.7rem 2rem;
  background: linear-gradient(135deg, #06b6d4, #10b981);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-check:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
}

/* ========== BOSS战 ========== */
.boss-area {
  width: 100%;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 14px;
}

.boss-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.boss-icon {
  font-size: 2.5rem;
}

.boss-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #ef4444;
}

.boss-hp-bar {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  overflow: hidden;
  max-width: 120px;
}

.boss-hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #f97316);
  border-radius: 5px;
  transition: width 0.4s ease;
}

.boss-hp-text {
  font-size: 0.85rem;
  color: #fca5a5;
  font-weight: bold;
}

.boss-speech {
  padding: 0.8rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.boss-sentence-label {
  margin: 0 0 0.3rem;
  font-size: 0.85rem;
  opacity: 0.6;
}

.boss-sentence {
  margin: 0;
  font-size: 1.2rem;
  color: #fca5a5;
  font-style: italic;
  line-height: 1.4;
}

.error-part {
  color: #ef4444;
  font-weight: bold;
  text-decoration: underline;
  text-decoration-color: #ef4444;
}

.boss-action-hint {
  font-size: 0.95rem;
  opacity: 0.7;
  text-align: center;
  margin: 0;
}

.boss-option {
  font-size: 1.5rem;
  padding: 1.2rem 0.8rem;
}

.boss-combo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.combo-dot {
  font-size: 1.2rem;
  transition: all 0.3s;
}

.combo-dot.filled {
  transform: scale(1.2);
}

.combo-label {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-left: 0.5rem;
}

.btn-voice-hint {
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  color: #94a3b8;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-voice-hint:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* ========== 未知题型兜底 ========== */
.unknown-type {
  width: 100%;
  max-width: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.unknown-hint {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
}

.question-progress {
  font-size: 0.85rem;
  opacity: 0.5;
  text-align: center;
  margin-top: 0.5rem;
}

/* ========== 层结算 ========== */
.floor-result,
.tower-result,
.game-over {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.result-card {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  background: linear-gradient(
    135deg,
    rgba(100, 50, 180, 0.2),
    rgba(180, 120, 50, 0.15)
  );
  border: 2px solid rgba(180, 120, 255, 0.3);
  border-radius: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.result-card h2 {
  margin: 0;
  font-size: 1.6rem;
  background: linear-gradient(135deg, #e8c8ff, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stars-display {
  display: flex;
  gap: 0.5rem;
  font-size: 2rem;
}

.star-icon.filled {
  animation: starPop 0.4s ease;
}

.star-icon {
  transition: all 0.3s;
}

.result-stats {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.7;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: bold;
}

.stat-value.correct {
  color: #34d399;
}

.stat-value.wrong {
  color: #ef4444;
}

.stat-value.combo {
  color: #f97316;
}

/* ========== 塔结算 ========== */
.victory-card {
  border-color: rgba(255, 215, 0, 0.4);
  background: linear-gradient(
    135deg,
    rgba(100, 50, 180, 0.25),
    rgba(180, 120, 50, 0.2)
  );
}

.stars-summary {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.9rem;
}

.floor-star-row {
  opacity: 0.8;
}

.total-stars {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffd700;
}

.reward-stats {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.reward-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reward-label {
  font-size: 0.8rem;
  opacity: 0.6;
}

.reward-value {
  font-size: 1.3rem;
  font-weight: bold;
}

.reward-value.coin {
  color: #fbbf24;
}

.reward-value.exp {
  color: #a78bfa;
}

.reward-value.key {
  color: #34d399;
}

/* ========== 失败页 ========== */
.fail-card {
  border-color: rgba(239, 68, 68, 0.3);
}

.fail-card h2 {
  -webkit-text-fill-color: #ef4444;
  background: none;
  color: #ef4444;
}

.fail-floor {
  font-size: 1.1rem;
  opacity: 0.8;
  margin: 0;
}

.fail-stats {
  opacity: 0.7;
  line-height: 1.8;
}

.fail-stats p {
  margin: 0;
}

/* ========== 按钮通用 ========== */
.btn-next-floor,
.btn-retry-tower,
.btn-back-castle,
.btn-retry-floor {
  padding: 0.7rem 1.8rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  color: #fff;
}

.btn-next-floor {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.btn-next-floor:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.btn-retry-tower {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.btn-retry-tower:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
}

.btn-retry-floor {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.btn-retry-floor:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.btn-back-sm {
  padding: 0.35rem 0.9rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  color: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-back-sm:hover {
  background: rgba(255, 255, 255, 0.25);
}

.btn-back-castle {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-back-castle:hover {
  background: rgba(255, 255, 255, 0.25);
}

.victory-actions,
.fail-actions,
.floor-result-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.tutorial-top-bar {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0.5rem;
}

/* ========== 空态 ========== */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

/* ========== 动画 ========== */
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

@keyframes timerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes comboPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes placeIn {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes starPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .english-grammar-game {
    padding: 1rem;
  }

  .status-bar {
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .question-sentence {
    font-size: 1.3rem;
    padding: 1rem;
  }

  .options-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .option-btn {
    padding: 0.8rem 0.5rem;
    font-size: 1.1rem;
  }

  .input-area {
    flex-direction: column;
    align-items: stretch;
  }

  .fill-input {
    font-size: 1.1rem;
  }

  .btn-confirm {
    width: 100%;
  }

  .result-card {
    padding: 1.5rem;
  }

  .result-card h2 {
    font-size: 1.3rem;
  }

  .stars-display {
    font-size: 1.6rem;
  }

  .reward-stats {
    gap: 0.8rem;
  }

  .victory-actions,
  .fail-actions {
    flex-direction: column;
    width: 100%;
  }

  .victory-actions button,
  .fail-actions button {
    width: 100%;
  }

  .tutorial-actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .tutorial-actions button {
    width: 100%;
  }

  .word-chip,
  .word-placed {
    font-size: 1rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>
