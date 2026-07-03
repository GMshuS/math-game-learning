<template>
  <div class="review-session">
    <div class="review-header">
      <h2>📚 复习模式</h2>
      <button class="btn-back" @click="$emit('back')">← 返回</button>
    </div>

    <!-- 阶段①: 检查待复习 -->
    <div v-if="phase === 'due-check'" class="due-check">
      <h3>待复习知识点</h3>
      <div v-if="dueItems.length > 0" class="due-list">
        <div
          v-for="(item, index) in dueItems"
          :key="item.subject + '-' + item.id"
          class="due-item"
        >
          <span class="due-icon">{{ item.icon }}</span>
          <div class="due-info">
            <span class="due-label">{{ item.label }}</span>
            <span class="due-subject">{{ item.subject === 'math' ? '数学' : '英语' }}</span>
          </div>
          <span class="due-order">#{{ index + 1 }}</span>
        </div>
      </div>
      <p v-else class="due-empty">暂无待复习知识点 🎉</p>

      <button
        v-if="dueItems.length > 0"
        class="btn-start"
        @click="startReview"
      >
        开始复习 ({{ dueItems.length }} 题)
      </button>
      <button
        v-else
        class="btn-back-main"
        @click="$emit('back')"
      >
        返回挑战中心
      </button>
    </div>

    <!-- 阶段②: 答题中 -->
    <div v-if="phase === 'reviewing'" class="reviewing">
      <!-- 进度 -->
      <div class="review-progress">
        第 {{ currentIndex + 1 }} / {{ dueItems.length }} 题
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: ((currentIndex + 1) / dueItems.length * 100) + '%' }" />
        </div>
      </div>

      <!-- 当前知识点标识 -->
      <div class="current-node">
        <span class="node-icon">{{ dueItems[currentIndex]?.icon }}</span>
        <span class="node-label">{{ dueItems[currentIndex]?.label }}</span>
      </div>

      <!-- 题目区 -->
      <!-- 英语题目使用 EnglishQuestionRenderer 渲染 -->
      <div v-if="currentQuestion && currentSubject === 'english'" class="question-area">
        <EnglishQuestionRenderer
          v-if="adaptedEnglishQuestion"
          :question="adaptedEnglishQuestion"
          :disabled="showAnswerResult"
          @answer="selectEnglishAnswer"
        />
      </div>
      <!-- 数学题目使用纯选择题按钮网格 -->
      <div v-else-if="currentQuestion" class="question-area">
        <p class="question-text">{{ currentQuestion.text }}</p>
        <div class="options-grid">
          <button
            v-for="(opt, i) in currentQuestion.options"
            :key="i"
            class="option-btn"
            :class="{
              selected: userAnswer === opt,
              correct: showAnswerResult && opt === currentQuestion.correctAnswer,
              wrong: showAnswerResult && userAnswer === opt && opt !== currentQuestion.correctAnswer
            }"
            :disabled="showAnswerResult"
            @click="selectAnswer(opt)"
          >
            {{ opt }}
          </button>
        </div>
      </div>
      <p v-else class="loading-text">加载题目中...</p>

      <!-- 答题反馈 -->
      <div v-if="showAnswerResult" class="answer-feedback" :class="isCorrect ? 'correct' : 'wrong'">
        {{ isCorrect ? '✅ 答对了！' : '❌ 答错了' }}
        <div v-if="!isCorrect && currentQuestion?.correctAnswer !== undefined" class="correct-answer-hint">
          正确答案：{{ currentQuestion.correctAnswer }}
        </div>
      </div>

      <!-- 自评按钮组 -->
      <div v-if="showSelfAssess" class="self-assess">
        <p class="assess-prompt">请评价这道题：</p>
        <div class="assess-buttons">
          <button class="assess-btn forget" @click="submitReview(0)">😰 忘记了</button>
          <button class="assess-btn hard" @click="submitReview(1)">🤔 有点困难</button>
          <button class="assess-btn easy" @click="submitReview(2)">😊 很轻松</button>
        </div>
      </div>
    </div>

    <!-- 阶段③: 完成 -->
    <div v-if="phase === 'complete'" class="review-complete">
      <div class="complete-icon">🎉</div>
      <h3>复习完成！</h3>

      <div class="review-stats">
        <div class="stat-item">
          <span class="stat-value">{{ reviewResults.length }}</span>
          <span class="stat-label">总题数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ reviewResults.filter(r => r.correct).length }}</span>
          <span class="stat-label">答对</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ reviewResults.filter(r => r.quality === 2).length }}</span>
          <span class="stat-label">轻松掌握</span>
        </div>
      </div>

      <div class="quality-distribution">
        <h4>自评分布</h4>
        <div class="quality-bar">
          <div
            class="quality-segment forget-seg"
            :style="{ width: (reviewResults.filter(r => r.quality === 0).length / reviewResults.length * 100) + '%' }">
            😰 {{ reviewResults.filter(r => r.quality === 0).length }}
          </div>
          <div
            class="quality-segment hard-seg"
            :style="{ width: (reviewResults.filter(r => r.quality === 1).length / reviewResults.length * 100) + '%' }">
            🤔 {{ reviewResults.filter(r => r.quality === 1).length }}
          </div>
          <div
            class="quality-segment easy-seg"
            :style="{ width: (reviewResults.filter(r => r.quality === 2).length / reviewResults.length * 100) + '%' }">
            😊 {{ reviewResults.filter(r => r.quality === 2).length }}
          </div>
        </div>
      </div>

      <button class="btn-finish" @click="$emit('back')">返回挑战中心</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { useMathKnowledgeStore } from '../store/mathKnowledgeStore';
