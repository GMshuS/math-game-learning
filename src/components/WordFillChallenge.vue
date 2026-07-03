<template>
  <div class="wordfill-challenge">
    <!-- 模式选择 -->
    <div v-if="phase === 'select'" class="mode-select">
      <div class="header">
        <h2>📝 应用与填空</h2>
        <button class="btn-back" @click="$emit('back')">← 返回</button>
      </div>

      <div class="question-count-cards">
        <div
          v-for="count in questionCountOptions"
          :key="count"
          class="count-card"
          @click="startChallenge(count)"
        >
          <div class="count-number">{{ count }}</div>
          <div class="count-label">题</div>
        </div>
      </div>
    </div>

    <!-- 答题阶段 -->
    <div v-else-if="phase === 'playing'" class="game-area">
      <div class="game-header">
        <div class="progress">
          第 <strong>{{ currentIndex + 1 }}</strong> / {{ totalQuestions }} 题
        </div>
        <div class="stats">
          <span class="stat-correct">✅ {{ correctCount }}</span>
          <span class="stat-rate">📊 {{ correctRate }}%</span>
          <span v-if="combo >= 2" class="stat-combo">🔥 {{ combo }}连击</span>
        </div>
        <button class="btn-back-game" @click="goBackToSelect">← 返回</button>
      </div>

      <div class="question-area">
        <div class="question-text">{{ currentQuestion.question }}</div>

        <div class="answer-row">
          <input
            ref="answerInput"
            v-model="userAnswer"
            type="number"
            class="answer-input"
            placeholder="输入答案..."
            :disabled="submitted"
            @keyup.enter="submitAnswer"
          />
          <button
            class="btn-submit"
            :disabled="submitted || userAnswer === ''"
            @click="submitAnswer"
          >
            提交
          </button>
        </div>

        <div v-if="feedback" class="feedback" :class="feedback.type">
          {{ feedback.message }}
        </div>
      </div>
    </div>

    <!-- 结算阶段 -->
    <div v-else-if="phase === 'result'" class="result-area">
      <h2>🏁 挑战结束</h2>

      <div class="result-stats">
        <div class="stat">
          <div class="stat-value">{{ totalQuestions }}</div>
          <div class="stat-label">总题数</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ correctCount }}</div>
          <div class="stat-label">✅ 正确</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ correctRate }}%</div>
          <div class="stat-label">正确率</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ maxCombo }}</div>
          <div class="stat-label">🔥 最大连击</div>
        </div>
      </div>

      <div class="result-details">
        <p>⏱️ 用时：{{ elapsedTime }}</p>
      </div>

      <div class="result-actions">
        <button class="btn-retry" @click="goBackToSelect">再来一次</button>
        <button class="btn-back-result" @click="$emit('back')">返回大厅</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { generateQuestion } from '../utils/questionGenerator.js';
import { checkAnswer } from '../utils/questionUtils.js';
import { useGameStore } from '../store/gameStore.js';
import { useMathKnowledgeStore } from '../store/mathKnowledgeStore.js';

const emit = defineEmits(['back']);

const gameStore = useGameStore();
const mathKnowledgeStore = useMathKnowledgeStore();

// 阶段：select | playing | result
const phase = ref('select');

// 模式选择
const questionCountOptions = [10, 20, 30];

// 答题状态
const totalQuestions = ref(0);
const questions = ref([]);
const currentIndex = ref(0);
const userAnswer = ref('');
const submitted = ref(false);
const feedback = ref(null);
const submitTimer = ref(null);
const correctCount = ref(0);
const combo = ref(0);
const maxCombo = ref(0);
const startTime = ref(0);

const answerInput = ref(null);

const currentQuestion = computed(() => {
  return questions.value[currentIndex.value] || null;
});

const correctRate = computed(() => {
  const denominator = phase.value === 'result'
    ? totalQuestions.value
    : currentIndex.value + (submitted.value ? 1 : 0);
  if (denominator === 0) return 0;
  return Math.round((correctCount.value / denominator) * 100);
});

const elapsedTime = computed(() => {
  if (!startTime.value) return '0秒';
  const diff = Date.now() - startTime.value;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}秒`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}分${secs}秒`;
});

/**
 * 生成交替的 word / numberFill 题目
 */
function generateQuestions(count) {
  const grade = gameStore.playerData?.grade || 1;
  const result = [];
  for (let i = 0; i < count; i++) {
    // word 和 numberFill 交替
    const type = i % 2 === 0 ? 'word' : 'numberFill';
    const question = generateQuestion(grade, type);
    result.push(question);
  }
  return result;
}

function startChallenge(count) {
  totalQuestions.value = count;
  questions.value = generateQuestions(count);
  currentIndex.value = 0;
  correctCount.value = 0;
  combo.value = 0;
  maxCombo.value = 0;
  userAnswer.value = '';
  submitted.value = false;
  feedback.value = null;
  startTime.value = Date.now();
  phase.value = 'playing';

  nextTick(() => {
    if (answerInput.value) {
      answerInput.value.focus();
    }
  });
}

