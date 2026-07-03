<template>
  <div class="targeted-training">
    <!-- ========== 选择阶段 ========== -->
    <div v-if="phase === 'select'" class="tt-phase">
      <div class="tt-header">
        <h2>🎯 针对性训练</h2>
        <button class="back-btn" @click="$emit('back')">← 返回</button>
      </div>

      <p class="tt-intro">选择你要集中训练的知识点，系统将根据年级生成对应难度的题目。</p>

      <!-- 弱项列表 -->
      <div v-if="weakNodes.length > 0" class="node-select-list">
        <div
          v-for="node in weakNodes"
          :key="node.id"
          class="node-select-item"
          :class="{ selected: selectedNodes.has(node.id) }"
          @click="toggleNode(node.id)"
        >
          <span class="node-chk">{{ selectedNodes.has(node.id) ? '✅' : '⬜' }}</span>
          <span class="node-icon">{{ node.icon }}</span>
          <div class="node-info">
            <span class="node-name">{{ node.label }}</span>
            <span class="node-stats">
              答题 {{ node.totalAttempts }} 次 · 错误 {{ node.wrongCount }} 次
            </span>
          </div>
          <div class="node-error-bar">
            <div class="node-error-fill" :style="{ width: node.errorRate + '%' }" />
          </div>
          <span class="node-error-rate">{{ node.errorRate }}%</span>
        </div>
      </div>

      <div v-else class="tt-empty">
        <p>🎉 暂无薄弱知识点</p>
        <p class="tt-hint">去挑战中心继续练习，系统会自动跟踪你的学习情况。</p>
      </div>

      <!-- 数量选择 + 开始按钮 -->
      <div v-if="weakNodes.length > 0" class="tt-actions">
        <div class="count-selector">
          <span>训练题数：</span>
          <button
            v-for="n in [10, 20, 30]"
            :key="n"
            :class="['count-btn', { active: trainingCount === n }]"
            @click="trainingCount = n"
          >
            {{ n }} 题
          </button>
        </div>
        <button
          class="btn-start"
          :disabled="selectedNodes.size === 0"
          @click="startTraining"
        >
          开始训练 (已选 {{ selectedNodes.size }} 个知识点)
        </button>
      </div>
    </div>

    <!-- ========== 答题阶段 ========== -->
    <div v-if="phase === 'answering'" class="tt-phase">
      <div class="tt-header">
        <button class="back-btn" @click="confirmQuit">← 退出训练</button>
        <h2>🎯 针对性训练</h2>
        <span class="tt-counter">{{ questionStore.currentNumber }} / {{ questionStore.totalQuestions }}</span>
      </div>

      <!-- 进度条 -->
      <div class="tt-progress">
        <div class="tt-progress-fill" :style="{ width: questionStore.progressPercent + '%' }" />
      </div>

      <!-- 当前题目 -->
      <!-- 英语题目使用 EnglishQuestionRenderer 渲染 -->
      <div v-if="questionStore.currentQuestion && isEnglish" class="tt-question">
        <EnglishQuestionRenderer
          :question="questionStore.currentQuestion"
          :disabled="questionStore.isAnswered"
          @answer="submitEnglishAnswer"
        />
      </div>
      <!-- 数学题目使用纯选择题按钮网格 -->
      <div v-else-if="questionStore.currentQuestion" class="tt-question">
        <p class="q-text">{{ questionStore.currentQuestion.question }}</p>
        <div class="q-options">
          <button
            v-for="(opt, idx) in questionStore.currentQuestion.options"
            :key="idx"
            class="q-option"
            :class="{
              correct: questionStore.isAnswered && opt === questionStore.currentQuestion.answer,
              wrong: questionStore.isAnswered && questionStore.lastAnswer === opt && !questionStore.isCorrect,
              disabled: questionStore.isAnswered
            }"
            :disabled="questionStore.isAnswered"
            @click="submitAnswer(opt)"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <!-- 答题反馈 -->
      <div v-if="questionStore.isAnswered" class="tt-feedback" :class="questionStore.isCorrect ? 'correct' : 'wrong'">
        <span v-if="questionStore.isCorrect">✅ 答对了！</span>
        <span v-else>❌ 答错了，正确答案是：{{ questionStore.currentQuestion?.answer }}</span>
      </div>

      <!-- 下一题按钮 -->
      <button
        v-if="questionStore.isAnswered && questionStore.hasNext"
        class="btn-next"
        @click="nextQuestion"
      >
        下一题 →
      </button>

      <!-- 查看结果按钮 -->
      <button
        v-if="questionStore.isAnswered && !questionStore.hasNext"
        class="btn-result"
        @click="finishTraining"
      >
        查看结果
      </button>
    </div>

    <!-- ========== 结果阶段 ========== -->
    <div v-if="phase === 'result'" class="tt-phase">
      <div class="tt-header">
        <h2>📊 训练结果</h2>
      </div>

      <div class="tt-result-stats">
        <div class="result-stat">
          <span class="stat-num">{{ stats.total }}</span>
          <span class="stat-label">总题数</span>
        </div>
        <div class="result-stat">
          <span class="stat-num correct-num">{{ stats.correct }}</span>
          <span class="stat-label">答对</span>
        </div>
        <div class="result-stat">
          <span class="stat-num wrong-num">{{ stats.wrong }}</span>
          <span class="stat-label">答错</span>
        </div>
        <div class="result-stat">
          <span class="stat-num accuracy-num">{{ stats.accuracy }}%</span>
          <span class="stat-label">正确率</span>
        </div>
        <div class="result-stat">
          <span class="stat-num streak-num">{{ stats.bestStreak }}</span>
          <span class="stat-label">最佳连击</span>
        </div>
      </div>

      <div class="tt-result-actions">
        <button class="btn-retry" @click="resetToSelect">再来一次</button>
        <button class="btn-back-main" @click="$emit('back')">返回挑战中心</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useCardStore } from '../store/cardStore';
