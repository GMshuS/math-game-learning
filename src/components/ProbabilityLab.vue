<template>
  <div class="probability-lab">
    <GameTutorial
      v-if="showTutorial"
      title="🎲 概率实验室玩法说明"
      :steps="probabilityTutorialSteps"
      @close="closeTutorial"
    />

    <div class="top-bar">
      <button class="btn-back" @click="$emit('back')">← 返回</button>
      <button class="btn-help" @click="showTutorial = true">❓ 玩法说明</button>
    </div>

    <!-- ====== 设置界面 ====== -->
    <div v-if="phase === 'setup'" class="setup-screen">
      <h2 class="game-title">🎲 概率实验室</h2>
      <p class="game-desc">抛硬币、掷骰子，在实验中探索概率的奥秘！</p>

      <!-- 实验类型选择 -->
      <div class="experiment-select">
        <label class="select-label">选择实验：</label>
        <div class="experiment-cards">
          <div
            v-for="exp in experiments"
            :key="exp.id"
            class="experiment-card"
            :class="{ active: selectedExperiment === exp.id }"
            @click="startSimulation(exp.id)"
          >
            <span class="exp-icon">{{ exp.icon }}</span>
            <span class="exp-name">{{ exp.name }}</span>
            <span class="exp-desc">{{ exp.description }}</span>
          </div>
        </div>
      </div>

      <!-- 模拟次数设置 -->
      <div class="trials-setting">
        <label class="select-label">
          模拟次数：<strong>{{ trials }}</strong> 次
        </label>
        <input
          v-model.number="trials"
          type="range"
          class="trials-slider"
          :min="gradeConfig.trialsLimit >= 100 ? 10 : 5"
          :max="gradeConfig.trialsLimit"
          step="5"
        >
        <div class="trials-hints">
          <span>最少 {{ gradeConfig.trialsLimit >= 100 ? 10 : 5 }} 次</span>
          <span>最多 {{ gradeConfig.trialsLimit }} 次</span>
        </div>
      </div>

      <!-- 知识点说明（年级自适应） -->
      <div class="knowledge-panel">
        <h3 class="knowledge-title">📖 知识点</h3>
        <p class="knowledge-text">{{ knowledgeText }}</p>
      </div>

    </div>

    <!-- ====== 模拟界面 ====== -->
    <div v-else-if="phase === 'simulating'" class="sim-screen">
      <div class="sim-header">
        <div class="sim-header-left">
          <span class="sim-grade">{{ settingsStore.gradeRange.max }}年级</span>
          <span class="sim-experiment">{{ currentExperiment.icon }} {{ currentExperiment.name }}</span>
        </div>
        <div class="sim-header-right">
          <span class="sim-status">{{ simulating ? '模拟中...' : '已完成' }}</span>
        </div>
      </div>

      <!-- Phaser 场景容器 -->
      <div ref="gameContainer" class="phaser-container" />

      <!-- 操作按钮 -->
      <div class="sim-controls">
        <button
          class="btn-restart"
          :disabled="simulating"
          @click="restartSimulation"
        >
          🔄 重新模拟
        </button>
        <button
          class="btn-back-setup"
          :disabled="simulating"
          @click="backToSetup"
        >
          ← 更换实验
        </button>
      </div>

      <!-- 理论概率 vs 实际频率对比表 -->
      <div class="comparison-table">
        <h3 class="comparison-title">📊 理论概率 vs 实际频率</h3>
        <table class="comp-table">
          <thead>
            <tr>
              <th>结果</th>
              <th>实际频次</th>
              <th>实际频率</th>
              <th>理论概率</th>
              <th>误差</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in comparisonData" :key="item.label">
              <td class="comp-label">{{ item.label }}</td>
              <td>{{ item.count }} 次</td>
              <td>{{ (item.actualPct * 100).toFixed(1) }}%</td>
              <td>{{ (item.theoreticalPct * 100).toFixed(1) }}%</td>
              <td :class="errorClass(item.error)">
                {{ (item.error * 100).toFixed(1) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 知识点回顾 -->
      <div class="knowledge-review">
        <h3 class="knowledge-title">📖 知识小结</h3>
        <p class="knowledge-text">{{ knowledgeText }}</p>
        <p v-if="showProbabilityNote" class="knowledge-note">
          💡 实验次数越多，实际频率越接近理论概率。试试增加次数再模拟一次吧！
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue';
import Phaser from 'phaser';
import { useSettingsStore } from '../store/settingsStore';
import { useMathKnowledgeStore } from '../store/mathKnowledgeStore';
import ProbabilityScene from '../scenes/ProbabilityScene';
import {
  getAllExperiments,
  getExperimentConfig,
  getConfigForGrade,
  generateExperimentParams
} from '../config/probability';
import GameTutorial from './GameTutorial.vue';

defineEmits(['back']);

const showTutorial = ref(false);

const probabilityTutorialSteps = [
  {
    title: '选择实验',
    description: '概率实验室提供多种概率实验：抛硬币、掷骰子、摸球、转盘等。每种实验对应不同的概率概念，适合不同年级学习。'
  },
  {
    title: '抛硬币',
    description: '模拟抛硬币实验，观察正面和反面出现的频率。理论概率各为50%，适合低年级理解"可能性"概念。'
  },
  {
    title: '掷骰子',
    description: '模拟掷骰子实验，记录每个点数出现的次数。每个点数的理论概率为1/6，适合中高年级学习等可能事件。'
  },
  {
    title: '设置模拟次数',
    description: '通过滑块调整模拟次数（最少5-10次，最多依年级而定）。实验次数越多，实际频率越趋近理论概率，这就是"大数定律"。'
  },
  {
    title: '对比分析',
    description: '模拟完成后，对比"理论概率"与"实际频率"的差异。误差越小说明实验越接近理论值，引导学生理解概率的随机性与规律性。'
  }
];

const closeTutorial = () => {
  showTutorial.value = false;
};

const settingsStore = useSettingsStore();

// 实验 → 知识点 id 映射
const experimentToKnowledgeId = {
  coin: 'probability_basic',
  dice: 'probability_calc',
  ball: 'probability_compare',
  spinner: 'probability_basic'
};

// ====== 状态变量 ======
const phase = ref('setup');           // 'setup' | 'simulating'
const selectedExperiment = ref('coin');
const trials = ref(20);
const simulating = ref(false);
const simulationStats = ref(null);

// Phaser
const gameContainer = ref(null);
let game = null;
let currentScene = null;

// ====== 计算属性 ======

// 所有实验列表
const experiments = computed(() => {
  return getAllExperiments();
});

// 当前实验配置
const currentExperiment = computed(() => {
  const exp = getExperimentConfig(selectedExperiment.value);
  return exp || { id: 'coin', name: '抛硬币', icon: '🪙', description: '' };
});

// 年级配置
const gradeConfig = computed(() => {
  return getConfigForGrade(settingsStore.gradeRange.max);
});

// 是否显示概率值（5-6年级）
const showProbabilityNote = computed(() => {
  return gradeConfig.value.level === 'calculation';
});

// 知识点文案（年级自适应）
const knowledgeText = computed(() => {
  const grade = settingsStore.gradeRange.max;
  if (grade <= 2) {
    return '在生活和游戏中，有些事情一定会发生（一定），有些事情不会发生（不可能），有些事情可能发生也可能不发生（可能）。比如：太阳从东边升起是"一定"的，掷骰子掷出7点是"不可能"的，明天是否下雨是"可能"的。';
  } else if (grade <= 4) {
    return '事件发生的可能性有大有小。比如：袋子里有5个红球和1个蓝球，摸到红球的可能性比摸到蓝球的可能性大。我们可以用"经常""偶尔""很少"等词语来描述可能性的大小。';
  } else {
    return '概率是衡量事件发生可能性大小的数值，范围在0到1之间。概率越接近1，事件越可能发生；概率越接近0，事件越不可能发生。例如：掷一枚均匀硬币，正面向上的概率是1/2（0.5）；掷一颗均匀骰子，每个点数出现的概率是1/6（≈0.167）。当实验次数足够多时，实际频率会趋近于理论概率，这就是"大数定律"。';
  }
});

// 对比数据（模拟完成后）
const comparisonData = computed(() => {
  if (!simulationStats.value) return [];
  return Object.entries(simulationStats.value).map(([label, data]) => {
    const theoreticalPct = data.theoreticalProb || 0;
    const actualPct = data.frequency || 0;
    return {
      label,
      count: data.count || 0,
      actualPct,
      theoreticalPct,
      error: actualPct - theoreticalPct
    };
  });
});

// ====== 方法 ======

/**
 * 获取 Phaser 场景实例
 */
function getScene() {
  return game?.scene?.getScene('ProbabilityScene') || null;
}

/**
 * 开始模拟
 */
function startSimulation(expId) {
  if (expId) selectedExperiment.value = expId;
  phase.value = 'simulating';
  simulating.value = true;
  simulationStats.value = null;

  // 在 nextTick 中等待 DOM 渲染完成再初始化 Phaser
  // 使用 setTimeout 确保 gameContainer 已渲染
  setTimeout(() => {
    initPhaserGame();
  }, 100);
}

/**
 * 初始化 Phaser 游戏
 */
function initPhaserGame() {
  // 销毁旧实例
  if (game) {
    game.destroy(true);
    game = null;
    currentScene = null;
  }

  if (!gameContainer.value) return;

  const params = generateExperimentParams(selectedExperiment.value, settingsStore.gradeRange.max);
  params.trials = trials.value;

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameContainer.value,
    width: 500,
    height: 420,
    backgroundColor: '#1a1a2e',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [ProbabilityScene]
  });

  // 监听场景就绪
  game.events.on('ready', () => {
    // 场景已自动通过 init 开始模拟
    // 设置模拟结束回调
    const scene = getScene();
    if (scene) {
      scene.onSimulationEnd = onSimulationComplete;
      currentScene = scene;
    }
  });

  // 如果场景已就绪但 ready 事件已过，通过 scene 事件获取
  setTimeout(() => {
    const scene = getScene();
    if (scene && !currentScene) {
      scene.onSimulationEnd = onSimulationComplete;
      currentScene = scene;
    }
  }, 500);
}

