<template>
  <div class="level-info-overlay" @click="close">
    <div class="level-info-panel" @click.stop>
      <div class="panel-header">
        <h2>{{ title }}</h2>
        <button class="btn-close" @click="close">×</button>
      </div>

      <div class="panel-body">
        <!-- mode: 'flat' — 数学冒险的平铺列表 -->
        <template v-if="mode === 'flat'">
          <div
            v-for="item in items"
            :key="item.number ?? item.title"
            class="level-row"
            :class="{ completed: item.completed, locked: item.locked }"
          >
            <div class="level-num" :style="{ backgroundColor: item.locked ? '#444' : accentColor }">
              {{ item.number }}
            </div>
            <div class="level-info">
              <div class="level-row-title">{{ item.title }}</div>
              <div v-if="item.description" class="level-row-desc">{{ item.description }}</div>
            </div>
            <!-- 星级显示 -->
            <div v-if="item.stars" class="level-stars">
              <span v-for="s in 3" :key="s">{{ s <= item.stars ? '⭐' : '☆' }}</span>
            </div>
          </div>
        </template>

        <!-- mode: 'grouped' — 英语冒险的塔楼层分组 -->
        <template v-else>
          <div
            v-for="(group, gi) in items"
            :key="gi"
            class="tower-group"
          >
            <div class="tower-group-header">
              <span class="tower-group-title">{{ group.groupTitle }}</span>
              <span v-if="group.groupDesc" class="tower-group-desc">{{ group.groupDesc }}</span>
            </div>
            <div class="tower-floors">
              <div
                v-for="floor in group.floors"
                :key="floor.number ?? floor.title"
                class="floor-row"
              >
                <div class="floor-num">{{ floor.number }}</div>
                <div class="floor-info">
                  <span class="floor-title">{{ floor.title }}</span>
                  <span class="floor-desc">{{ floor.description }}</span>
                </div>
                <span class="floor-type-badge">{{ typeLabel(floor.type) }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="panel-footer">
        <button class="btn-close-panel" @click="close">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '关卡说明' },
  items: { type: Array, default: () => [] },
  accentColor: { type: String, default: '#667eea' },
  mode: { type: String, default: 'flat' } // 'flat' | 'grouped'
});

const emit = defineEmits(['close']);
const close = () => emit('close');

function typeLabel(type) {
  const labels = {
    choice: '选择',
    fillBlank: '填空',
    dragOrder: '排序',
    bossFight: 'BOSS',
    match: '配对',
    categorize: '分类',
    transform: '转换',
    verbTable: '变形表',
    connector: '连接',
    dialogueChoice: '对话',
    imageChoice: '看图'
  };
  return labels[type] || type || '';
}
</script>

<style scoped>
/* 全屏遮罩 */
.level-info-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 面板容器 */
.level-info-panel {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  width: 90%;
  max-width: 520px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 头部 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
}

.btn-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.8rem;
  cursor: pointer;
  opacity: 0.7;
  padding: 0;
  line-height: 1;
}

.btn-close:hover { opacity: 1; }

/* 内容区 */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

/* ===== Flat 模式（数学冒险） ===== */
.level-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.4rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  transition: background 0.2s;
}

.level-row:hover { background: rgba(255, 255, 255, 0.08); }
.level-row.locked { opacity: 0.4; }

.level-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  color: #fff;
  flex-shrink: 0;
}

.level-info { flex: 1; }

.level-row-title {
  color: #fff;
  font-size: 0.95rem;
  font-weight: bold;
}

.level-row-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.level-stars {
  display: flex;
  gap: 1px;
  font-size: 0.75rem;
  flex-shrink: 0;
}

/* ===== Grouped 模式（英语冒险） ===== */
.tower-group {
  margin-bottom: 1rem;
}

.tower-group-header {
  padding: 0.6rem 0.8rem;
  background: rgba(124, 58, 237, 0.15);
  border-radius: 10px;
  margin-bottom: 0.5rem;
  border-left: 3px solid #7c3aed;
}

.tower-group-title {
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  display: block;
}

.tower-group-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  display: block;
  margin-top: 0.2rem;
}

.tower-floors {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.floor-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.floor-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #fff;
  flex-shrink: 0;
}

.floor-info { flex: 1; }

.floor-title {
  color: #fff;
  font-size: 0.85rem;
  display: block;
}

.floor-desc {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  display: block;
}

.floor-type-badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.2);
  color: #a78bfa;
  flex-shrink: 0;
}

/* 底部 */
.panel-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}

.btn-close-panel {
  padding: 0.6rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-close-panel:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