import { useMathKnowledgeStore } from '../store/mathKnowledgeStore';
import { useEnglishKnowledgeStore } from '../store/englishKnowledgeStore';
import { useSettingsStore } from '../store/settingsStore';
import { useQuestionStore } from '../store/questionStore';
import { mathKnowledgeNodes, englishKnowledgeNodes } from '../config/knowledge';
import { gradeQuestionWeights } from '../config/gradeQuestionWeights';
import EnglishQuestionRenderer from './EnglishQuestionRenderer.vue';

const props = defineProps({
  subject: {
    type: String,
    default: 'math'
  }
});

const emit = defineEmits(['back']);

const isEnglish = computed(() => props.subject === 'english');

const knowledgeStore = computed(() => {
  return isEnglish.value ? useEnglishKnowledgeStore() : useMathKnowledgeStore();
});

const knowledgeNodes = computed(() => {
  return isEnglish.value ? englishKnowledgeNodes : mathKnowledgeNodes;
});

const settingsStore = useSettingsStore();
const questionStore = useQuestionStore();

const phase = ref('select');       // 'select' | 'answering' | 'result'
const selectedNodes = ref(new Set());
const trainingCount = ref(10);
const stats = ref({});
const trainingTypes = ref([]);

// 计算薄弱知识点（错误率 > 30% 且有答题记录）
const weakNodes = computed(() => {
  const records = knowledgeStore.value.records;
  return knowledgeNodes.value.filter(node => {
    const rec = records[node.id];
    if (!rec || rec.totalAttempts === 0) return false;
    return (rec.wrongCount / rec.totalAttempts) > 0.3;
  }).map(node => {
    const rec = records[node.id];
    return {
      ...node,
      totalAttempts: rec.totalAttempts,
      wrongCount: rec.wrongCount,
      errorRate: Math.round((rec.wrongCount / rec.totalAttempts) * 100)
    };
  });
});

