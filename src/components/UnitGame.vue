<template>
  <div class="unit-game">
    <GameTutorial
      v-if="showTutorial"
      title="📏 单位大冒险玩法说明"
      :steps="unitTutorialSteps"
      @close="closeTutorial"
    />

    <div class="top-bar">
      <button class="btn-back" @click="$emit('back')">← 返回</button>
      <button class="btn-help" @click="showTutorial = true">❓ 玩法说明</button>
    </div>

    <!-- 关卡选择 -->
    <div v-if="!gameStarted" class="setup-screen">
      <h2 class="game-title">📏 单位大冒险</h2>
      <p class="game-desc">选择一个大类开始练习单位换算！</p>

      <div class="category-grid">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-card"
          :style="{ borderColor: cat.color }"
          @click="startGame(cat.id)"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
          <span class="cat-arrow">→</span>
        </div>
      </div>
    </div>

    <!-- 游戏主区域 -->
    <div v-else class="game-screen">
      <div class="game-header">
        <h2>{{ currentCategoryName }}</h2>
        <div class="game-stats">
          <span class="stat">第 {{ level }} 关</span>
          <span class="stat">得分：{{ score }}</span>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
      </div>

      <!-- 题目区域 -->
      <div class="question-area">
        <div class="value-display">
          <span class="from-value">{{ currentQuestion.fromValue }}</span>
          <span class="from-unit">{{ currentQuestion.fromUnit }}</span>
        </div>
        <div class="equals-sign">=</div>
        <div class="options-area">
          <div
            v-for="(choice, idx) in currentQuestion.choices"
            :key="idx"
            class="option-card"
            :class="{
              correct: answered && choice === currentQuestion.answer,
              wrong: answered && selectedAnswer === choice && choice !== currentQuestion.answer
            }"
            @click="selectAnswer(choice)"
          >
            <span class="option-value">{{ choice }}</span>
            <span class="option-unit">{{ currentQuestion.toUnit }}</span>
          </div>
        </div>
      </div>

      <!-- 反馈 -->
      <div v-if="answered" class="feedback" :class="isCorrect ? 'correct' : 'wrong'">
        <span v-if="isCorrect">✅ 正确！</span>
        <span v-else>❌ 正确答案是：{{ currentQuestion.answer }} {{ currentQuestion.toUnit }}</span>
      </div>

      <!-- 下一题按钮 -->
      <button
        v-if="answered && !gameOver"
        class="btn-next"
        @click="nextQuestion"
      >
        下一题 →
      </button>

      <!-- 游戏结束 -->
      <div v-if="gameOver" class="game-over">
        <div class="result-card">
          <h3>🎉 关卡完成！</h3>
          <p class="result-score">得分：{{ score }}</p>
          <p class="result-detail">正确率：{{ correctRate }}%</p>
          <div class="stars">
            <span v-for="s in starCount" :key="s">⭐</span>
          </div>
          <button class="btn-retry" @click="retry">再来一次</button>
          <button class="btn-back-main" @click="backToMenu">返回选择</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSettingsStore } from '../store/settingsStore';
import { useMathKnowledgeStore } from '../store/mathKnowledgeStore';
import {
  unitCategories,
  getCategoryIds,
  generateConversionQuestion
} from '../config/units';
import GameTutorial from './GameTutorial.vue';

defineEmits(['back']);

const showTutorial = ref(false);

const unitTutorialSteps = [
  {
    title: '选择类别',
    description: '单位大冒险有长度、质量、时间、面积、体积和货币六大类别。选择一个类别开始单位换算挑战！'
  },
  {
    title: '闯关机制',
    description: '每个类别有5个关卡，每关包含5道单位换算题。逐关递进，难度逐步提升！'
  },
  {
    title: '答题方式',
    description: '每题给出一个数值和单位，需要从多个选项中选择正确的换算结果。考验你的单位换算能力！'
  },
  {
    title: '计分规则',
    description: '答对一题得10分。全部25题完成后，根据正确率获得1-3颗星评价：≥90%得3星，≥70%得2星，≥50%得1星。'
  },
  {
    title: '学习提示',
    description: '记住各单位之间的进率关系是换算的关键。长度单位进率多为10或1000，质量单位进率1000，时间单位进率60等。'
  }
];

const closeTutorial = () => {
  showTutorial.value = false;
};

const settingsStore = useSettingsStore();

// 大类 → 知识点 id 映射
const categoryToKnowledgeId = {
  length: 'unit_length',
  mass: 'unit_mass',
  time: 'unit_time',
  area: 'unit_area',
  volume: 'unit_volume',
  currency: 'unit_currency'
};

// 状态
const gameStarted = ref(false);
const currentCategory = ref(null);
const currentCategoryName = ref('');
const level = ref(1);
const score = ref(0);
const totalQuestions = ref(0);
const correctAnswers = ref(0);
const currentQuestion = ref(null);
const answered = ref(false);
const selectedAnswer = ref(null);
const isCorrect = ref(false);
const gameOver = ref(false);

const MAX_LEVELS = 5;
const QUESTIONS_PER_LEVEL = 5;

// 大类列表
const categories = computed(() => {
  return getCategoryIds().map(id => ({
    id,
    ...unitCategories[id]
  }));
});

const progressPercent = computed(() => {
  return (totalQuestions.value / (MAX_LEVELS * QUESTIONS_PER_LEVEL)) * 100;
});

const correctRate = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return Math.round((correctAnswers.value / totalQuestions.value) * 100);
});

