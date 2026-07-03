<template>
  <div class="chart-game">
    <div class="top-bar">
      <button class="btn-back" @click="$emit('back')">← 返回</button>
    </div>

    <!-- 设置界面 -->
    <div v-if="!gameStarted" class="setup-screen">
      <h2 class="game-title">📊 统计图表</h2>
      <p class="game-desc">读图回答，锻炼数据分析能力！</p>

      <div class="setup-options">
        <div class="chart-select">
          <label>图表类型：</label>
          <select v-model="chartType">
            <option value="">随机</option>
            <option value="bar">柱状图</option>
            <option value="line">折线图</option>
            <option value="pie">扇形图</option>
          </select>
        </div>
      </div>

      <button class="btn-start" @click="startGame">开始挑战</button>
    </div>

    <!-- 游戏界面 -->
    <div v-else class="game-screen">
      <div class="game-header">
        <h2>{{ chartData.title }}</h2>
        <div class="game-stats">
          <span class="stat">得分：{{ score }}</span>
          <span class="stat">第 {{ currentQIndex + 1 }}/{{ questions.length }} 题</span>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="chart-container">
        <!-- 柱状图 -->
        <svg v-if="chartData.type === 'bar'" class="chart-svg" :viewBox="'0 0 ' + svgWidth + ' ' + svgHeight">
          <!-- Y轴网格线 -->
          <line
            v-for="(line, i) in yGridLines"
            :key="'grid-' + i"
            :x1="marginLeft" :y1="line.y"
            :x2="svgWidth - marginRight" :y2="line.y"
            stroke="rgba(255,255,255,0.1)"
            stroke-dasharray="4,4"
          />
          <text
            v-for="(line, i) in yGridLines"
            :key="'label-' + i"
            :x="marginLeft - 10" :y="line.y + 5"
            fill="#94a3b8" font-size="12" text-anchor="end"
          >{{ line.label }}</text>

          <!-- 柱体 -->
          <g v-for="(val, idx) in chartData.values" :key="'bar-' + idx">
            <rect
              :x="barX(idx)" :y="barY(val)"
              :width="barWidth" :height="barHeight(val)"
              :fill="barColor(idx)" rx="4"
              class="bar-rect"
            >
              <title>{{ chartData.labels[idx] }}: {{ val }}{{ chartData.unit }}</title>
            </rect>
            <text
              :x="barX(idx) + barWidth / 2" :y="barY(val) - 8"
              fill="#fff" font-size="14" text-anchor="middle" font-weight="bold"
            >{{ val }}</text>
            <text
              :x="barX(idx) + barWidth / 2" :y="svgHeight - marginBottom + 20"
              fill="#94a3b8" font-size="13" text-anchor="middle"
            >{{ chartData.labels[idx] }}</text>
          </g>

          <!-- 坐标轴 -->
          <line
            :x1="marginLeft" :y1="svgHeight - marginBottom"
            :x2="svgWidth - marginRight" :y2="svgHeight - marginBottom"
            stroke="rgba(255,255,255,0.3)" stroke-width="2"
          />
          <line
            :x1="marginLeft" :y1="marginTop"
            :x2="marginLeft" :y2="svgHeight - marginBottom"
            stroke="rgba(255,255,255,0.3)" stroke-width="2"
          />
        </svg>

        <!-- 折线图 -->
        <svg v-if="chartData.type === 'line'" class="chart-svg" :viewBox="'0 0 ' + svgWidth + ' ' + svgHeight">
          <!-- Y轴网格线 -->
          <line
            v-for="(line, i) in yGridLines"
            :key="'gridl-' + i"
            :x1="marginLeft" :y1="line.y"
            :x2="svgWidth - marginRight" :y2="line.y"
            stroke="rgba(255,255,255,0.1)"
            stroke-dasharray="4,4"
          />
          <text
            v-for="(line, i) in yGridLines"
            :key="'llabel-' + i"
            :x="marginLeft - 10" :y="line.y + 5"
            fill="#94a3b8" font-size="12" text-anchor="end"
          >{{ line.label }}</text>

          <!-- 折线 -->
          <polyline
            :points="linePoints"
            fill="none" stroke="#f59e0b" stroke-width="3"
            class="line-polyline"
          />

          <!-- 数据点 -->
          <g v-for="(val, idx) in chartData.values" :key="'dot-' + idx">
            <circle
              :cx="lineX(idx)" :cy="lineY(val)" r="6"
              fill="#f59e0b" stroke="#fff" stroke-width="2"
              class="line-dot"
            >
              <title>{{ chartData.labels[idx] }}: {{ val }}{{ chartData.unit }}</title>
            </circle>
            <text
              :x="lineX(idx)" :cy="lineY(val) - 12"
              :y="lineY(val) - 14"
              fill="#fff" font-size="14" text-anchor="middle" font-weight="bold"
            >{{ val }}</text>
            <text
              :x="lineX(idx)" :y="svgHeight - marginBottom + 20"
              fill="#94a3b8" font-size="13" text-anchor="middle"
            >{{ chartData.labels[idx] }}</text>
          </g>

          <!-- 坐标轴 -->
          <line
            :x1="marginLeft" :y1="svgHeight - marginBottom"
            :x2="svgWidth - marginRight" :y2="svgHeight - marginBottom"
            stroke="rgba(255,255,255,0.3)" stroke-width="2"
          />
          <line
            :x1="marginLeft" :y1="marginTop"
            :x2="marginLeft" :y2="svgHeight - marginBottom"
            stroke="rgba(255,255,255,0.3)" stroke-width="2"
          />
        </svg>

        <!-- 扇形图 -->
        <svg v-if="chartData.type === 'pie'" class="chart-svg" :viewBox="'0 0 ' + svgWidth + ' ' + svgHeight">
          <g :transform="'translate(' + pieCenterX + ',' + pieCenterY + ')'">
            <!-- 扇区 -->
            <path
              v-for="(val, idx) in chartData.values"
              :key="'slice-' + idx"
              :d="pieSlicePath(idx)"
              :fill="pieColor(idx)"
              stroke="#0f1729"
              stroke-width="2"
              class="pie-slice"
            >
              <title>{{ chartData.labels[idx] }}: {{ val }}{{ chartData.unit }}</title>
            </path>
          </g>

          <!-- 图例 -->
          <g
            v-for="(label, idx) in chartData.labels" :key="'legend-' + idx"
            :transform="'translate(' + legendX + ',' + (legendY + idx * 28) + ')'"
          >
            <rect x="0" y="-8" width="14" height="14" :fill="pieColor(idx)" rx="2" />
            <text x="22" y="4" fill="#fff" font-size="13">{{ label }}（{{ chartData.values[idx] }}%）</text>
          </g>
        </svg>
      </div>

      <!-- 题目区域 -->
      <div class="questions-area">
        <div class="question-text">{{ currentQuestion.question }}</div>

        <!-- 选项 -->
        <div class="options-grid">
          <div
            v-for="(choice, idx) in currentQuestion.choices"
            :key="idx"
            class="option-btn"
            :class="{
              correct: answered && choice === currentQuestion.answer,
              wrong: answered && selectedAnswer === choice && choice !== currentQuestion.answer
            }"
            @click="selectAnswer(choice)"
          >
            {{ choice }}
          </div>
        </div>

        <!-- 反馈 -->
        <div v-if="answered" class="feedback" :class="isCorrect ? 'correct' : 'wrong'">
          <span v-if="isCorrect">✅ 回答正确！</span>
          <span v-else>❌ 正确答案是：{{ currentQuestion.answer }}</span>
        </div>

        <!-- 下一题 / 完成 -->
        <button
          v-if="answered && currentQIndex < questions.length - 1"
          class="btn-next"
          @click="nextQuestion"
        >
          下一题 →
        </button>
        <button
          v-if="answered && currentQIndex === questions.length - 1"
          class="btn-finish"
          @click="finishGame"
        >
          查看结果
        </button>
      </div>

      <!-- 游戏结束 -->
      <div v-if="showResult" class="result-overlay">
        <div class="result-card">
          <h3>📊 挑战完成！</h3>
          <div class="result-score">{{ correctCount }} / {{ questions.length }}</div>
          <div class="result-percent">正确率 {{ Math.round(correctCount / questions.length * 100) }}%</div>
          <div class="stars">
            <span v-for="s in starCount" :key="s">⭐</span>
          </div>
          <button class="btn-retry" @click="startGame">再来一次</button>
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
import { generateChart } from '../config/charts';