import { useEnglishKnowledgeStore } from '../store/englishKnowledgeStore';
import { mathKnowledgeNodes, englishKnowledgeNodes } from '../config/knowledge';
import { useSettingsStore } from '../store/settingsStore';
import { generateQuestion } from '../utils/questionGenerator';
import { questionToMultipleChoice } from '../utils/questionUtils';
import { getWordsByLevel } from '../config/english/grades';
import EnglishQuestionRenderer from './EnglishQuestionRenderer.vue';

const props = defineProps({
  subject: {
    type: String,
    default: 'all'
  }
});

const emit = defineEmits(['back']);

const isSingleSubject = computed(() => props.subject !== 'all');

const mathKnowledgeStore = useMathKnowledgeStore();
const englishKnowledgeStore = useEnglishKnowledgeStore();
const settingsStore = useSettingsStore();

const phase = ref('due-check');
const dueItems = ref([]);
const currentIndex = ref(0);
const currentQuestion = ref(null);
const currentSubject = ref('math');
const userAnswer = ref(null);
const showAnswerResult = ref(false);
const showSelfAssess = ref(false);
const isCorrect = ref(false);
const qualitySelected = ref(null);
const reviewResults = ref([]);

// 将英语题目格式适配为 EnglishQuestionRenderer 所需格式
const adaptedEnglishQuestion = computed(() => {
  if (!currentQuestion.value || currentSubject.value !== 'english') return null;
  return {
    question: currentQuestion.value.text || currentQuestion.value.question,
    options: currentQuestion.value.options,
    answer: currentQuestion.value.correctAnswer,
    type: 'choice'
  };
});

// 收集到期知识点
function collectDueItems() {
  const items = [];
  const now = Date.now();
  const addDue = (records, nodes, subject) => {
    for (const node of nodes) {
      const record = records[node.id];
      if (record && record.easeFactor !== undefined &&
        (record.nextReviewTime === null || record.nextReviewTime <= now)) {
        const gradeRange = node.gradeRange || [1, 6];
        const grade = Math.min(Math.max(settingsStore.gradeRange.max, gradeRange[0]), gradeRange[1]);
        items.push({
          id: node.id,
          label: node.label,
          icon: node.icon,
          subject: subject,
          grade: grade,
          nextReviewTime: record.nextReviewTime
        });
      }
    }
  };
  // 根据 subject 过滤数据源
  if (props.subject === 'all' || props.subject === 'math') {
    addDue(mathKnowledgeStore.records, mathKnowledgeNodes, 'math');
  }
  if (props.subject === 'all' || props.subject === 'english') {
    addDue(englishKnowledgeStore.records, englishKnowledgeNodes, 'english');
  }
  // 按 nextReviewTime 升序排列（null 排最前面 → 首次复习优先）
  items.sort((a, b) => {
    if (a.nextReviewTime === null) return -1;
    if (b.nextReviewTime === null) return 1;
    return a.nextReviewTime - b.nextReviewTime;
  });
  dueItems.value = items;
}

