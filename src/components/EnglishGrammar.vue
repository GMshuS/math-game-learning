<template>
  <div class="grammar-hall">
    <GameTutorial
      v-if="showTutorial"
      title="🏰 语法城堡玩法说明"
      :steps="grammarTutorialSteps"
      @close="closeTutorial"
    />

    <!-- 顶部标题栏 -->
    <header class="grammar-header">
      <div class="header-left">
        <h2>🏰 语法城堡</h2>
        <p class="level-info">Level {{ effectiveLevel }} · {{ levelTheme }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-help" @click="showTutorial = true">❓ 玩法说明</button>
        <button class="btn-back" @click="$emit('back')">← 返回</button>
      </div>
    </header>

    <p class="subtitle">选择一座语法塔开始闯关！</p>

    <!-- 总结信息 -->
    <div class="summary-bar">
      <span>⭐ 总星星: {{ totalStars }} / {{ maxStars }}</span>
      <span>🔑 语法钥匙: {{ totalKeys }} 把</span>
    </div>

    <!-- 按 category 分组折叠展示 -->
    <div class="category-sections">
      <div
        v-for="group in categoryGroups"
        :key="group.key"
        class="category-section"
      >
        <!-- 分组标题（可折叠） -->
        <div class="category-header" @click="toggleCategory(group.key)">
          <span class="category-title">{{ group.icon }} {{ group.label }}</span>
          <div class="category-meta">
            <span class="category-count">{{ group.towers.length }} 座塔</span>
            <span class="category-stars">{{ groupStars[group.key] }}⭐</span>
            <span class="category-toggle">{{ expandedCategories[group.key] ? '▼' : '▶' }}</span>
          </div>
        </div>

        <!-- 分组内塔卡片列表 -->
        <div v-show="expandedCategories[group.key]" class="tower-list">
          <div
            v-for="tower in group.towers"
            :key="tower.id"
            class="tower-card"
            :class="{ locked: !isTowerUnlocked(tower) }"
            @click="onTowerClick(tower)"
          >
            <div class="tower-icon">{{ tower.icon }}</div>
            <h3>{{ tower.name }}</h3>
            <p>{{ tower.description }}</p>
            <!-- 8层星级进度 -->
            <div class="floor-stars">
              <span
                v-for="f in getTowerFloorCount(tower.id)"
                :key="f"
                :class="['star-dot', getFloorStarClass(tower.id, f)]"
              >⭐</span>
            </div>
            <div class="tower-star-count">
              {{ getTowerStars(tower.id) }} / {{ getTowerMaxStars(tower.id) }} ⭐
            </div>
            <div v-if="isTowerCleared(tower.id)" class="cleared-badge">
              ✅ 已通关
            </div>
            <div v-if="!isTowerUnlocked(tower)" class="lock-overlay">🔒</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="grammarTowers.length === 0" class="empty-state">
      <p>暂无语法塔数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { grammarTowers, getTowerById } from '../config/english/grammar';
import { englishGradesConfig } from '../config/english/grades';
import GameTutorial from './GameTutorial.vue';

const emit = defineEmits(['enterTower', 'back']);

const showTutorial = ref(false);

const closeTutorial = () => {
  showTutorial.value = false;
};

const grammarTutorialSteps = [
  {
    title: '选择语法塔',
    description: '从大厅中选择一座语法塔，每座塔对应不同的语法知识点（如时态、词性、句型等）。'
  },
  {
    title: '塔的楼层',
    description: '每座塔有8层，每层是一个独立关卡，难度逐层递增。完成一层后才能进入下一层。'
  },
  {
    title: '解锁规则',
    description: '语法塔按英语等级逐步解锁，达到指定等级即可解锁对应塔。等级越高，可挑战的塔越多。'
  },
  {
    title: '闯关流程',
    description: '进入塔后，先观看语法规则教学 → 开始答题闯关 → 完成本层后获得星级评价。'
  },
  {
    title: '星级评价',
    description: '每层最高3星，答对率越高星越多。累积星星总数展示在大厅，是衡量学习进度的重要指标。'
  },
  {
    title: '语法钥匙',
    description: '通关整座塔（所有楼层全部完成）可获得语法钥匙（🔑），用于解锁特殊内容和成就。'
  }
];

const gameStore = useGameStore();
const settingsStore = useSettingsStore();

const effectiveLevel = computed(() => settingsStore.getEffectiveEnglishLevel);

const levelTheme = computed(() => {
  const cfg = englishGradesConfig[effectiveLevel.value];
  return cfg ? cfg.theme : '';
});

// ========== 分类定义 ==========
const categoryGroupDefs = {
  morphology: { key: 'morphology', label: '词法篇', icon: '📦' },
  tense: { key: 'tense', label: '时态篇', icon: '⏰' },
  syntax: { key: 'syntax', label: '句法篇', icon: '🔀' }
};

// 展开状态：默认全部展开
const expandedCategories = reactive({
  morphology: true,
  tense: true,
  syntax: true
});

const toggleCategory = (key) => {
  expandedCategories[key] = !expandedCategories[key];
};

// 按 category 分组
const categoryGroups = computed(() => {
  const groups = {};
  for (const tower of grammarTowers) {
    const cat = tower.category || 'morphology';
    if (!groups[cat]) {
      const def = categoryGroupDefs[cat] || { key: cat, label: cat, icon: '📁' };
      groups[cat] = { ...def, towers: [] };
    }
    groups[cat].towers.push(tower);
  }
  return Object.values(groups);
});

// 各分组的星星数
const groupStars = computed(() => {
  const stars = {};
  for (const tower of grammarTowers) {
    const cat = tower.category || 'morphology';
    if (!stars[cat]) stars[cat] = 0;
    stars[cat] += getTowerStars(tower.id);
  }
  return stars;
});

// 获取某塔的星星总数
function getTowerStars(towerId) {
  const progress = gameStore.grammarProgress?.towerProgress?.[towerId];
  if (!progress) return 0;
  return Object.values(progress.floorStars || {}).reduce(
    (sum, s) => sum + s,
    0
  );
}

// 获取塔的楼层数
function getTowerFloorCount(towerId) {
  const tower = getTowerById(towerId);
  return tower?.floors?.length || 0;
}

// 获取塔的最大星数
function getTowerMaxStars(towerId) {
  return getTowerFloorCount(towerId) * 3;
}

// 获取某层星星样式
function getFloorStarClass(towerId, floorNum) {
  const progress = gameStore.grammarProgress?.towerProgress?.[towerId];
  const star = progress?.floorStars?.[floorNum];
  if (star && star >= 1) return 'earned';
  return 'empty';
}

// 检查塔是否解锁（按英语等级 unlockLevel）
function isTowerUnlocked(tower) {
  return tower.unlockLevel <= effectiveLevel.value;
}

// 检查塔是否已通关
function isTowerCleared(towerId) {
  return gameStore.grammarProgress?.towerProgress?.[towerId]?.cleared === true;
}

// 总星星数
const totalStars = computed(() => {
  let sum = 0;
  for (const tower of grammarTowers) {
    sum += getTowerStars(tower.id);
  }
  return sum;
});

// 最大星星数（动态计算）
const maxStars = computed(() => {
  return grammarTowers.reduce((sum, tower) => {
    return sum + (tower.floors?.length || 0) * 3;
  }, 0);
});

// 语法钥匙总数
const totalKeys = computed(
  () => gameStore.grammarProgress?.totalKeys || 0
);

function onTowerClick(tower) {
  if (!isTowerUnlocked(tower)) return;
  emit('enterTower', tower.id);
}
</script>

<style scoped>
.grammar-hall {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  color: #fff;
  overflow-y: auto;
  background: linear-gradient(
    180deg,
    rgba(30, 10, 60, 1) 0%,
    rgba(20, 5, 40, 1) 100%
  );
}

/* ---- 标题栏 ---- */
.grammar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.header-left h2 {
  margin: 0;
  font-size: 1.8rem;
  text-shadow: 0 0 12px rgba(180, 120, 255, 0.5);
  background: linear-gradient(135deg, #e8c8ff, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.level-info {
  margin: 0.3rem 0 0;
  font-size: 0.95rem;
  opacity: 0.8;
  color: #c8a0ff;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-back,
.btn-help {
  padding: 0.5rem 1.2rem;
  border: 1px solid rgba(180, 120, 255, 0.3);
  border-radius: 20px;
  color: #d4b8ff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-back {
  background: rgba(255, 255, 255, 0.1);
}

.btn-help {
  background: rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.5);
}

.btn-back:hover {
  background: rgba(180, 120, 255, 0.25);
  border-color: #b078ff;
}

.btn-help:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* ---- 副标题 ---- */
.subtitle {
  margin: 0 0 1rem;
  opacity: 0.7;
  font-size: 0.95rem;
}

/* ---- 分类折叠分区 ---- */
.category-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-section {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(180, 120, 255, 0.15);
  border-radius: 14px;
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.2rem;
  cursor: pointer;
  transition: background 0.2s ease;
  user-select: none;
}

.category-header:hover {
  background: rgba(180, 120, 255, 0.08);
}

.category-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e8c8ff;
}

.category-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.8rem;
}