/**
 * 模拟完成回调
 */
function onSimulationComplete(result) {
  simulating.value = false;
  if (result && result.stats) {
    simulationStats.value = result.stats;
  }

  // 记录知识点：概率实验不涉及对错，记录为"正确"（完成一次学习活动）
  const mathKnowledgeStore = useMathKnowledgeStore();
  const knowledgeId = experimentToKnowledgeId[selectedExperiment.value] || 'probability_basic';
  mathKnowledgeStore.recordResult(knowledgeId, true);
}

/**
 * 重新模拟
 */
function restartSimulation() {
  if (simulating.value) return;
  simulating.value = true;
  simulationStats.value = null;

  const scene = getScene();
  if (scene) {
    const params = generateExperimentParams(selectedExperiment.value, settingsStore.gradeRange.max);
    params.trials = trials.value;
    scene.onSimulationEnd = onSimulationComplete;
    scene.restartSimulation(selectedExperiment.value, params);
  } else {
    // 场景不存在，重新创建
    initPhaserGame();
  }
}

/**
 * 返回设置页面
 */
function backToSetup() {
  if (game) {
    game.destroy(true);
    game = null;
    currentScene = null;
  }
  phase.value = 'setup';
  simulating.value = false;
  simulationStats.value = null;
}

/**
 * 误差样式
 */