function toggleNode(id) {
  const set = new Set(selectedNodes.value);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  selectedNodes.value = set;
}

async function startTraining() {
  const types = Array.from(selectedNodes.value);

  if (isEnglish.value) {
    // 英语训练 — 使用英语题目生成器
    trainingTypes.value = types;
    try {
      const { generateQuestionSet } = await import('../utils/englishQuestionGenerator');
      const questions = generateQuestionSet(trainingCount.value, {
        types: types,
        level: settingsStore.getEffectiveEnglishLevel || 1
      });
      if (questions.length === 0) {
        alert('暂无可用英语题目生成器，请先完成语法生成器配置。');
        return;
      }
      // 存入本地状态用于答题阶段（T2.2 将替换为 EnglishQuestionRenderer）
      questionStore.questionSet = questions;
      questionStore.currentIndex = 0;
      questionStore.currentQuestion = questions[0];
      questionStore.answeredQuestions = [];
      questionStore.correctCount = 0;
      questionStore.wrongCount = 0;
      questionStore.streak = 0;
      questionStore.isAnswered = false;
      questionStore.lastAnswer = null;
      questionStore.isCorrect = null;
    } catch (e) {
      alert('英语题目生成器加载失败，请稍后再试。');
      return;
    }
    phase.value = 'answering';
  } else {
    // 数学训练 — 使用数学题目生成器
    const gradeWeights = gradeQuestionWeights[settingsStore.gradeRange.max] || {};
    const validTypes = types.filter(t => gradeWeights[t] !== undefined);
    if (validTypes.length === 0) {
      trainingTypes.value = types;
    } else {
      trainingTypes.value = validTypes;
    }

    questionStore.generateQuestionSet(settingsStore.gradeRange.max, trainingCount.value, {
      types: trainingTypes.value
    });
    phase.value = 'answering';
  }
}

function submitAnswer(answer) {
  if (isEnglish.value) {
    // 英语题目 — 本地判题 + 记录到英语知识库
    if (!questionStore.currentQuestion || questionStore.isAnswered) return;
    const q = questionStore.currentQuestion;
    const correct = answer === q.answer;
    questionStore.isAnswered = true;
    questionStore.lastAnswer = answer;
    questionStore.isCorrect = correct;
    if (correct) {
      questionStore.correctCount++;
      questionStore.streak++;
      if (questionStore.streak > questionStore.bestStreak) {
        questionStore.bestStreak = questionStore.streak;
      }
    } else {
      questionStore.wrongCount++;
      questionStore.streak = 0;
    }
    questionStore.answeredQuestions.push({
      question: q,
      userAnswer: answer,
      correct: correct,
      correctAnswer: q.answer
    });
    // 记录到英语知识库
    const knowledgeId = q.knowledgeId || q.type;
    if (knowledgeId) {
      knowledgeStore.value.recordResult(knowledgeId, correct);
    }
  } else {
    // 数学题目 — 委托 questionStore
    questionStore.submitAnswer(answer);

    // 卡牌碎片产出：连续答对 5 题得 1 碎片
    if (questionStore.isCorrect && questionStore.streak > 0 && questionStore.streak % 5 === 0) {
      const cardStore = useCardStore();
      cardStore.earnShard('math', 1);
    }
  }
}

/**
 * EnglishQuestionRenderer 的 @answer 事件处理
 * 复用 submitAnswer 中英语题目的判题逻辑
 */
function submitEnglishAnswer(answer) {
  submitAnswer(answer);
}

function nextQuestion() {
  questionStore.nextQuestion();
}

function finishTraining() {
  stats.value = questionStore.getStatistics();
  phase.value = 'result';
}

function confirmQuit() {
  if (confirm('确定要退出当前训练吗？进度将丢失。')) {
    questionStore.reset();
    emit('back');
  }
}