function startReview() {
  currentIndex.value = 0;
  phase.value = 'reviewing';
  loadQuestion();
}

// 加载当前知识点对应的题目
function loadQuestion() {
  const item = dueItems.value[currentIndex.value];
  if (!item) {
    phase.value = 'complete';
    return;
  }
  currentSubject.value = item.subject;
  currentQuestion.value = null;
  userAnswer.value = null;
  showAnswerResult.value = false;
  showSelfAssess.value = false;
  qualitySelected.value = null;

  if (item.subject === 'math') {
    // 数学 — 使用 questionGenerator
    const q = generateQuestion(item.grade, item.id);
    if (q) {
      const mcq = questionToMultipleChoice(q);
      currentQuestion.value = {
        text: mcq.question,
        options: mcq.options,
        correctAnswer: mcq.answer,
        correctOption: mcq.correctOption,
        type: q.type
      };
    } else {
      // 回退：如果 generateQuestion 返回 null
      currentQuestion.value = {
        text: '暂时无法生成该知识点题目',
        options: [],
        correctAnswer: null
      };
    }
  } else if (item.subject === 'english') {
    // 英语 — 使用英语单词生成逻辑
    generateEnglishQuestion(item.id);
  }
}

// 生成英语题目
function generateEnglishQuestion(type) {
  const level = settingsStore.getEffectiveEnglishLevel;
  const words = getWordsByLevel(level);
  if (words.length < 2) {
    currentQuestion.value = {
      text: '该等级暂无足够词汇进行复习',
      options: [],
      correctAnswer: null,
      type: type
    };
    return;
  }

  // 随机选词
  const wordIndex = Math.floor(Math.random() * words.length);
  const word = words[wordIndex];

  // 生成干扰词
  const others = words.filter((w, i) => i !== wordIndex);
  const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
  const distractors = shuffledOthers.slice(0, 3).map(w => {
    return (type === 'en2cn' || type === 'listening') ? w.cn : w.en;
  });

  // 确定正确值和所有选项
  const correctValue = (type === 'en2cn' || type === 'listening') ? word.cn : word.en;
  const allOptions = [correctValue, ...distractors];
  const options = allOptions.sort(() => Math.random() - 0.5);

  // 题目文本
  let text;
  if (type === 'en2cn') {
    text = `"${word.en}" 的中文释义是？`;
  } else if (type === 'cn2en') {
    text = `"${word.cn}" 的英文是？`;
  } else {
    text = '请选择正确的中文释义';
  }

  currentQuestion.value = {
    text: text,
    options: options,
    correctAnswer: correctValue,
    correctOption: options.indexOf(correctValue),
    type: type
  };
}

// 选择答案
let assessTimer = null;

function selectAnswer(answer) {
  if (showAnswerResult.value) return;
  userAnswer.value = answer;

  // 判断是否正确
  const correct = answer === currentQuestion.value.correctAnswer ||
    answer === currentQuestion.value.correctOption;
  isCorrect.value = correct;
  showAnswerResult.value = true;

  // 1.5秒后显示自评按钮
  assessTimer = setTimeout(() => {
    showSelfAssess.value = true;
  }, 1500);
}

/**
 * EnglishQuestionRenderer 的 @answer 事件处理
 * 复用 selectAnswer 的判题和自评逻辑
 */
function selectEnglishAnswer(answer) {
  selectAnswer(answer);
}

onBeforeUnmount(() => {
  if (assessTimer) {
    clearTimeout(assessTimer);
    assessTimer = null;
  }
});