function errorClass(error) {
  const abs = Math.abs(error);
  if (abs < 0.05) return 'error-small';
  if (abs < 0.1) return 'error-medium';
  return 'error-large';
}

// ====== 生命周期 ======

onUnmounted(() => {
  if (game) {
    game.destroy(true);
    game = null;
    currentScene = null;
  }
});

// 当年级或实验类型在设置页切换时，更新默认模拟次数
watch(() => settingsStore.gradeRange.max, (newMax) => {
  const config = getConfigForGrade(newMax);
  trials.value = Math.min(trials.value, config.trialsLimit);
  if (trials.value < (config.trialsLimit >= 100 ? 10 : 5)) {
    trials.value = config.trialsLimit >= 100 ? 10 : 5;
  }
});
</script>

<style scoped>
.probability-lab {
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
  max-width: 600px;
  gap: 1.5rem;
  padding-top: 2rem;
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

.select-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

/* 实验选择 */

.experiment-select {
  width: 100%;
}

.experiment-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
}

.experiment-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1.2rem 0.8rem;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.experiment-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-3px);
}

.experiment-card.active {
  background: rgba(102, 126, 234, 0.15);
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.exp-icon {
  font-size: 2.5rem;
}

.exp-name {
  font-size: 1rem;
  font-weight: 600;
}

.exp-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

/* 模拟次数 */

.trials-setting {
  width: 100%;
}

.trials-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.trials-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.trials-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  cursor: pointer;
  border: 2px solid #fff;
}

.trials-hints {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.3rem;
}

/* 知识点面板 */

.knowledge-panel {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.knowledge-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #fbbf24;
}

.knowledge-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
}

/* 开始按钮 */

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

/* ====== 模拟界面 ====== */

.sim-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  gap: 1rem;
  padding-top: 1rem;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0;
}

.sim-header-left {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.sim-grade {
  padding: 0.3rem 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 0.85rem;
}

.sim-experiment {
  padding: 0.3rem 0.8rem;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 0.85rem;
}

.sim-header-right {
  display: flex;
  align-items: center;
}

.sim-status {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

/* Phaser 容器 */

.phaser-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 500px;
}

/* 操作按钮 */

.sim-controls {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 500px;
  justify-content: center;
}

.btn-restart,
.btn-back-setup {
  padding: 0.7rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  color: #fff;
}

.btn-restart {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.btn-restart:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4);
}

.btn-back-setup {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-back-setup:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.btn-restart:disabled,
.btn-back-setup:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 对比表 */

.comparison-table {
  width: 100%;
  max-width: 500px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comparison-title {
  margin: 0 0 0.8rem 0;
  font-size: 1rem;
  color: #fbbf24;
  text-align: center;
}

.comp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.comp-table th {
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.comp-table td {
  padding: 0.4rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.comp-label {
  font-weight: 600;
}

.error-small {
  color: #4ade80;
}

.error-medium {
  color: #fbbf24;
}

.error-large {
  color: #ef4444;
}

/* 知识小结 */

.knowledge-review {
  width: 100%;
  max-width: 500px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
}

.knowledge-note {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #fbbf24;
  line-height: 1.5;
}

/* ====== 响应式 ====== */

@media (max-width: 768px) {
  .setup-screen {
    padding: 1rem 0;
  }

  .game-title {
    font-size: 1.8rem;
  }

  .experiment-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .grade-buttons {
    gap: 0.4rem;
  }

  .grade-btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }

  .sim-controls {
    flex-direction: column;
    align-items: center;
  }

  .comp-table {
    font-size: 0.75rem;
  }

  .comp-table th,
  .comp-table td {
    padding: 0.3rem;
  }
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem 2rem 0 0;
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
</style>
