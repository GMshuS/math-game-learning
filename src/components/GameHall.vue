<template>
  <div class="game-hall">
    <div class="hall-header">
      <h2>🧮 数学乐园</h2>
      <div class="header-actions">
        <button class="btn-knowledge" @click="$emit('startKnowledgeCenter')">📚 知识中心</button>
        <button class="btn-leaderboard" @click="$emit('openLeaderboard')">🏆 排行榜</button>
        <button class="btn-achievements" @click="$emit('openAchievements')">🏅 成就</button>
        <button class="btn-back" @click="$emit('back')">← 返回</button>
      </div>
    </div>

    <div class="hall-sections">
      <section v-for="section in sections" :key="section.id" class="hall-section">
        <div class="section-header" @click="toggleSection(section.id)">
          <span class="section-title">{{ section.icon }} {{ section.label }}</span>
          <span class="section-toggle">{{ expandedSections[section.id] ? '▼' : '▶' }}</span>
        </div>
        <div v-show="expandedSections[section.id]" class="section-cards">
          <div
            v-for="game in section.games"
            :key="game.id"
            class="hall-card"
            :class="[game.cardClass, { 'coming-soon': game.comingSoon }]"
            @click="handleGameClick(game)"
          >
            <div class="card-icon">{{ game.icon }}</div>
            <h3>{{ game.name }}</h3>
            <p>{{ game.description }}</p>
            <div v-if="game.comingSoon" class="card-status soon-badge">即将开放</div>
            <div v-else class="card-status">
              <span>{{ getStatusText(game) }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { useMathKnowledgeStore } from '../store/mathKnowledgeStore';
import { getDueCount } from '../utils/spacedRepetition';

// ⚠️ 架构建议：以下 computed 直接访问 gameStore 深层嵌套属性（如 gameStore.speedChallenge?.bestScores?.base）。
//    建议在对应 Store 中暴露 getter（如 speedChallengeStore.bestScore），降低组件与 Store 内部结构的耦合度。

const emit = defineEmits([
  'back',
  'startMarket',
  'startAdventure',
  'startSpeedChallenge',
  'startWorkshop',
  'startClock',
  'startProbability',
  'startTargetedTraining',
  'startReview',
  'startGeometryGame',
  'startUnitGame',
  'startChartGame',
  'startKnowledgeCenter',
  'openLeaderboard',
  'openAchievements'
]);

const gameStore = useGameStore();
const settingsStore = useSettingsStore();

const adventureProgress = computed(() => {
  const area = gameStore.currentArea || 'area_1';
  const areaNum = area.replace('area_', '');
  return `第${areaNum}关`;
});

const bestSpeedScore = computed(() => {
  const best = gameStore.speedChallenge?.bestScores?.base || null;
  return best ? `${best.score}分` : '未挑战';
});

const listedCount = computed(() => {
  return gameStore.workshop?.listedItems?.filter(item => !item.sold).length || 0;
});

const mathKnowledgeStore = useMathKnowledgeStore();
const weakNodeCount = computed(() => {
  const records = mathKnowledgeStore.records;
  return Object.values(records).filter(r =>
    r.totalAttempts > 0 && (r.wrongCount / r.totalAttempts) > 0.3
  ).length;
});
const dueCount = computed(() => {
  return getDueCount(mathKnowledgeStore.records);
});

const weakNodeText = computed(() => {
  return weakNodeCount.value > 0
    ? `待强化: ${weakNodeCount.value} 个知识点`
    : '暂无薄弱点';
});

const dueText = computed(() => {
  return dueCount.value > 0
    ? `${dueCount.value} 个知识点待复习`
    : '暂无待复习内容';
});

// 知识领域分组定义
const sections = [
  {
    id: 'numbers',
    label: '数与运算',
    icon: '🔢',
    games: [
      { id: 'speedChallenge', name: '速算竞技场', icon: '⚡', description: '限时答题，挑战手速', cardClass: 'speed-card', comingSoon: false },
      { id: 'market', name: '超市大挑战', icon: '🏪', description: '购物达人，收银小能手', cardClass: 'market-card', comingSoon: false },
      { id: 'targetedTraining', name: '针对性训练', icon: '🎯', description: '根据错题记录，自动推荐薄弱题型', cardClass: 'training-card', comingSoon: false },
      { id: 'review', name: '复习模式', icon: '📚', description: '基于遗忘曲线，智能安排复习', cardClass: 'review-card', comingSoon: false }
    ]
  },
  {
    id: 'geometry',
    label: '几何王国',
    icon: '📐',
    games: [
      { id: 'geometryGame', name: '几何王国', icon: '📐', description: '认识图形，探索几何奥秘', cardClass: 'geometry-card', comingSoon: false }
    ]
  },
  {
    id: 'quantities',
    label: '常见量',
    icon: '📏',
    games: [
      { id: 'clockGame', name: '钟表学院', icon: '🕐', description: '认读时间，掌握时刻', cardClass: 'clock-card', comingSoon: false },
      { id: 'unitGame', name: '单位大冒险', icon: '📏', description: '单位换算，量感培养', cardClass: 'unit-card', comingSoon: false }
    ]
  },
  {
    id: 'statistics',
    label: '统计与概率',
    icon: '📊',
    games: [
      { id: 'probabilityLab', name: '概率实验室', icon: '🎲', description: '抛硬币、掷骰子，探索概率', cardClass: 'probability-card', comingSoon: false },
      { id: 'chartGame', name: '统计图表', icon: '📊', description: '读图作答，数据分析', cardClass: 'chart-card', comingSoon: false }
    ]
  },
  {
    id: 'comprehensive',
    label: '综合应用',
    icon: '🧩',
    games: [
      { id: 'adventure', name: '冒险模式', icon: '⚔️', description: '挑战数学怪物，提升角色等级', cardClass: 'adventure-card', comingSoon: false },
      { id: 'workshop', name: '数学工坊', icon: '🔨', description: '收集材料，制作出售', cardClass: 'workshop-card', comingSoon: false }
    ]
  }
];

const expandedSections = reactive({
  numbers: true,
  geometry: true,
  quantities: true,
  statistics: true,
  comprehensive: true
});

const toggleSection = (id) => {
  expandedSections[id] = !expandedSections[id];
};

const getStatusText = (game) => {
  switch (game.id) {
  case 'adventure':
    return adventureProgress.value;
  case 'speedChallenge':
    return `最佳: ${bestSpeedScore.value}`;
  case 'workshop':
    return `待售: ${listedCount.value} 件`;
  case 'targetedTraining':
    return weakNodeText.value;
  case 'review':
    return dueText.value;
  case 'clockGame':
    return `${settingsStore.gradeRange.max || 1}年级可学`;
  default:
    return '';
  }
};

const handleGameClick = (game) => {
  if (game.comingSoon) return;
  const emitMap = {
    market: 'startMarket',
    adventure: 'startAdventure',
    speedChallenge: 'startSpeedChallenge',
    workshop: 'startWorkshop',
    clockGame: 'startClock',
    probabilityLab: 'startProbability',
    targetedTraining: 'startTargetedTraining',
    review: 'startReview',
    geometryGame: 'startGeometryGame',
    unitGame: 'startUnitGame',
    chartGame: 'startChartGame'
  };
  const emitName = emitMap[game.id];
  if (emitName) {
    emit(emitName);
  }
};
</script>

<style scoped>
.game-hall {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  color: #fff;
  overflow-y: auto;
}

.hall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.hall-header h2 {
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
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.25);
}