const starCount = computed(() => {
  const rate = correctAnswers.value / Math.max(totalQuestions.value, 1);
  if (rate >= 0.9) return 3;
  if (rate >= 0.7) return 2;
  if (rate >= 0.5) return 1;
  return 0;
});

function startGame(categoryId) {
  currentCategory.value = categoryId;
  currentCategoryName.value = unitCategories[categoryId].name;
  gameStarted.value = true;
  level.value = 1;
  score.value = 0;
  totalQuestions.value = 0;
  correctAnswers.value = 0;
  gameOver.value = false;
  answered.value = false;
  // 校验年级是否适配所选类别，若不适配则直接结束并提示
  const testQuestion = generateConversionQuestion(categoryId, settingsStore.gradeRange.max);
  if (!testQuestion) {
    console.warn('当前年级不支持此类别，请选择其他类别或调整年级设置');
    gameOver.value = true;
    return;
  }
  generateQuestion();
}

function generateQuestion() {
  const question = generateConversionQuestion(currentCategory.value, settingsStore.gradeRange.max);
  if (question) {
    currentQuestion.value = question;
    answered.value = false;
    selectedAnswer.value = null;
    isCorrect.value = false;
  } else {
    // 生成失败时的兜底：显示友好提示并回到类别选择
    console.warn('当前年级不支持此类别，请选择其他类别');
    gameOver.value = true;
  }
}

function selectAnswer(choice) {
  if (answered.value) return;

  answered.value = true;
  selectedAnswer.value = choice;
  totalQuestions.value++;

  const correct = choice === currentQuestion.value.answer;
  if (correct) {
    isCorrect.value = true;
    correctAnswers.value++;
    score.value += 10;
  } else {
    isCorrect.value = false;
  }

  // 记录知识点答题结果
  const mathKnowledgeStore = useMathKnowledgeStore();
  const categoryId = currentQuestion.value.categoryId || currentCategory.value;
  const knowledgeId = categoryToKnowledgeId[categoryId];
  if (!knowledgeId) {
    console.warn('未知单位类别:', categoryId, '跳过知识点记录');
    return;
  }
  mathKnowledgeStore.recordResult(knowledgeId, correct);
}

function nextQuestion() {
  const totalPerLevel = QUESTIONS_PER_LEVEL;

  if (totalQuestions.value >= MAX_LEVELS * totalPerLevel) {
    gameOver.value = true;
    return;
  }

  if (totalQuestions.value % totalPerLevel === 0) {
    level.value++;
  }

  generateQuestion();
}

function retry() {
  level.value = 1;
  score.value = 0;
  totalQuestions.value = 0;
  correctAnswers.value = 0;
  gameOver.value = false;
  answered.value = false;
  generateQuestion();
}

function backToMenu() {
  gameStarted.value = false;
  gameOver.value = false;
}
</script>

<style scoped>
.unit-game {
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

.btn-back {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.25);
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

/* 选择界面 */
.setup-screen {
  max-width: 600px;
  width: 100%;
  text-align: center;
  margin-top: 2rem;
}

.game-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.game-desc {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.cat-icon {
  font-size: 2rem;
}

.cat-name {
  flex: 1;
  font-size: 1.1rem;
  font-weight: bold;
}

.cat-arrow {
  font-size: 1.2rem;
  opacity: 0.5;
}

/* 游戏界面 */
.game-screen {
  max-width: 700px;
  width: 100%;
  text-align: center;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.game-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.game-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  padding: 0.3rem 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.9rem;
}

/* 进度条 */
.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 6px;
  transition: width 0.5s ease;
}

/* 题目区域 */
.question-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.value-display {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  padding: 1.5rem 2rem;
  background: rgba(59, 130, 246, 0.2);
  border: 2px solid #3b82f6;
  border-radius: 16px;
}

.from-value {
  font-size: 2.5rem;
  font-weight: bold;
}

.from-unit {
  font-size: 1.2rem;
  color: #94a3b8;
}

.equals-sign {
  font-size: 2rem;
  color: #94a3b8;
}

.options-area {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.option-card {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  padding: 1.2rem 1.8rem;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-3px);
}

.option-card.correct {
  background: rgba(34, 197, 94, 0.3);
  border-color: #22c55e;
}

.option-card.wrong {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
}

.option-value {
  font-size: 1.8rem;
  font-weight: bold;
}

.option-unit {
  font-size: 1rem;
  color: #94a3b8;
}

/* 反馈 */
.feedback {
  margin: 1rem 0;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
}

.feedback.correct {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.feedback.wrong {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* 按钮 */
.btn-next {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-next:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
}

/* 结束界面 */
.game-over {
  margin-top: 1rem;
}

.result-card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  text-align: center;
}

.result-card h3 {
  font-size: 1.8rem;
  margin: 0 0 1rem 0;
}

.result-score {
  font-size: 1.5rem;
  color: #fbbf24;
  margin: 0.5rem 0;
}

.result-detail {
  font-size: 1rem;
  color: #94a3b8;
  margin: 0.5rem 0;
}

.stars {
  font-size: 2rem;
  margin: 1rem 0;
}

.btn-retry,
.btn-back-main {
  display: inline-block;
  margin: 0.5rem;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-retry {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
}

.btn-back-main {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.btn-retry:hover,
.btn-back-main:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }

  .question-area {
    flex-direction: column;
    gap: 1rem;
  }

  .value-display {
    padding: 1rem 1.5rem;
  }

  .from-value {
    font-size: 2rem;
  }

  .option-card {
    padding: 1rem 1.2rem;
  }
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem 2rem 0 0;
}
</style>
