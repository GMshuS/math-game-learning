<template>
  <div class="spirit-collection">
    <GameTutorial
      v-if="showTutorial"
      title="🕹️ 精灵收集玩法说明"
      :steps="tutorialSteps"
      @close="closeTutorial"
    />
    <!-- 头部 -->
    <div class="collection-header">
      <h2>🕹️ 精灵图鉴</h2>
      <div class="collection-progress">
        <div class="progress-bar-bg">
          <div
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          />
        </div>
        <span class="progress-text">{{ collectedCount }}/{{ totalCount }}</span>
      </div>
      <button class="btn-help" @click="showTutorial = true">❓ 玩法说明</button>
      <button class="btn-back" @click="$emit('back')">← 返回</button>
    </div>

    <!-- 全收集庆祝效果 -->
    <div v-if="isAllCollected" class="collection-celebration">
      <h2>🎉 恭喜你集齐所有精灵！</h2>
      <p>英语国王精灵已被你召唤 👑</p>
    </div>

    <!-- 按区域分组展示 -->
    <div class="region-groups">
      <div
        v-for="region in regions"
        :key="region.id"
        class="region-group"
      >
        <div class="region-header">
          <span class="region-icon">{{ region.icon }}</span>
          <h3 class="region-name">{{ region.name }}</h3>
          <span class="region-progress">
            {{ getRegionCollectedCount(region.id) }}/{{ getRegionSpirits(region.id).length }}
          </span>
        </div>

        <div class="spirit-grid">
          <div
            v-for="spirit in getRegionSpirits(region.id)"
            :key="spirit.id"
            class="spirit-card"
            :class="{ collected: isCollected(spirit.id), locked: !isCollected(spirit.id) }"
          >
            <div class="spirit-icon-wrapper">
              <span class="spirit-icon">{{ isCollected(spirit.id) ? spirit.icon : '🔒' }}</span>
            </div>
            <div class="spirit-info">
              <span class="spirit-name">{{ isCollected(spirit.id) ? spirit.name : '???' }}</span>
              <span class="spirit-desc">{{ isCollected(spirit.id) ? spirit.description : spirit.unlockCondition }}</span>
            </div>
            <div v-if="isCollected(spirit.id)" class="collected-badge">✓</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空态 -->
    <div v-if="totalCount === 0" class="empty-state">
      <p>暂无精灵数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import GameTutorial from './GameTutorial.vue';
import { englishSpiritsConfig, getSpiritsByRegion } from '../config/english/spirits';
import { getAllEnglishRegions } from '../config/english/adventure';
import { useEnglishSpiritStore } from '../store/englishSpiritStore';

defineEmits(['back']);

// ============ 玩法说明 ============
const showTutorial = ref(false);
const tutorialSteps = [
  {
    title: '精灵获取方式',
    description: '精灵通过击败英语冒险世界中各区域的 BOSS 获得。每个区域都有一只专属精灵守护。'
  },
  {
    title: '区域解锁',
    description: '完成前置区域的冒险挑战后，即可解锁下一个区域。每个区域的 BOSS 战需要连续答对问题才能击败。'
  },
  {
    title: '收集进度',
    description: '在精灵图鉴中可以查看所有精灵的收集进度。已收集的精灵会显示其名称和描述，未收集的精灵会显示解锁条件。'
  },
  {
    title: '全收集奖励',
    description: '集齐所有区域的精灵后，将召唤出传说中的英语国王精灵 👑，获得特殊成就。'
  }
];
function closeTutorial() {
  showTutorial.value = false;
}

const spiritStore = useEnglishSpiritStore();

const regions = getAllEnglishRegions();

const totalCount = computed(() => englishSpiritsConfig.length);
const collectedCount = computed(() => spiritStore.collectedCount);
const isAllCollected = computed(() => spiritStore.isAllCollected);
const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((collectedCount.value / totalCount.value) * 100);
});

function getRegionSpirits(regionId) {
  const spirits = getSpiritsByRegion(regionId);
  return spirits;
}

