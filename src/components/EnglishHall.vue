<template>
  <div class="english-hall">
    <!-- 顶部标题 -->
    <div class="header">
      <div class="header-left">
        <h2>🎓 英语乐园</h2>
        <p class="level-info">
          Level {{ effectiveLevel }} · {{ levelTheme }}
        </p>
      </div>
      <div class="header-actions">
        <button class="btn-knowledge" @click="$emit('startKnowledgeCenter')">📚 知识中心</button>
        <button class="btn-leaderboard" @click="$emit('openLeaderboard')">🏆 排行榜</button>
        <button class="btn-achievements" @click="$emit('openAchievements')">🏅 成就</button>
        <button class="btn-back" @click="$emit('back')">← 返回</button>
      </div>
    </div>

    <div class="hall-sections">
      <section
        v-for="section in sections"
        :key="section.id"
        class="hall-section"
      >
        <!-- 分区标题（可折叠） -->
        <div class="section-header" @click="toggleSection(section.id)">
          <span class="section-title">{{ section.icon }} {{ section.label }}</span>
          <span class="section-toggle">{{ expandedSections[section.id] ? '▼' : '▶' }}</span>
        </div>

        <!-- 分区内容 -->
        <div v-show="expandedSections[section.id]" class="section-items">
          <template v-for="(item, index) in section.items" :key="item.id">
            <!-- 单词速拼区的分割线 -->
            <div
              v-if="section.id === 'vocabulary' && index > 0 && item.group !== section.items[index - 1]?.group"
              class="section-divider"
            >
              <span class="divider-label">
                {{ item.group === 'practice' ? '🏋️ 专项训练' : '🎮 游戏模式' }}
              </span>
            </div>

            <!-- 卡片条目 -->
            <div
              class="hall-card"
              @click="handleItemClick(item)"
            >
              <span class="card-icon">{{ item.icon }}</span>
              <div class="card-body">
                <span class="card-name">{{ item.name }}</span>
                <span class="card-desc">{{ item.desc }}</span>
              </div>
              <span class="card-status">{{ getStatusText(item) }}</span>
              <span class="card-arrow">›</span>
            </div>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useSettingsStore } from '../store/settingsStore';
import { useGameStore } from '../store/gameStore';
import { useEnglishKnowledgeStore } from '../store/englishKnowledgeStore';
import { englishGradesConfig } from '../config/english/grades';
import { grammarTowers } from '../config/english/grammar';
import { useEnglishSpiritStore } from '../store/englishSpiritStore';
import { useEnglishAdventureStore } from '../store/englishAdventureStore';
import { getAllEnglishRegions } from '../config/english/adventure';
import { getDueCount } from '../utils/spacedRepetition';

const emit = defineEmits([
  'startSpeedSpell', 'back', 'enterGrammar', 'startAdventure',
  'openLeaderboard', 'openAchievements', 'startTargetedTraining', 'startReview',
  'startKnowledgeCenter',
  'startTranslation', 'startListening', 'startReading', 'enterSpeaking',
  'enterSpeedSpellHall'
]);

const settingsStore = useSettingsStore();
const gameStore = useGameStore();
const spiritStore = useEnglishSpiritStore();

const effectiveLevel = computed(() => settingsStore.getEffectiveEnglishLevel);

const levelTheme = computed(() => {
  const cfg = englishGradesConfig[effectiveLevel.value];
  return cfg ? cfg.theme : '';
});

// ====== 分区定义 ======
const sections = [
  {
    id: 'training',
    label: '智能训练',
    icon: '🎯',
    items: [
      { id: 'targetedTraining', name: '针对性训练', icon: '🎯', desc: '错题强化', action: 'startTargetedTraining' },
      { id: 'review', name: '复习模式', icon: '📚', desc: '遗忘曲线', action: 'startReview' }
    ]
  },
  {
    id: 'vocabulary',
    label: '单词速拼',
    icon: '🔤',
    items: [
      { id: 'speedSpellEntry', name: '进入单词速拼', icon: '⚡', desc: '游戏模式/专项训练', action: 'enterSpeedSpellHall' }
    ]
  },
  {
    id: 'grammar',
    label: '语法城堡',
    icon: '🏰',
    items: [
      { id: 'grammarCastle', name: '进入语法城堡', icon: '🏰', desc: '闯语法塔，掌握语法', action: 'enterGrammar' }
    ]
  },
  {
    id: 'speaking',
    label: '口语专区',
    icon: '💬',
    items: [
      { id: 'speakingArea', name: '口语专区', icon: '💬', desc: '常用语/情景对话/跟读', action: 'enterSpeaking' }
    ]
  },
  {
    id: 'challenge',
    label: '综合挑战',
    icon: '⚔️',
    items: [
      { id: 'adventure', name: '冒险模式', icon: '🕹️', desc: '探索英语世界', action: 'startAdventure' }
    ]
  }
];

const expandedSections = reactive({
  training: true,
  vocabulary: true,
  grammar: true,
  speaking: false,
  challenge: false
});

const toggleSection = (id) => {
  expandedSections[id] = !expandedSections[id];
};

// ====== 卡片条状 ======
const grammarStars = computed(() => {
  const progress = gameStore.grammarProgress?.towerProgress || {};
  let total = 0;
  for (const tower of grammarTowers) {
    const tp = progress[tower.id];
    if (tp) {
      total += Object.values(tp.floorStars || {}).reduce((s, v) => s + v, 0);
    }
  }
  return total;
});

const maxStars = computed(() => {
  return grammarTowers.reduce((sum, tower) => {
    return sum + (tower.floors?.length || 0) * 3;
  }, 0);
});

