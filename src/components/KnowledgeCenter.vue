<template>
  <div class="knowledge-center">
    <div class="knowledge-header">
      <button class="back-btn" @click="$emit('back')">← 返回</button>
      <h2>📚 知识中心</h2>
    </div>

    <!-- 学科 Tab 切换 -->
    <div class="subject-tabs">
      <button
        v-for="subject in subjectsList"
        :key="subject.id"
        :class="['tab', { active: currentSubject === subject.id }]"
        @click="currentSubject = subject.id"
      >
        {{ subject.icon }} {{ subject.label }}
      </button>
    </div>

    <!-- 知识点列表 -->
    <div class="nodes-grid">
      <div
        v-for="node in currentNodes"
        :key="node.id"
        class="node-card"
      >
        <span class="node-icon">{{ node.icon }}</span>
        <span class="node-label">{{ node.label }}</span>
        <span class="node-grade">年级 {{ node.gradeRange[0] }}-{{ node.gradeRange[1] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { subjects } from '../config/knowledge';

const props = defineProps({
  subject: {
    type: String,
    default: 'math'
  }
});

const emit = defineEmits(['back']);

const currentSubject = ref(props.subject);

const subjectsList = computed(() => {
  return Object.values(subjects);
});

const currentNodes = computed(() => {
  return subjects[currentSubject.value]?.nodes || [];
});
</script>

<style scoped>
.knowledge-center {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: #fff;
}
.knowledge-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
.back-btn {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}
.back-btn:hover {
  background: rgba(255,255,255,0.2);
  border-color: #fff;
}
.subject-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.tab {
  padding: 0.8rem 1.5rem;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}
.tab.active {
  background: rgba(255,255,255,0.2);
  border-color: #fff;
}
.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}
.node-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}
.node-card:hover {
  transform: translateY(-2px);
  background: rgba(255,255,255,0.2);
}
.node-icon {
  font-size: 2rem;
}
.node-label {
  font-size: 1.1rem;
  font-weight: bold;
}
.node-grade {
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