defineEmits(['back']);

const settingsStore = useSettingsStore();

// 状态
const gameStarted = ref(false);
const chartType = ref('');
const chartData = ref(null);
const questions = ref([]);
const currentQIndex = ref(0);
const score = ref(0);
const correctCount = ref(0);
const answered = ref(false);
const selectedAnswer = ref(null);
const isCorrect = ref(false);
const showResult = ref(false);

// SVG 常量
const svgWidth = 500;
const svgHeight = 320;
const marginTop = 30;
const marginBottom = 50;
const marginLeft = 50;
const marginRight = 20;

const currentQuestion = computed(() => {
  if (questions.value.length === 0) return { question: '', answer: '', choices: [] };
  return questions.value[currentQIndex.value] || { question: '', answer: '', choices: [] };
});

const starCount = computed(() => {
  if (questions.value.length === 0) return 0;
  const rate = correctCount.value / questions.value.length;
  if (rate >= 0.9) return 3;
  if (rate >= 0.7) return 2;
  if (rate >= 0.5) return 1;
  return 0;
});

// Y轴网格线
const yGridLines = computed(() => {
  if (!chartData.value) return [];
  const maxVal = Math.max(...chartData.value.values);
  const step = Math.ceil(maxVal / 4 / 10) * 10;
  const lines = [];
  for (let i = 0; i <= 4; i++) {
    const val = step * i;
    const y = chartAreaBottom - (val / (step * 4)) * chartAreaHeight;
    lines.push({ y, label: val });
  }
  return lines;
});