const grammarKeys = computed(() => gameStore.grammarProgress?.totalKeys || 0);

// ====== 知识学习统计 ======
const englishKnowledgeStore = useEnglishKnowledgeStore();

// 薄弱知识点阈值：错题占比 > 30% 视为薄弱
const WEAK_NODE_THRESHOLD = 0.3;

const weakNodeCount = computed(() => {
  const records = englishKnowledgeStore.records;
  return Object.values(records).filter(r =>
    r.totalAttempts > 0 && (r.wrongCount / r.totalAttempts) > WEAK_NODE_THRESHOLD
  ).length;
});

const dueCount = computed(() => {
  return getDueCount(englishKnowledgeStore.records);
});

const weakNodeText = computed(() => {
  return weakNodeCount.value > 0
    ? '待强化: ' + weakNodeCount.value + ' 个知识点'
    : '暂无薄弱点';
});

const dueText = computed(() => {
  return dueCount.value > 0
    ? dueCount.value + ' 个知识点待复习'
    : '暂无待复习内容';
});

// ====== 冒险模式 ======
const adventureStore = useEnglishAdventureStore();

const spiritCollectedCount = computed(() => spiritStore.collectedCount);
const spiritTotalCount = computed(() => spiritStore.totalSpirits);
const spiritProgressPercent = computed(() => {
  if (spiritTotalCount.value === 0) return 0;
  return Math.round((spiritCollectedCount.value / spiritTotalCount.value) * 100);
});
const currentRegionName = computed(() => {
  const regionId = adventureStore.currentRegion;
  if (!regionId) return '';
  const regions = getAllEnglishRegions();
  const region = regions.find(r => r.id === regionId);
  return region ? region.name : '';
});

// ====== 处理卡片点击 ======
const bestScores = computed(() => gameStore.englishSpeedSpell?.bestScores || {});

const handleItemClick = (item) => {
  // 单词速拼游戏模式（带 mode 参数）
  if (item.action === 'startSpeedSpell') {
    emit('startSpeedSpell', item.mode);
    return;
  }
  // 其他事件直接 emit
  emit(item.action);
};

const getStatusText = (item) => {
  switch (item.id) {
  case 'targetedTraining':
    return weakNodeText.value;
  case 'review':
    return dueText.value;
  case 'speedBase':
  case 'speedBlitz':
  case 'speedSurvival':
    return getBestScoreText(item.mode || item.id.replace('speed', '').toLowerCase());
  case 'grammarCastle':
    return '⭐ ' + grammarStars.value + ' / ' + maxStars.value + ' 星' + (grammarKeys.value > 0 ? ' · 🔑 ' + grammarKeys.value + ' 把钥匙' : '');
  case 'adventure':
    return getAdventureStatusText();
  default:
    return '';
  }
};

const getBestScoreText = (modeId) => {
  const score = bestScores.value[modeId];
  return score ? '最佳: ' + score.score + '分 (' + score.rating + ')' : '暂无记录';
};

const getAdventureStatusText = () => {
  return '收集进度: ' + spiritCollectedCount.value + '/' + spiritTotalCount.value;
};
</script>

<style scoped>
.english-hall {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  color: #fff;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header-left h2 {
  margin: 0;
  font-size: 1.8rem;
}

.level-info {
  margin: 0.3rem 0 0;
  font-size: 0.95rem;
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-leaderboard {
  padding: 0.5rem 1.2rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 20px;
  color: #000;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-leaderboard:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(251, 191, 36, 0.4);
}

.btn-knowledge {
  padding: 0.5rem 1.2rem;
  background: linear-gradient(135deg, #34d399, #10b981);
  border: none;
  border-radius: 20px;
  color: #fff;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-knowledge:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 211, 153, 0.4);
}

.btn-achievements {
  padding: 0.5rem 1.2rem;
  background: linear-gradient(135deg, #f472b6, #ec4899);
  border: none;
  border-radius: 20px;
  color: #fff;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-achievements:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(244, 114, 182, 0.4);
}

.btn-back {
  padding: 0.5rem 1.2rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* ========== 折叠分区 ========== */
.hall-sections {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
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
  font-size: 1.15rem;
  font-weight: 600;
}

.section-toggle {
  font-size: 0.85rem;
  opacity: 0.6;
  transition: transform 0.2s ease;
}

.section-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1.5rem 1.2rem 1.5rem;
}

/* 分割线 */
.section-divider {
  display: flex;
  align-items: center;
  margin: 0.3rem 0;
  padding: 0.2rem 0;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
}

.divider-label {
  padding: 0 0.8rem;
  font-size: 0.8rem;
  opacity: 0.5;
  white-space: nowrap;
}

/* ========== 卡片 ========== */
.hall-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1.5px solid transparent;
  min-height: 3.2rem;
}

.hall-card:hover {
  background: rgba(255, 255, 255, 0.18);
}

.card-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: 2rem;
  text-align: center;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.card-name {
  font-weight: 600;
  font-size: 1rem;
}

.card-desc {
  font-size: 0.78rem;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-status {
  font-size: 0.72rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-arrow {
  font-size: 1.2rem;
  opacity: 0.4;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .english-hall {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 0.8rem;
  }

  .header-actions {
    align-self: flex-end;
  }

  .section-items {
    padding: 0 0.8rem 0.8rem 0.8rem;
  }

  .hall-card {
    padding: 0.6rem 0.8rem;
    gap: 0.5rem;
  }

  .card-name {
    font-size: 0.9rem;
  }

  .card-desc {
    display: none;
  }
}
</style>