function resetToSelect() {
  questionStore.reset();
  phase.value = 'select';
}

// 组件卸载时清理
onUnmounted(() => {
  if (phase.value === 'answering' || phase.value === 'result') {
    questionStore.reset();
  }
});
</script>

<style scoped>
.targeted-training {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  color: #fff;
}

.tt-phase {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tt-header h2 {
  flex: 1;
  margin: 0;
}

.back-btn {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(255,255,255,0.2);
  border-color: #fff;
}

.tt-counter {
  font-size: 1rem;
  opacity: 0.7;
  white-space: nowrap;
}

.tt-intro {
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

/* 知识点选择列表 */
.node-select-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.node-select-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(255,255,255,0.08);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.node-select-item:hover {
  background: rgba(255,255,255,0.12);
}

.node-select-item.selected {
  border-color: #f59e0b;
  background: rgba(245,158,11,0.12);
}

.node-chk {
  font-size: 1.2rem;
}

.node-icon {
  font-size: 1.8rem;
}

.node-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.node-name {
  font-weight: bold;
  font-size: 1.05rem;
}

.node-stats {
  font-size: 0.8rem;
  opacity: 0.6;
}

.node-error-bar {
  width: 100px;
  height: 8px;
  background: rgba(255,255,255,0.15);
  border-radius: 4px;
  overflow: hidden;
}

.node-error-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #ef4444);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.node-error-rate {
  font-size: 0.9rem;
  font-weight: bold;
  color: #f59e0b;
  min-width: 3rem;
  text-align: right;
}

/* 空状态 */
.tt-empty {
  text-align: center;
  padding: 3rem 1rem;
}

.tt-empty p {
  font-size: 1.2rem;
  margin: 0.5rem 0;
}

.tt-hint {
  font-size: 0.9rem;
  opacity: 0.6;
}

/* 训练操作区 */
.tt-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.count-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.count-btn {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  background: rgba(255,255,255,0.08);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.count-btn.active {
  border-color: #f59e0b;
  background: rgba(245,158,11,0.2);
}

.btn-start {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-start:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-start:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245,158,11,0.4);
}

/* 答题区 */
.tt-progress {
  height: 6px;
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.tt-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.tt-question {
  margin-bottom: 1.5rem;
}

.q-text {
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.q-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.q-option {
  padding: 1rem;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  background: rgba(255,255,255,0.08);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.q-option:hover:not(.disabled) {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.4);
}

.q-option.correct {
  border-color: #4ade80;
  background: rgba(74,222,128,0.2);
}

.q-option.wrong {
  border-color: #ef4444;
  background: rgba(239,68,68,0.2);
}

.q-option.disabled {
  cursor: default;
}

.tt-feedback {
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.tt-feedback.correct {
  background: rgba(74,222,128,0.15);
  color: #4ade80;
}

.tt-feedback.wrong {
  background: rgba(239,68,68,0.15);
  color: #ef4444;
}

.btn-next,
.btn-result {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-next:hover,
.btn-result:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102,126,234,0.4);
}

/* 结果区 */
.tt-result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.result-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255,255,255,0.08);
  border-radius: 15px;
}

.stat-num {
  font-size: 2rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 0.3rem;
}

.correct-num { color: #4ade80; }
.wrong-num { color: #ef4444; }
.accuracy-num { color: #fbbf24; }
.streak-num { color: #667eea; }

.tt-result-actions {
  display: flex;
  gap: 1rem;
}

.btn-retry,
.btn-back-main {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-retry {
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.2);
}

.btn-retry:hover {
  background: rgba(255,255,255,0.2);
}

.btn-back-main {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.btn-back-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102,126,234,0.4);
}

@media (max-width: 768px) {
  .targeted-training {
    padding: 1rem;
  }

  .q-options {
    grid-template-columns: 1fr;
  }

  .tt-result-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .node-error-bar {
    width: 60px;
  }
}
</style>