function getRegionCollectedCount(regionId) {
  const spirits = getSpiritsByRegion(regionId);
  return spirits.filter(s => spiritStore.hasSpirit(s.id)).length;
}

function isCollected(spiritId) {
  return spiritStore.hasSpirit(spiritId);
}
</script>

<style scoped>
.spirit-collection {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  color: #fff;
  overflow-y: auto;
  background: linear-gradient(
    180deg,
    rgba(20, 10, 50, 1) 0%,
    rgba(10, 5, 30, 1) 100%
  );
}

/* ========== 头部 ========== */
.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}

.btn-back {
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
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
  white-space: nowrap;
}

.btn-help:hover {
  background: rgba(102, 126, 234, 0.5);
}

.collection-header h2 {
  margin: 0;
  font-size: 1.4rem;
  flex: 1;
  white-space: nowrap;
}

.collection-progress {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 120px;
}

.progress-bar-bg {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  overflow: hidden;
  min-width: 60px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #fbbf24;
  font-weight: bold;
  white-space: nowrap;
}

/* ========== 区域分组 ========== */
.region-groups {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 1.5rem;
}

.region-group {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1rem;
}

.region-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.region-icon {
  font-size: 1.6rem;
}

.region-name {
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
  color: #e8c8ff;
}

.region-progress {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: bold;
}

/* ========== 精灵网格 ========== */
.spirit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.8rem;
}

.spirit-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  position: relative;
  cursor: default;
}

.spirit-card.collected {
  background: linear-gradient(
    135deg,
    rgba(100, 50, 180, 0.15),
    rgba(180, 120, 50, 0.1)
  );
  border-color: rgba(180, 120, 255, 0.25);
}

.spirit-card.collected:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(100, 50, 180, 0.2);
  border-color: rgba(180, 120, 255, 0.4);
}

.spirit-card.locked {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.spirit-card.locked:hover {
  opacity: 0.8;
}

/* ========== 精灵图标 ========== */
.spirit-icon-wrapper {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  font-size: 2.2rem;
  transition: all 0.3s;
}

.spirit-card.collected .spirit-icon-wrapper {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2));
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
}

.spirit-card.locked .spirit-icon {
  filter: grayscale(1);
  opacity: 0.5;
}

/* ========== 精灵信息 ========== */
.spirit-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  text-align: center;
}

.spirit-name {
  font-size: 0.95rem;
  font-weight: bold;
  color: #fbbf24;
}

.spirit-card.locked .spirit-name {
  color: rgba(255, 255, 255, 0.4);
}

.spirit-desc {
  font-size: 0.75rem;
  opacity: 0.6;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.spirit-card.locked .spirit-desc {
  color: rgba(255, 255, 255, 0.35);
}

/* ========== 收集徽章 ========== */
.collected-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #34d399, #10b981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  color: #fff;
  animation: badgePop 0.4s ease;
}

@keyframes badgePop {
  0% { transform: scale(0); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* ========== 全收集庆祝 ========== */
.collection-celebration {
  text-align: center;
  padding: 1.5rem;
  margin: 1rem 0;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 107, 107, 0.1));
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 16px;
  animation: fadeIn 0.6s ease-out;
}

.collection-celebration h2 {
  margin: 0 0 0.5rem;
  font-size: 1.6rem;
  background: linear-gradient(135deg, #ffd700, #ff6b6b, #667eea);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradShift 3s ease-in-out infinite;
}

@keyframes gradShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.collection-celebration p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.7;
}

/* ========== 空态 ========== */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  font-size: 1.1rem;
}

/* ========== 动画 ========== */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .spirit-collection {
    padding: 1rem;
  }

  .collection-header {
    gap: 0.6rem;
  }

  .collection-header h2 {
    font-size: 1.1rem;
  }

  .spirit-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }

  .spirit-icon-wrapper {
    width: 50px;
    height: 50px;
    font-size: 1.6rem;
  }

  .spirit-name {
    font-size: 0.85rem;
  }

  .region-name {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .spirit-grid {
    grid-template-columns: 1fr;
  }
}
</style>
