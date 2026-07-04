<template>
  <div class="market-challenge">
    <GameTutorial
      v-if="showTutorial"
      title="🏪 超市大挑战玩法说明"
      :steps="marketTutorialSteps"
      @close="closeTutorial"
    />

    <div class="market-header">
      <div class="header-title">
        <span v-if="phase === 'select'">🏪 超市大挑战</span>
        <span v-else-if="phase === 'playing'">{{ currentModeIcon }} {{ currentModeName }}</span>
        <span v-else>📊 挑战结果</span>
      </div>
      <div v-if="phase === 'playing' && marketStore.mode === 'speed'" class="timer-display" :class="{ urgent: marketStore.timeLeft <= 10 }">
        <span class="timer-icon">⏱️</span>
        <span class="timer-value">{{ marketStore.timeLeft }}s</span>
      </div>
      <button class="btn-back" @click="handleBack">← 返回</button>
    </div>

    <!-- Phase: Mode Selection -->
    <div v-if="phase === 'select'" class="mode-select">
      <div class="select-header">
        <h2 class="game-title">🏪 超市大挑战</h2>
        <button class="btn-help" @click="showTutorial = true">❓ 玩法说明</button>
      </div>
      <p class="game-desc">在购物和收银场景中锻炼数学计算能力！</p>

      <div class="mode-grid">
        <div
          v-for="card in modeCards"
          :key="card.id"
          class="mode-card"
          :style="{ background: card.gradient }"
          @click="startMode(card.id)"
        >
          <div class="mode-card-icon">{{ card.icon }}</div>
          <div class="mode-card-info">
            <h3 class="mode-card-name">{{ card.name }}</h3>
            <p class="mode-card-desc">{{ card.description }}</p>
            <span class="mode-card-grade">
              {{ card.gradeRange[0] }}-{{ card.gradeRange[1] }}年级
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Phase: Playing -->
    <div v-if="phase === 'playing'" class="game-screen">
      <!-- Customer & Items -->
      <div v-if="marketStore.customer" class="customer-section">
        <div class="customer-bubble">
          <div class="customer-avatar">🧑‍🤝‍🧑</div>
          <div class="customer-text">
            <p class="customer-name">{{ marketStore.customer.name }}</p>
            <p class="customer-dialogue">{{ marketStore.customer.dialogue }}</p>
          </div>
        </div>

        <div class="items-list">
          <h4 class="items-title">📋 购物清单</h4>
          <div
            v-for="(item, idx) in marketStore.items"
            :key="idx"
            class="item-row"
          >
            <span class="item-icon">{{ item.product.icon }}</span>
            <span class="item-name">{{ item.product.name }}</span>
            <span class="item-price">{{ item.product.price }}元/个</span>
            <span class="item-qty">× {{ item.quantity }}</span>
          </div>
        </div>
      </div>

      <!-- Problem Area -->
      <div v-if="marketStore.problem" class="problem-area">
        <div class="problem-question">{{ marketStore.problem.questionText }}</div>

        <!-- Step 1: Input answer (shopping mode & cashier total step) -->
        <div
          v-if="marketStore.problem.step === 'answer' || marketStore.problem.step === 'total'"
          class="answer-section"
        >
          <div class="input-row">
            <input
              v-model="userAnswer"
              type="number"
              class="answer-input"
              placeholder="输入答案..."
              @keyup.enter="handleSubmitAnswer"
            >
            <span class="input-unit">元</span>
          </div>
          <button
            class="btn-submit"
            :disabled="userAnswer === ''"
            @click="handleSubmitAnswer"
          >
            ✍️ 确认答案
          </button>
        </div>

        <!-- Step 2: Coin selector (cashier/speed change step) -->
        <div v-if="marketStore.problem.step === 'change'" class="change-section">
          <div class="change-info">
            <p>总价 <strong class="highlight">{{ marketStore.problem.totalCost }}</strong> 元，</p>
            <p>顾客给了 <strong class="highlight">{{ marketStore.problem.payment }}</strong> 元，</p>
            <p>应找零 <strong class="highlight-correct">{{ marketStore.problem.change }}</strong> 元</p>
          </div>

          <!-- Denominations -->
          <div class="denomination-grid">
            <div
              v-for="denom in marketStore.availableDenominations"
              :key="denom.value"
              class="denomination-btn"
              :style="{ borderColor: denom.color }"
              @click="handleAddCoin(denom.value)"
            >
              <span class="denom-icon">{{ denom.icon }}</span>
              <span class="denom-label">{{ denom.name }}</span>
              <span v-if="getCoinCount(denom.value) > 0" class="denom-count">
                ×{{ getCoinCount(denom.value) }}
              </span>
            </div>
          </div>

          <!-- Selected Change -->
          <div class="selected-change">
            <h4 class="section-title">已选找零</h4>
            <div v-if="Object.keys(marketStore.selectedChange).length === 0" class="empty-hint">
              请点击上方货币添加找零
            </div>
            <div v-else class="selected-list">
              <div
                v-for="(count, value) in marketStore.selectedChange"
                :key="value"
                class="selected-item"
              >
                <span class="sel-icon">{{ getDenomIcon(Number(value)) }}</span>
                <span class="sel-value">¥{{ Number(value).toFixed(2) }}</span>
                <span class="sel-count">×{{ count }}</span>
                <button class="remove-btn" @click="handleRemoveCoin(Number(value))">×</button>
              </div>
            </div>
            <div class="total-row">
              找零总额：
              <span
                class="total-amount"
                :class="{
                  correct: marketStore.selectedTotal === marketStore.problem.change,
                  incorrect: marketStore.selectedTotal !== marketStore.problem.change
                }"
              >
                ¥{{ marketStore.selectedTotal.toFixed(2) }}
              </span>
            </div>
          </div>

          <button class="btn-submit btn-submit-change" @click="handleSubmitChange">
            ✅ 确认找零
          </button>
        </div>

        <!-- Feedback -->
        <div v-if="feedbackMessage" class="feedback" :class="'feedback-' + feedbackType">
          {{ feedbackMessage }}
        </div>
      </div>

      <!-- Actions -->
      <div class="game-actions">
        <button
          v-if="feedbackType === 'correct' && (marketStore.mode === 'shopping' || changeCompleted)"
          class="btn-next"
          @click="handleNextRound"
        >
          下一题 →
        </button>
        <button class="btn-end" @click="handleEndGame">
          🏁 结束挑战
        </button>
      </div>
    </div>

    <!-- Phase: Result -->
    <div v-if="phase === 'result'" class="result-panel">
      <div class="result-card">
        <div class="result-icon">🎉</div>
        <h3 class="result-title">挑战完成！</h3>

        <div class="result-stats">
          <div class="stat-row">
            <span class="stat-label">模式</span>
            <span class="stat-value">{{ currentModeName }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">答对题数</span>
            <span class="stat-value highlight">{{ marketStore.correctCount }} 题</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">总场次</span>
            <span class="stat-value">{{ marketStore.gamesPlayed }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">最高分</span>
            <span class="stat-value highlight-correct">{{ bestScore }}</span>
          </div>
        </div>

        <div class="result-stars">
          <span v-for="s in starCount" :key="s" class="star">⭐</span>
        </div>

        <div class="result-actions">
          <button class="btn-retry" @click="retryGame">再来一次</button>
          <button class="btn-menu" @click="handleBack">返回选择</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useCardStore } from '../store/cardStore';
import { useMarketStore } from '../store/marketStore';
import { modeConfig, denominations } from '../config/market';
import GameTutorial from './GameTutorial.vue';

const marketStore = useMarketStore();
const emit = defineEmits(['back']);

// Phase state
const phase = ref('select');
const userAnswer = ref('');
const feedbackMessage = ref('');
const feedbackType = ref('');
const changeCompleted = ref(false);
const showTutorial = ref(false);

const marketTutorialSteps = [
  {
    title: '选择模式',
    description: '超市大挑战有四种模式：新手购物、购物小能手、收银员挑战和限时速算，每种模式适合不同年级，难度递增。'
  },
  {
    title: '新手购物',
    description: '适合1-2年级学生。根据购物清单计算商品总价，练习基本的加减法运算，轻松入门！'
  },
  {
    title: '购物小能手',
    description: '适合3年级以上学生。计算商品总价并进行找零计算，练习加减法和货币换算，提升心算能力。'
  },
  {
    title: '收银员挑战',
    description: '模拟真实收银员工作！计算总价后，用正确的硬币组合找零给顾客，锻炼综合计算能力。'
  },
  {
    title: '限时速算',
    description: '60秒限时挑战！答对一题得10分，连续答对有连击加成，尽可能多答题获得高分！'
  },
  {
    title: '计分与奖励',
    description: '答对题目获得分数，3星通关可获得卡牌碎片奖励。全部答对（完美通关）还可额外获得碎片！'
  }
];

const closeTutorial = () => {
  showTutorial.value = false;
};

// Mode cards for selection screen
const modeCards = [
  { id: 'beginner', ...modeConfig.beginner },
  { id: 'shopper', ...modeConfig.shopper },
  { id: 'cashier', ...modeConfig.cashier },
  { id: 'speed', ...modeConfig.speed }
];

// Computed
const currentModeIcon = computed(() => {
  if (!marketStore.mode) return '';
  const config = marketStore.currentConfig;
  return config?.icon || '';
});

const currentModeName = computed(() => {
  if (!marketStore.mode) return '';
  const config = marketStore.currentConfig;
  return config?.name || marketStore.mode;
});

const bestScore = computed(() => {
  const scores = marketStore.highScores;
  return Math.max(scores.easy || 0, scores.medium || 0, scores.hard || 0);
});

const starCount = computed(() => {
  const count = marketStore.correctCount;
  if (count >= 10) return 3;
  if (count >= 6) return 2;
  if (count >= 3) return 1;
  return 0;
});

// Helpers
function getCoinCount(value) {
  const key = String(value);
  return marketStore.selectedChange[key] || 0;
}

function getDenomIcon(value) {
  const found = denominations.find(d => d.value === value);
  return found ? found.icon : '💰';
}

// Actions
function startMode(modeId) {
  const config = modeConfig[modeId];
  const grade = config.gradeRange[0];

  // Map mode card ID to store mode
  let storeMode = 'shopping';
  if (modeId === 'cashier') storeMode = 'cashier';
  else if (modeId === 'speed') storeMode = 'speed';

  marketStore.startGame(storeMode, grade);
  resetFeedback();
  phase.value = 'playing';
}

function handleSubmitAnswer() {
  if (userAnswer.value === '' || userAnswer.value === null) return;

  const result = marketStore.submitAnswer(Number(userAnswer.value));
  feedbackMessage.value = result.message;
  feedbackType.value = result.correct ? 'correct' : 'wrong';
  userAnswer.value = '';
}

function handleAddCoin(value) {
  marketStore.addCoin(value);
}

function handleRemoveCoin(value) {
  marketStore.removeCoin(value);
}

function handleSubmitChange() {
  const result = marketStore.submitChange();
  feedbackMessage.value = result.message;
  feedbackType.value = result.correct ? 'correct' : 'wrong';
  if (result.correct) {
    changeCompleted.value = true;
  }
}

function handleNextRound() {
  resetFeedback();
  marketStore.nextRound();
}

function handleEndGame() {
  marketStore.endGame('success');
  resetFeedback();
  phase.value = 'result';

  // 卡牌碎片产出：3 星通关得 2 碎片
  if (starCount.value >= 3) {
    const cardStore = useCardStore();
    cardStore.earnShard('math', 2);
  }
  // 连续正确额外奖励：全部答对（完美通关）额外得 1 碎片
  const totalRounds = marketStore.round + 1;
  if (marketStore.correctCount >= totalRounds && marketStore.correctCount > 0) {
    const cardStore = useCardStore();
    cardStore.earnShard('math', 1);
  }
}

function handleBack() {
  marketStore.reset();
  resetFeedback();
  phase.value = 'select';
  emit('back');
}

function retryGame() {
  resetFeedback();
  startMode(getCurrentModeId());
}

function getCurrentModeId() {
  const mode = marketStore.mode;
  const grade = marketStore.grade;
  if (mode === 'shopping') {
    return grade <= 2 ? 'beginner' : 'shopper';
  }
  if (mode === 'cashier') return 'cashier';
  if (mode === 'speed') return 'speed';
  return 'beginner';
}

function resetFeedback() {
  userAnswer.value = '';
  feedbackMessage.value = '';
  feedbackType.value = '';
  changeCompleted.value = false;
}

onUnmounted(() => {
  marketStore.clearTimer();
});
</script>

<style scoped>
.market-challenge {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow-y: auto;
}

.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.header-title {
  font-size: 1.15rem;
  font-weight: bold;
}

.btn-back {
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.95rem;
}

.timer-display.urgent {
  background: rgba(239, 68, 68, 0.3);
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.timer-icon {
  font-size: 1.1rem;
}

/* ---- Mode Selection ---- */
.mode-select {
  flex: 1;
  padding: 2rem 1.5rem;
  text-align: center;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-title {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.game-desc {
  color: #94a3b8;
  margin: 0 0 2rem 0;
  font-size: 1rem;
}

.select-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 0.5rem;
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

.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  max-width: 900px;
  width: 100%;
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #fff;
  text-align: left;
}

.mode-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.mode-card-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.mode-card-info {
  flex: 1;
  min-width: 0;
}

.mode-card-name {
  margin: 0 0 0.3rem 0;
  font-size: 1.2rem;
}

.mode-card-desc {
  margin: 0 0 0.4rem 0;
  font-size: 0.85rem;
  opacity: 0.9;
  line-height: 1.4;
}

.mode-card-grade {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 0.75rem;
}

/* ---- Game Screen ---- */
.game-screen {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.customer-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.customer-bubble {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem 1.2rem;
  border-radius: 16px;
}

.customer-avatar {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.customer-text {
  flex: 1;
}

.customer-name {
  margin: 0 0 0.2rem 0;
  font-weight: bold;
  font-size: 1rem;
}

.customer-dialogue {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
  line-height: 1.5;
}

.items-list {
  background: rgba(0, 0, 0, 0.25);
  padding: 1rem 1.2rem;
  border-radius: 16px;
}

.items-title {
  margin: 0 0 0.6rem 0;
  font-size: 0.95rem;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 0.3rem;
}

.item-row:last-child {
  margin-bottom: 0;
}

.item-icon {
  font-size: 1.3rem;
}

.item-name {
  flex: 1;
  font-weight: bold;
  font-size: 0.9rem;
}

.item-price {
  color: #fbbf24;
  font-size: 0.85rem;
}

.item-qty {
  color: #4ade80;
  font-weight: bold;
  font-size: 0.9rem;
}

/* ---- Problem Area ---- */
.problem-area {
  background: rgba(0, 0, 0, 0.25);
  padding: 1.2rem;
  border-radius: 16px;
}

.problem-question {
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  text-align: center;
}

/* Answer Input */
.answer-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 300px;
}

.answer-input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1.2rem;
  outline: none;
  transition: border-color 0.3s;
}

.answer-input:focus {
  border-color: #667eea;
}

.answer-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-unit {
  font-size: 1rem;
  color: #94a3b8;
  font-weight: bold;
}

/* Coin Change Section */
.change-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.change-info {
  text-align: center;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

.change-info p {
  margin: 0.2rem 0;
  font-size: 0.95rem;
}

.highlight {
  color: #fbbf24;
  font-weight: bold;
}

.highlight-correct {
  color: #4ade80;
  font-weight: bold;
}

.denomination-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.denomination-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.7rem 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.denomination-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
}

.denom-icon {
  font-size: 1.5rem;
}

.denom-label {
  font-size: 0.8rem;
  font-weight: bold;
}

.denom-count {
  font-size: 0.75rem;
  color: #fbbf24;
  font-weight: bold;
}

.selected-change {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 12px;
}

.section-title {
  margin: 0 0 0.6rem 0;
  font-size: 0.9rem;
}

.empty-hint {
  text-align: center;
  opacity: 0.5;
  padding: 1rem;
  font-size: 0.9rem;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.85rem;
}

.sel-icon {
  font-size: 1.1rem;
}

.sel-value {
  font-weight: bold;
}

.sel-count {
  color: #fbbf24;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
  margin-left: 0.3rem;
  line-height: 1;
}

.total-row {
  margin-top: 0.8rem;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  font-size: 1rem;
}

.total-amount {
  font-weight: bold;
  font-size: 1.1rem;
}

.total-amount.correct {
  color: #4ade80;
}

.total-amount.incorrect {
  color: #ef4444;
}

/* Buttons */
.btn-submit {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 140px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 222, 128, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit-change {
  background: linear-gradient(135deg, #667eea, #764ba2);
  width: 100%;
}

.btn-submit-change:hover:not(:disabled) {
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* Feedback */
.feedback {
  margin-top: 0.8rem;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  font-weight: bold;
  text-align: center;
  font-size: 0.95rem;
}

.feedback-correct {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.feedback-wrong {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Game Actions */
.game-actions {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.btn-next {
  padding: 0.7rem 1.8rem;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-next:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
}

.btn-end {
  padding: 0.7rem 1.8rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-end:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ---- Result Panel ---- */
.result-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.result-card {
  max-width: 400px;
  width: 100%;
  padding: 2.5rem;
  background: linear-gradient(135deg, #1e293b, #334155);
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.result-title {
  font-size: 1.8rem;
  margin: 0 0 1.5rem 0;
}

.result-stats {
  margin-bottom: 1.2rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #94a3b8;
}

.stat-value {
  font-weight: bold;
}

.result-stars {
  font-size: 2rem;
  margin: 1rem 0;
}

.star {
  margin: 0 0.2rem;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 1rem;
}

.btn-retry {
  padding: 0.7rem 1.8rem;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 222, 128, 0.4);
}

.btn-menu {
  padding: 0.7rem 1.8rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-menu:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .mode-grid {
    grid-template-columns: 1fr;
  }

  .mode-card {
    padding: 1rem;
  }

  .mode-card-icon {
    font-size: 2.2rem;
  }

  .game-screen {
    padding: 1rem;
  }

  .denomination-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .market-header {
    padding: 0.6rem 1rem;
  }
}
</style>