function submitAnswer() {
  if (submitted.value || userAnswer.value === '') return;

  const question = currentQuestion.value;
  if (!question) return;

  // 防重复提交：立即禁用
  submitted.value = true;

  const answer = Number(userAnswer.value);
  if (isNaN(answer)) return;
  const result = checkAnswer(question, answer);

  // 记录到 mathKnowledgeStore
  mathKnowledgeStore.recordResult(question.type, result.correct);

  if (result.correct) {
    correctCount.value++;
    combo.value++;
    if (combo.value > maxCombo.value) {
      maxCombo.value = combo.value;
    }
    feedback.value = {
      type: 'correct',
      message: '✅ 回答正确！'
    };
  } else {
    combo.value = 0;
    feedback.value = {
      type: 'wrong',
      message: `❌ 回答错误，正确答案是：${result.correctAnswer}`
    };
  }

  // 延迟后进入下一题
  if (submitTimer.value) clearTimeout(submitTimer.value);
  submitTimer.value = setTimeout(() => {
    feedback.value = null;
    userAnswer.value = '';
    submitted.value = false;
    submitTimer.value = null;

    if (currentIndex.value + 1 < totalQuestions.value) {
      currentIndex.value++;
      nextTick(() => {
        if (answerInput.value) {
          answerInput.value.focus();
        }
      });
    } else {
      // 所有题目答完，进入结算
      phase.value = 'result';
    }
  }, 1200);
}

function goBackToSelect() {
  if (submitTimer.value) {
    clearTimeout(submitTimer.value);
    submitTimer.value = null;
  }
  phase.value = 'select';
  questions.value = [];
  totalQuestions.value = 0;
  currentIndex.value = 0;
  userAnswer.value = '';
  submitted.value = false;
  feedback.value = null;
  correctCount.value = 0;
  combo.value = 0;
  maxCombo.value = 0;
  startTime.value = 0;
}
</script>

<style scoped>
.wordfill-challenge {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  color: #fff;
  overflow-y: auto;
}

/* ===== 模式选择 ===== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.btn-back {
  padding: 0.5rem 1.2rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.3);
}

.question-count-cards {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
}

.count-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2.5rem 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  min-width: 120px;
}

.count-card:hover {
  transform: translateY(-3px);
  border-color: #fbbf24;
  background: rgba(255, 255, 255, 0.15);
}

.count-number {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1;
}

.count-label {
  margin-top: 0.5rem;
  font-size: 1.2rem;
  opacity: 0.8;
}

/* ===== 答题阶段 ===== */
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
  gap: 0.8rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.progress {
  font-size: 1.1rem;
}

.stats {
  display: flex;
  gap: 1rem;
  font-size: 1rem;
}

.stat-correct {
  color: #4ade80;
}

.stat-rate {
  color: #fbbf24;
}

.stat-combo {
  color: #f97316;
  font-weight: bold;
}

.btn-back-game {
  padding: 0.5rem 1.2rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-back-game:hover {
  background: rgba(255, 255, 255, 0.3);
}

.question-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.question-text {
  font-size: 1.5rem;
  line-height: 1.6;
  text-align: center;
  max-width: 600px;
  white-space: pre-wrap;
  word-break: break-word;
}

.answer-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

.answer-input {
  flex: 1;
  padding: 1rem 1.2rem;
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  outline: none;
  transition: border-color 0.3s;
  -moz-appearance: textfield;
}

.answer-input::-webkit-outer-spin-button,
.answer-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.answer-input:focus {
  border-color: #fbbf24;
}

.answer-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border: none;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-submit:hover:not(:disabled) {
  transform: scale(1.05);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.feedback {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-align: center;
}

.feedback.correct {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.feedback.wrong {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* ===== 结算阶段 ===== */
.result-area {
  text-align: center;
  padding: 2rem;
}

.result-area h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
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
  margin-top: 0.3rem;
}

.result-details {
  margin: 1.5rem 0;
  opacity: 0.8;
  font-size: 1.1rem;
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
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #fff;
}

.btn-retry:hover {
  transform: scale(1.05);
}

.btn-back-result {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.btn-back-result:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .wordfill-challenge {
    padding: 1rem;
  }

  .question-count-cards {
    gap: 1rem;
    margin-top: 2rem;
  }

  .count-card {
    padding: 1.5rem 2rem;
    min-width: 80px;
  }

  .count-number {
    font-size: 2rem;
  }

  .question-text {
    font-size: 1.2rem;
  }

  .answer-input {
    font-size: 1.2rem;
    padding: 0.8rem 1rem;
  }

  .btn-submit {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }

  .stats {
    font-size: 0.85rem;
    gap: 0.6rem;
  }

  .result-stats {
    gap: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>