const chartAreaTop = marginTop;
const chartAreaBottom = svgHeight - marginBottom;
const chartAreaHeight = chartAreaBottom - chartAreaTop;

// 柱状图计算
function barX(idx) {
  const totalWidth = svgWidth - marginLeft - marginRight;
  const count = chartData.value.values.length;
  const gap = totalWidth * 0.2 / count;
  const bw = (totalWidth * 0.8) / count;
  return marginLeft + idx * (bw + gap) + gap / 2;
}

function barWidth() {
  const totalWidth = svgWidth - marginLeft - marginRight;
  const count = chartData.value.values.length;
  return (totalWidth * 0.8) / count;
}

function barY(val) {
  const maxVal = Math.max(...chartData.value.values);
  const h = (val / maxVal) * chartAreaHeight;
  return chartAreaBottom - h;
}

function barHeight(val) {
  const maxVal = Math.max(...chartData.value.values);
  return (val / maxVal) * chartAreaHeight;
}

const barColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa', '#06b6d4', '#f97316', '#ec4899'];
function barColor(idx) {
  return barColors[idx % barColors.length];
}

// 折线图计算
function lineX(idx) {
  const totalWidth = svgWidth - marginLeft - marginRight;
  const count = chartData.value.values.length;
  const spacing = totalWidth / (count - 1 || 1);
  return marginLeft + idx * spacing;
}

function lineY(val) {
  const maxVal = Math.max(...chartData.value.values);
  return chartAreaBottom - (val / maxVal) * chartAreaHeight;
}

const linePoints = computed(() => {
  if (!chartData.value) return '';
  return chartData.value.values.map((val, idx) => {
    return `${lineX(idx)},${lineY(val)}`;
  }).join(' ');
});

// 扇形图计算
const pieCenterX = svgWidth / 2 - 40;
const pieCenterY = svgHeight / 2;
const pieRadius = 110;

// 扇形图图例位置
const legendX = svgWidth / 2 + 70;
const legendY = svgHeight / 2 - 60;

const pieColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa', '#06b6d4', '#f97316', '#ec4899'];
function pieColor(idx) {
  return pieColors[idx % pieColors.length];
}

