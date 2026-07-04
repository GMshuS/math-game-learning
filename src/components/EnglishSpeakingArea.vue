<template>
  <div class="english-speaking-area">
    <!-- 顶部标题栏 -->
    <header class="speaking-header">
      <div class="header-left">
        <h2>💬 口语专区</h2>
        <p class="level-info">Level {{ effectiveLevel }} · {{ levelTheme }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-back" @click="$emit('back')">← 返回</button>
      </div>
    </header>

    <!-- 口语专区内容 -->
    <div class="speaking-sections">
      <!-- 场景学习（默认展开） -->
      <section class="speaking-section">
        <div class="section-header" @click="toggleSection('scene')">
          <span class="section-title">🏙️ 场景学习</span>
          <div class="section-meta">
            <span class="section-count">{{ speakingTowers.length }} 个场景</span>
            <span class="section-toggle">{{ expandedSections.scene ? '▼' : '▶' }}</span>
          </div>
        </div>
        <div v-show="expandedSections.scene" class="section-content">
          <div class="tower-list">
            <div
              v-for="tower in speakingTowers"
              :key="tower.id"
              class="tower-card"
              :class="{ locked: !isTowerUnlocked(tower) }"
              @click="onTowerClick(tower)"
            >
              <div class="tower-icon">{{ tower.icon }}</div>
              <h3>{{ tower.name }}</h3>
              <p>{{ tower.description }}</p>
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
          <div v-if="speakingTowers.length === 0" class="empty-towers">
            <p>暂无场景数据</p>
          </div>
        </div>
      </section>

      <!-- 发音训练（默认折叠） -->
      <section class="speaking-section">
        <div class="section-header" @click="toggleSection('pronounce')">
          <span class="section-title">🎤 发音训练</span>
          <span class="section-toggle">{{ expandedSections.pronounce ? '▼' : '▶' }}</span>
        </div>
        <div v-show="expandedSections.pronounce" class="section-content">
          <div class="pronounce-intro">
            <p>选择跟读训练，系统会从当前等级词汇中选取句子，帮你练习发音和语调。</p>
          </div>
          <div class="pronounce-actions">
            <button class="btn-start-reading" @click="startReading">
              🎤 开始跟读训练
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { getTowerById } from '../config/english/grammar';
import { speakingTowers } from '../config/english/speaking';
import { englishGradesConfig } from '../config/english/grades';

const emit = defineEmits(['enterTower', 'startReading', 'back']);

const gameStore = useGameStore();
const settingsStore = useSettingsStore();

const effectiveLevel = computed(() => settingsStore.getEffectiveEnglishLevel);

const levelTheme = computed(() => {
  const cfg = englishGradesConfig[effectiveLevel.value];
  return cfg ? cfg.theme : '';
});

// 折叠状态
const expandedSections = reactive({
  scene: true,
  pronounce: false
});

const toggleSection = (id) => {
  expandedSections[id] = !expandedSections[id];
};

// 塔相关函数
function getTowerStars(towerId) {
  const progress = gameStore.grammarProgress?.towerProgress?.[towerId];
  if (!progress) return 0;
  return Object.values(progress.floorStars || {}).reduce(
    (sum, s) => sum + s,
    0
  );
}

function getTowerFloorCount(towerId) {
  const tower = getTowerById(towerId);
  return tower?.floors?.length || 0;
}

function getTowerMaxStars(towerId) {
  return getTowerFloorCount(towerId) * 3;
}

function getFloorStarClass(towerId, floorNum) {
  const progress = gameStore.grammarProgress?.towerProgress?.[towerId];
  const star = progress?.floorStars?.[floorNum];
  if (star && star >= 1) return 'earned';
  return 'empty';
}

function isTowerUnlocked(tower) {
  return tower.unlockLevel <= effectiveLevel.value;
}

function isTowerCleared(towerId) {
  return gameStore.grammarProgress?.towerProgress?.[towerId]?.cleared === true;
}

function onTowerClick(tower) {
  if (!isTowerUnlocked(tower)) return;
  emit('enterTower', tower.id);
}

function startReading() {
  emit('startReading');
}
</script>

<style scoped>
.english-speaking-area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  color: #fff;
  overflow-y: auto;
  background: linear-gradient(
    180deg,
    rgba(10, 40, 60, 1) 0%,
    rgba(20, 30, 60, 1) 100%
  );
}