.category-count {
  opacity: 0.5;
}

.category-stars {
  color: #ffd700;
  font-weight: 600;
}

.category-toggle {
  font-size: 0.75rem;
  opacity: 0.5;
  transition: transform 0.2s ease;
}

/* 分组内塔卡片列表使用更紧凑的网格 */
.category-section .tower-list {
  padding: 0 1.2rem 1.2rem 1.2rem;
}

/* ---- 总结信息条 ---- */
.summary-bar {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  background: rgba(180, 120, 255, 0.1);
  border: 1px solid rgba(180, 120, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #d4b8ff;
  flex-wrap: wrap;
}

.summary-bar span {
  white-space: nowrap;
}

/* ---- 语法塔卡片列表 ---- */
.tower-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.tower-card {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(100, 50, 180, 0.25),
    rgba(180, 120, 50, 0.2)
  );
  border: 2px solid rgba(180, 120, 255, 0.25);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.tower-card:hover {
  transform: translateY(-4px);
  border-color: #b078ff;
  box-shadow: 0 8px 30px rgba(140, 80, 255, 0.3);
}

.tower-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.6);
}

.tower-card.locked:hover {
  transform: none;
  border-color: rgba(180, 120, 255, 0.25);
  box-shadow: none;
}

.tower-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.tower-card h3 {
  margin: 0 0 0.4rem;
  font-size: 1.15rem;
  color: #e8c8ff;
}