function pieSlicePath(idx) {
  const values = chartData.value.values;
  const total = values.reduce((a, b) => a + b, 0);
  let startAngle = 0;
  for (let i = 0; i < idx; i++) {
    startAngle += (values[i] / total) * 360;
  }
  const endAngle = startAngle + (values[idx] / total) * 360;

  const startRad = (startAngle - 90) * Math.PI / 180;
  const endRad = (endAngle - 90) * Math.PI / 180;

  const x1 = pieRadius * Math.cos(startRad);
  const y1 = pieRadius * Math.sin(startRad);
  const x2 = pieRadius * Math.cos(endRad);
  const y2 = pieRadius * Math.sin(endRad);

  const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

  return `M 0 0 L ${x1} ${y1} A ${pieRadius} ${pieRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

// 根据图表类型获取知识点 id
function getChartKnowledgeId() {
  const type = chartData.value?.type || chartType.value;
  switch (type) {
    case 'bar': return 'chart_bar';
    case 'line': return 'chart_line';
    case 'pie': return 'chart_pie';
    default: return 'chart_bar';
  }
}

// 游戏方法
function startGame() {
  const result = generateChart(settingsStore.gradeRange.max, chartType.value || null);
  chartData.value = result.chartData;
  questions.value = result.questions;
  currentQIndex.value = 0;
  score.value = 0;
  correctCount.value = 0;
  answered.value = false;
  selectedAnswer.value = null;
  isCorrect.value = false;
  showResult.value = false;
  gameStarted.value = true;
}

function selectAnswer(choice) {
  if (answered.value) return;
  answered.value = true;
  selectedAnswer.value = choice;

  const correct = choice === currentQuestion.value.answer;
  if (correct) {
    isCorrect.value = true;
    correctCount.value++;
    score.value += 10;
  } else {
    isCorrect.value = false;
  }

  // 记录知识点答题结果
  const mathKnowledgeStore = useMathKnowledgeStore();
  const knowledgeId = getChartKnowledgeId();
  mathKnowledgeStore.recordResult(knowledgeId, correct);
}

function nextQuestion() {
  currentQIndex.value++;
  answered.value = false;
  selectedAnswer.value = null;
  isCorrect.value = false;
}

function finishGame() {
  showResult.value = true;
}

function backToMenu() {
  gameStarted.value = false;
  showResult.value = false;
}
</script>

<style scoped>
.chart-game {
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

.setup-screen {
  max-width: 500px;
  width: 100%;
  text-align: center;
  margin-top: 3rem;
}

.game-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.game-desc {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.setup-options {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.chart-select label {
  margin-right: 0.5rem;
  color: #94a3b8;
}

.chart-select select {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}

.chart-select select option {
  background: #1e293b;
  color: #fff;
}

.btn-start {
  padding: 0.8rem 2.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
}

.game-screen {
  max-width: 800px;
  width: 100%;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.game-header h2 {
  margin: 0;
  font-size: 1.4rem;
}

.game-stats {
  display: flex;
  gap: 0.8rem;
}

.stat {
  padding: 0.3rem 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.85rem;
}

.chart-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.chart-svg {
  width: 100%;
  height: auto;
  max-height: 320px;
}

.bar-rect,
.line-dot,
.pie-slice {
  transition: opacity 0.3s;
}

.bar-rect:hover,
.line-dot:hover,
.pie-slice:hover {
  opacity: 0.8;
}

.line-polyline {
  filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3));
}

.questions-area {
  text-align: center;
}

.question-text {
  font-size: 1.15rem;
  margin-bottom: 1.2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  line-height: 1.5;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.option-btn {
  padding: 0.7rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
}

.option-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
}

.option-btn.correct {
  background: rgba(34, 197, 94, 0.3);
  border-color: #22c55e;
}

.option-btn.wrong {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
}

.feedback {
  margin: 1rem 0;
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
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

.btn-next,
.btn-finish {
  padding: 0.7rem 2rem;
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-next {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.btn-finish {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.btn-next:hover,
.btn-finish:hover {
  transform: translateY(-2px);
}

.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.result-card {
  padding: 2.5rem;
  background: #1e293b;
  border-radius: 24px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.result-card h3 {
  font-size: 1.6rem;
  margin: 0 0 1rem 0;
}

.result-score {
  font-size: 2.5rem;
  font-weight: bold;
  color: #fbbf24;
  margin: 0.5rem 0;
}

.result-percent {
  font-size: 1.1rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.stars {
  font-size: 2.2rem;
  margin: 1rem 0;
}

.btn-retry,
.btn-back-main {
  display: inline-block;
  margin: 0.4rem;
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
  .game-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .setup-options {
    flex-direction: column;
    gap: 1rem;
  }

  .option-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 1rem 2rem 0 0;
}
</style>