/* ---- 标题栏 ---- */
.speaking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header-left h2 {
  margin: 0;
  font-size: 1.8rem;
  text-shadow: 0 0 12px rgba(100, 200, 255, 0.5);
  background: linear-gradient(135deg, #7dd3fc, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.level-info {
  margin: 0.3rem 0 0;
  font-size: 0.95rem;
  opacity: 0.8;
  color: #7dd3fc;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-back {
  padding: 0.5rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
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

/* ---- 折叠分区 ---- */
.speaking-sections {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.speaking-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 200, 255, 0.15);
  border-radius: 14px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.2rem;
  cursor: pointer;
  transition: background 0.2s ease;
  user-select: none;
}

.section-header:hover {
  background: rgba(100, 200, 255, 0.08);
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #7dd3fc;
}

.section-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.8rem;
}

.section-count {
  opacity: 0.5;
}

.section-toggle {
  font-size: 0.75rem;
  opacity: 0.5;
  transition: transform 0.2s ease;
}

.section-content {
  padding: 0 1.2rem 1.2rem 1.2rem;
}

/* ---- 塔卡片列表 ---- */
.tower-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.tower-card {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(56, 189, 248, 0.15),
    rgba(100, 200, 255, 0.08)
  );
  border: 2px solid rgba(56, 189, 248, 0.2);
  border-radius: 14px;
  padding: 1.2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.tower-card:hover {
  transform: translateY(-4px);
  border-color: #38bdf8;
  box-shadow: 0 8px 25px rgba(56, 189, 248, 0.25);
}

.tower-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.6);
}

.tower-card.locked:hover {
  transform: none;
  border-color: rgba(56, 189, 248, 0.2);
  box-shadow: none;
}

.tower-icon {
  font-size: 2.5rem;
  margin-bottom: 0.6rem;
}

.tower-card h3 {
  margin: 0 0 0.3rem;
  font-size: 1.05rem;
  color: #bae6fd;
}

.tower-card p {
  margin: 0 0 0.8rem;
  opacity: 0.7;
  font-size: 0.8rem;
  line-height: 1.3;
}

/* ---- 星级进度 ---- */
.floor-stars {
  display: flex;
  justify-content: center;
  gap: 2px;
  margin-bottom: 0.4rem;
}

.star-dot {
  font-size: 0.75rem;
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
  font-size: 0.8rem;
  color: #ffd700;
  font-weight: bold;
}

.cleared-badge {
  display: inline-block;
  margin-top: 0.4rem;
  padding: 0.15rem 0.5rem;
  font-size: 0.7rem;
  background: rgba(52, 211, 153, 0.2);
  border: 1px solid rgba(52, 211, 153, 0.4);
  border-radius: 8px;
  color: #34d399;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  pointer-events: none;
}

/* ---- 空状态 ---- */
.empty-towers {
  text-align: center;
  padding: 2rem 1rem;
  opacity: 0.5;
}

/* ---- 发音训练 ---- */
.pronounce-intro {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  opacity: 0.7;
  line-height: 1.5;
}

.pronounce-actions {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.btn-start-reading {
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #06b6d4, #10b981);
  border: none;
  border-radius: 30px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-start-reading:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* ---- 响应式 ---- */
@media (max-width: 768px) {
  .english-speaking-area {
    padding: 1rem;
  }

  .speaking-header {
    flex-direction: column;
    gap: 0.8rem;
  }

  .header-actions {
    align-self: flex-end;
  }

  .tower-list {
    grid-template-columns: 1fr;
  }

  .section-content {
    padding: 0 0.8rem 0.8rem 0.8rem;
  }

  .btn-start-reading {
    width: 100%;
  }
}
</style>