.tower-card p {
  margin: 0 0 1rem;
  opacity: 0.75;
  font-size: 0.85rem;
  line-height: 1.3;
}

/* ---- 8 层星级进度 ---- */
.floor-stars {
  display: flex;
  justify-content: center;
  gap: 2px;
  margin-bottom: 0.5rem;
}

.star-dot {
  font-size: 0.85rem;
  transition: all 0.2s;
}

.star-dot.earned {
  filter: none;
  opacity: 1;
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
}

.star-dot.empty {
  filter: grayscale(1) brightness(0.4);
  opacity: 0.4;
}

.tower-star-count {
  font-size: 0.85rem;
  color: #ffd700;
  font-weight: bold;
}

/* ---- 已通关标记 ---- */
.cleared-badge {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  background: rgba(52, 211, 153, 0.2);
  border: 1px solid rgba(52, 211, 153, 0.4);
  border-radius: 8px;
  color: #34d399;
}

/* ---- 锁定遮罩 ---- */
.lock-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 14px;
  pointer-events: none;
}

/* ---- 空状态 ---- */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  opacity: 0.5;
}

/* ---- 响应式 ---- */
@media (max-width: 768px) {
  .grammar-hall {
    padding: 1rem;
  }

  .grammar-header {
    flex-direction: column;
    gap: 0.8rem;
  }

  .header-actions {
    align-self: flex-end;
  }

  .tower-list {
    grid-template-columns: 1fr;
  }

  .summary-bar {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
