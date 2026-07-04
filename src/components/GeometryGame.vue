<template>
  <div class="geometry-game">
    <GameTutorial
      v-if="showTutorial"
      title="📐 几何王国玩法说明"
      :steps="geometryTutorialSteps"
      @close="closeTutorial"
    />

    <!-- 模式选择界面 -->
    <div v-if="phase === 'select'" class="selection-screen">
      <div class="select-header">
        <h2 class="screen-title" style="margin:0;">📐 几何王国</h2>
        <div class="header-actions">
          <button class="btn-help" @click="showTutorial = true">❓ 玩法说明</button>
          <button class="btn-back" @click="back">← 返回</button>
        </div>
      </div>

      <!-- 模式选择 -->
      <div class="mode-section">
        <h3 class="section-title">选择模式</h3>
        <div class="mode-cards">
          <div
            v-for="mode in modes"
            :key="mode.id"
            class="mode-card"
            :class="{ active: selectedMode === mode.id }"
            @click="startGame(mode.id)"
          >
            <span class="mode-icon">{{ mode.icon }}</span>
            <span class="mode-name">{{ mode.name }}</span>
            <span class="mode-desc">{{ mode.desc }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- 游戏界面 -->
    <div v-else-if="phase === 'playing'" class="game-screen">
      <div class="game-header-bar">
        <div class="game-stats">
          <span class="stat-score">得分：{{ gameScore }}</span>
          <span class="stat-progress">{{ gameCorrect }}/{{ gameTotal }}</span>
        </div>
        <button class="btn-back" @click="backToSelect">← 返回</button>
      </div>
      <div ref="gameContainer" class="phaser-container" />
    </div>

    <!-- 结果界面 -->
    <div v-else-if="phase === 'result'" class="result-screen">
      <div class="result-top-bar">
        <button class="btn-back" @click="backToSelect">← 返回</button>
      </div>
      <div class="result-card">
        <div class="result-icon">{{ resultStars >= 3 ? '🎉' : resultStars >= 2 ? '👍' : '💪' }}</div>
        <h2 class="result-title">挑战完成！</h2>
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-label">答对</span>
            <span class="stat-value correct">{{ resultData.correctCount }} / {{ resultData.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">得分</span>
            <span class="stat-value score">{{ resultData.score }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">评级</span>
            <span class="stat-value stars">{{ '⭐'.repeat(resultStars) }}{{ resultStars < 3 ? ' 继续加油！' : '' }}</span>
          </div>
        </div>
        <div class="result-actions">
          <button class="btn-restart" @click="restartGame">🔄 再来一次</button>
          <button class="btn-back-main" @click="backToSelect">📋 选择其他模式</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import Phaser from 'phaser';
import { useCardStore } from '../store/cardStore';
import { useSettingsStore } from '../store/settingsStore';
import { useMathKnowledgeStore } from '../store/mathKnowledgeStore';
import GeometryScene from '../scenes/GeometryScene';
import GameTutorial from './GameTutorial.vue';

const emit = defineEmits(['back']);

const showTutorial = ref(false);

const geometryTutorialSteps = [
  {
    title: '选择模式',
    description: '几何王国有8种模式，涵盖图形识别、角度、面积、立体图形等几何知识，选择感兴趣的开始学习！'
  },
  {
    title: '图形识别',
    description: '观察图形，选择正确的名称或属性。认识平面图形（三角形、四边形、圆等）和立体图形。'
  },
  {
    title: '角的世界',
    description: '识别和度量各种角：锐角、直角、钝角、平角和周角。掌握角度概念，为几何学习打基础。'
  },
  {
    title: '三角形探秘',
    description: '探索三角形的分类（按边和按角）、内角和定理以及三边关系等核心知识。'
  },
  {
    title: '面积挑战',
    description: '计算各种图形的周长和面积，包括正方形、长方形、三角形、平行四边形和梯形等。'
  },
  {
    title: '图形运动',
    description: '学习平移、旋转、轴对称等图形变换，理解图形的运动和对称性。'
  },
  {
    title: '立体工坊',
    description: '计算立体图形的表面积和体积，包括长方体、正方体、圆柱体和圆锥体等。'
  },
  {
    title: '圆的奥秘',
    description: '认识圆的半径、直径、圆周率π，学习圆的周长和面积计算，以及扇形的相关知识。'
  },
  {
    title: '三视图',
    description: '从正面、侧面、上面三个方向观察立体图形，培养空间想象力和三维思维能力。'
  },
  {
    title: '计分规则',
    description: '答对一题得10分，全部答完后根据正确率获得1-3颗星评价。正确率越高，星级越高！'
  }
];

const closeTutorial = () => {
  showTutorial.value = false;
};

const settingsStore = useSettingsStore();

// 模式 → 知识点 id 映射
const modeToKnowledgeId = {
  identify: 'geometry_shape',
  angles: 'geometry_angle',
  triangle: 'geometry_shape',
  area: 'geometry_area',
  transform: 'geometry_transform',
  solid: 'geometry_volume',
  circle: 'geometry_circle',
  views: 'geometry_shape'
};

// 模式定义
const modes = [
  { id: 'identify', name: '图形识别', icon: '🔍', desc: '观看图形，选择正确名称或属性' },
  { id: 'angles', name: '角的世界', icon: '📐', desc: '识别和度量各种角（锐角、直角、钝角等）' },
  { id: 'triangle', name: '三角形探秘', icon: '🔺', desc: '三角形分类、内角和、三边关系' },
  { id: 'area', name: '面积挑战', icon: '📏', desc: '计算各种图形的周长和面积' },
  { id: 'transform', name: '图形运动', icon: '🔄', desc: '平移、旋转、轴对称等图形变换' },
  { id: 'solid', name: '立体工坊', icon: '🧊', desc: '计算立体图形的表面积和体积' },
  { id: 'circle', name: '圆的奥秘', icon: '⭕', desc: '圆的半径、直径、周长、扇形认识' },
  { id: 'views', name: '三视图', icon: '👁️', desc: '从正面、侧面、上面观察立体图形' }
];

// 状态
const phase = ref('select'); // 'select' | 'playing' | 'result'
const selectedMode = ref('identify');

const gameContainer = ref(null);
let game = null;

// 游戏结果
const gameScore = ref(0);
const gameCorrect = ref(0);
const gameTotal = ref(0);
const resultStars = ref(0);
const resultData = ref({ score: 0, correctCount: 0, total: 0 });

/**
 * 创建 Phaser 游戏配置（提取为共享函数避免 DRY 重复）
 */
function createPhaserConfig(container) {
  return {
    type: Phaser.AUTO,
    parent: container,
    width: 800,
    height: 600,
    backgroundColor: '#0f1729',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [GeometryScene]
  };
}

/**
 * 开始游戏
 */
function startGame(modeId) {
  if (modeId) selectedMode.value = modeId;
  phase.value = 'playing';
  gameScore.value = 0;
  gameCorrect.value = 0;
  gameTotal.value = 0;

  // 等待 DOM 更新后再创建 Phaser 实例
  requestAnimationFrame(() => {
    if (gameContainer.value) {
      const config = createPhaserConfig(gameContainer.value);

      game = new Phaser.Game(config);

      game.scene.start('GeometryScene', {
        mode: selectedMode.value,
        grade: settingsStore.gradeRange.max,
        onComplete: (result) => {
          handleGameComplete(result);
        }
      });
    }
  });
}

/**
 * 处理游戏结束回调
 */
function handleGameComplete(result) {
  gameScore.value = result.score || 0;
  gameCorrect.value = result.correctCount || 0;
  gameTotal.value = result.total || 0;

  const rate = gameTotal.value > 0 ? gameCorrect.value / gameTotal.value : 0;
  let stars = 0;
  if (rate >= 0.9) stars = 3;
  else if (rate >= 0.7) stars = 2;
  else if (rate >= 0.5) stars = 1;
  resultStars.value = stars;

  resultData.value = {
    score: gameScore.value,
    correctCount: gameCorrect.value,
    total: gameTotal.value
  };

  // 记录知识点：将每道题的答题结果写入 mathKnowledgeStore
  const mathKnowledgeStore = useMathKnowledgeStore();
  const knowledgeId = modeToKnowledgeId[selectedMode.value] || 'geometry_shape';
  for (let i = 0; i < result.correctCount; i++) {
    mathKnowledgeStore.recordResult(knowledgeId, true);
  }
  for (let i = result.correctCount; i < result.total; i++) {
    mathKnowledgeStore.recordResult(knowledgeId, false);
  }

  // 销毁 Phaser 实例
  destroyGame();

  // 卡牌碎片产出：每关通过得 1 碎片
  const cardStore = useCardStore();
  cardStore.earnShard('math', 1);

  // 显示结果界面
  phase.value = 'result';
}

/**
 * 销毁 Phaser 游戏实例
 */
function destroyGame() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}

/**
 * 返回模式选择
 */
function backToSelect() {
  destroyGame();
  phase.value = 'select';
}

/**
 * 直接返回上级
 */
function back() {
  emit('back');
}

/**
 * 重新开始（同模式、同年级）
 */
function restartGame() {
  destroyGame();
  gameScore.value = 0;
  gameCorrect.value = 0;
  gameTotal.value = 0;
  phase.value = 'playing';

  requestAnimationFrame(() => {
    if (gameContainer.value) {
      const config = createPhaserConfig(gameContainer.value);

      game = new Phaser.Game(config);

      game.scene.start('GeometryScene', {
        mode: selectedMode.value,
        grade: settingsStore.gradeRange.max,
        onComplete: (result) => {
          handleGameComplete(result);
        }
      });
    }
  });
}

onUnmounted(() => {
  destroyGame();
});
</script>

<style scoped>
.geometry-game {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  padding: 1rem;
}

/* ======================== */
/* 选择界面                  */
/* ======================== */
.selection-screen {
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.screen-title {
  font-size: 1.8rem;
  margin: 0.5rem 0;
  text-align: center;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-title {
  font-size: 1.1rem;
  margin: 0 0 0.8rem 0;
  color: #94a3b8;
  text-align: center;
}

.mode-section {
  width: 100%;
}

/* 模式卡片 */
.mode-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.mode-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1.2rem 1rem;
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid #334155;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.mode-card:hover {
  border-color: #3b82f6;
  background: rgba(30, 41, 59, 1);
  transform: translateY(-2px);
}

.mode-card.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}

.mode-icon {
  font-size: 2.2rem;
}

.mode-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
}

.mode-desc {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.3;
}

.btn-start {
  padding: 0.8rem 2.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 30px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.btn-start:active {
  transform: translateY(0);
}

/* ======================== */
/* 游戏界面                  */
/* ======================== */
.game-screen {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-header-bar {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.game-stats {
  display: flex;
  gap: 1.2rem;
  align-items: center;
}

.stat-score {
  color: #fbbf24;
  font-weight: bold;
  font-size: 1rem;
}

.stat-progress {
  color: #94a3b8;
  font-size: 0.9rem;
  padding: 0.2rem 0.8rem;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 20px;
}

.phaser-container {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* ======================== */
/* 结果界面                  */
/* ======================== */
.result-screen {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem;
}

.result-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: rgba(30, 41, 59, 0.9);
  border: 2px solid #3b82f6;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.result-icon {
  font-size: 3rem;
}

.result-title {
  font-size: 1.8rem;
  margin: 0;
  color: #fff;
}

.result-stats {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
}

.stat-label {
  color: #94a3b8;
  font-size: 1rem;
}

.stat-value.correct {
  color: #4ade80;
  font-weight: bold;
  font-size: 1.1rem;
}

.stat-value.score {
  color: #fbbf24;
  font-weight: bold;
  font-size: 1.1rem;
}

.stat-value.stars {
  color: #fbbf24;
  font-size: 1.2rem;
}

.result-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-restart {
  padding: 0.7rem 1.8rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-restart:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
}

.btn-back-main {
  padding: 0.7rem 1.8rem;
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid #334155;
  border-radius: 25px;
  color: #94a3b8;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back-main:hover {
  border-color: #3b82f6;
  color: #fff;
}

/* 通用返回按钮 */
.btn-back {
  align-self: flex-start;
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* ======================== */
/* 响应式设计                */
/* ======================== */
@media (max-width: 600px) {
  .mode-cards {
    grid-template-columns: 1fr;
  }

  .grade-buttons {
    gap: 0.4rem;
  }

  .grade-btn {
    padding: 0.4rem 0.9rem;
    font-size: 0.85rem;
  }

  .result-card {
    padding: 1.5rem;
  }

  .game-stats {
    gap: 0.6rem;
  }

  .game-header-bar {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.select-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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
  transition: all 0.3s ease;
}

.btn-help:hover {
  background: rgba(102, 126, 234, 0.5);
}

.result-top-bar {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