.hall-sections {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hall-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
  user-select: none;
}

.section-header:hover {
  background: rgba(255, 255, 255, 0.08);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.section-toggle {
  font-size: 0.85rem;
  opacity: 0.6;
  transition: transform 0.2s ease;
}

.section-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.hall-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.hall-card:not(.coming-soon):hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
}

.hall-card.coming-soon {
  cursor: default;
  opacity: 0.5;
  border-style: dashed;
  border-color: rgba(255, 255, 255, 0.2);
}

.hall-card.coming-soon:hover {
  transform: none;
  box-shadow: none;
}

.adventure-card:hover {
  border-color: #764ba2;
}

.market-card:hover {
  border-color: #f97316;
}

.speed-card:hover {
  border-color: #f59e0b;
}

.workshop-card:hover {
  border-color: #10b981;
}

.training-card:hover {
  border-color: #f59e0b;
}

.review-card:hover {
  border-color: #8b5cf6;
}

.clock-card:hover {
  border-color: #f59e0b;
}

.probability-card:hover {
  border-color: #8b5cf6;
}

.geometry-card:hover {
  border-color: #3b82f6;
}

.unit-card:hover {
  border-color: #22c55e;
}

.chart-card:hover {
  border-color: #f59e0b;
}

.card-icon {
  font-size: 3.5rem;
  margin-bottom: 0.8rem;
}

.hall-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.hall-card p {
  margin: 0 0 1rem 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.card-status {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
}

.soon-badge {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

.btn-leaderboard {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 25px;
  color: #000;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-leaderboard:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(251, 191, 36, 0.4);
}

.btn-knowledge {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #34d399, #10b981);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-knowledge:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 211, 153, 0.4);
}

.btn-achievements {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #f472b6, #ec4899);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-achievements:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(244, 114, 182, 0.4);
}

@media (max-width: 768px) {
  .game-hall {
    padding: 1rem;
  }

  .section-cards {
    grid-template-columns: 1fr;
  }
}
</style>