// 提交自评 — 调用 store.scheduleReview()
function submitReview(quality) {
  qualitySelected.value = quality;
  showSelfAssess.value = false;

  const item = dueItems.value[currentIndex.value];
  let store;
  if (item.subject === 'math') {
    store = mathKnowledgeStore;
  } else {
    store = englishKnowledgeStore;
  }

  store.scheduleReview(item.id, quality);

  // 记录结果
  reviewResults.value.push({
    id: item.id,
    label: item.label,
    subject: item.subject,
    correct: isCorrect.value,
    quality: quality
  });

  // 进入下一题
  currentIndex.value++;
  if (currentIndex.value < dueItems.value.length) {
    loadQuestion();
  } else {
    phase.value = 'complete';
  }
}

collectDueItems(); // 组件初始化时收集
</script>

<style scoped>
.review-session {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  color: #fff;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.review-header h2 {
  flex: 1;
  margin: 0;
}

.btn-back {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #fff;
}

/* ====== 到期检查阶段 ====== */
.due-check {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.due-check h3 {
  margin: 0 0 1rem 0;
  color: #fbbf24;
  font-size: 1.1rem;
}

.due-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.due-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  transition: all 0.3s;
}

.due-item:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #8b5cf6;
}

.due-icon {
  font-size: 1.8rem;
}

.due-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.due-label {
  font-weight: bold;
  font-size: 1.05rem;
}

.due-subject {
  font-size: 0.8rem;
  opacity: 0.6;
}

.due-order {
  font-size: 1.2rem;
  font-weight: bold;
  color: #8b5cf6;
}

.due-empty {
  text-align: center;
  padding: 3rem 1rem;
  font-size: 1.2rem;
  opacity: 0.8;
}

.btn-start {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4);
}

.btn-back-main {
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

.btn-back-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* ====== 答题阶段 ====== */
.reviewing {
  animation: fadeIn 0.3s ease;
}

.review-progress {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #6d28d9);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.current-node {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 10px;
}

.node-icon {
  font-size: 1.5rem;
}

.node-label {
  font-weight: bold;
  font-size: 1rem;
  color: #c4b5fd;
}

.question-area {
  margin-bottom: 1.5rem;
}

.question-text {
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.8;
  color: #fff;
}

.loading-text {
  text-align: center;
  padding: 2rem;
  opacity: 0.7;
  font-size: 1.1rem;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.option-btn {
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.option-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.option-btn.selected {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.2);
}

.option-btn.correct {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.2);
}

.option-btn.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.option-btn:disabled {
  cursor: default;
}

.answer-feedback {
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease;
}

.answer-feedback.correct {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.answer-feedback.wrong {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.correct-answer-hint {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  opacity: 0.9;
}

.self-assess {
  animation: fadeIn 0.3s ease;
}

.assess-prompt {
  text-align: center;
  margin-bottom: 0.8rem;
  font-size: 1rem;
  opacity: 0.8;
}

.assess-buttons {
  display: flex;
  gap: 0.8rem;
}

.assess-btn {
  flex: 1;
  padding: 0.8rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.assess-btn:hover {
  transform: translateY(-2px);
}

.assess-btn.forget:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.assess-btn.hard:hover {
  background: rgba(245, 158, 11, 0.2);
  border-color: #f59e0b;
}

.assess-btn.easy:hover {
  background: rgba(74, 222, 128, 0.2);
  border-color: #4ade80;
}

/* ====== 完成阶段 ====== */
.review-complete {
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.complete-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.review-complete h3 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  color: #fbbf24;
}

.review-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 15px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #8b5cf6;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 0.3rem;
}

.quality-distribution {
  margin-bottom: 2rem;
}

.quality-distribution h4 {
  margin: 0 0 0.8rem;
  font-size: 1rem;
  opacity: 0.8;
}

.quality-bar {
  display: flex;
  height: 36px;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.quality-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #fff;
  transition: width 0.5s ease;
  min-width: 20px;
}

.forget-seg {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.hard-seg {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.easy-seg {
  background: linear-gradient(135deg, #4ade80, #22c55e);
}

.btn-finish {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-finish:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4);
}

@media (max-width: 768px) {
  .review-session {
    padding: 1rem;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .assess-buttons {
    flex-direction: column;
  }

  .review-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
