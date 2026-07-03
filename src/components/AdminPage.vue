<template>
  <div class="admin-page">
    <!-- ============================== PIN 验证门 ============================== -->
    <div v-if="!isAdminAuthed" class="pin-gate">
      <div class="pin-panel">
        <h2>🔐 管理模式</h2>
        <p class="pin-desc">请输入管理员 PIN 码</p>

        <!-- 首次设置 PIN -->
        <template v-if="!hasPin">
          <h3>设置管理员 PIN</h3>
          <input
            v-model="newPin"
            type="password"
            class="pin-input"
            placeholder="输入新 PIN（4位数字）"
            maxlength="6"
            @keyup.enter="confirmFirstPin"
          >
          <input
            v-model="newPinConfirm"
            type="password"
            class="pin-input"
            placeholder="确认新 PIN"
            maxlength="6"
            @keyup.enter="confirmFirstPin"
          >
          <p v-if="pinError" class="pin-error">{{ pinError }}</p>
          <button class="btn-pin-submit" @click="confirmFirstPin">确认</button>
        </template>

        <!-- 验证 PIN -->
        <template v-else>
          <input
            v-model="pinInput"
            type="password"
            class="pin-input"
            placeholder="输入 PIN"
            maxlength="6"
            @keyup.enter="verifyPin"
          >
          <p v-if="pinError" class="pin-error">{{ pinError }}</p>
          <button class="btn-pin-submit" @click="verifyPin">验证</button>
        </template>

        <button class="btn-back" @click="$emit('back')">← 返回</button>
      </div>
    </div>

    <!-- ============================== 管理内容 ============================== -->
    <div v-else class="admin-content">
      <!-- 顶部栏 -->
      <div class="admin-header">
        <button class="btn-back" @click="$emit('back')">← 返回</button>
        <h1>🔐 管理模式</h1>
        <button class="btn-help" @click="showHelp = !showHelp">帮助</button>
      </div>

      <!-- 帮助弹窗 -->
      <div v-if="showHelp" class="help-overlay" @click="showHelp = false">
        <div class="help-panel" @click.stop>
          <h3>📖 帮助说明</h3>
          <ul>
            <li><strong>📝 错题管理</strong> — 查看各知识点答题统计，重置错题记录，调节错题反馈门槛。</li>
            <li><strong>⚖️ 权重调节</strong> — 自定义各年级各题型的出题权重，支持恢复默认值。</li>
            <li><strong>✚ 模板管理</strong> — 创建自定义题目模板，配置策略C模式开关。</li>
          </ul>
          <button class="btn-close-help" @click="showHelp = false">知道了</button>
        </div>
      </div>

      <!-- Tab 导航 -->
      <div class="admin-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="admin-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-name">{{ tab.name }}</span>
        </button>
      </div>

      <!-- Tab 内容区 -->
      <div class="admin-body">
        <!-- ========== Tab 1: 错题管理 ========== -->
        <div v-show="activeTab === 'mistakes'" class="tab-content">
          <div class="admin-section">
            <h3>📝 错题管理</h3>

            <h4 class="subject-label">数学</h4>
            <div class="stats-table">
              <div v-for="node in mathStats" :key="node.id" class="stats-row">
                <span class="stat-icon">{{ node.icon }}</span>
                <span class="stat-name">{{ node.label }}</span>
                <span class="stat-counts">
                  {{ node.totalAttempts }} 次答题 · {{ node.wrongCount }} 次错误
                </span>
                <span class="stat-accuracy" :class="accuracyClass(node.accuracy)">
                  {{ node.accuracy }}%
                </span>
                <button class="btn-reset-node" @click="resetNode('math', node.id)">重置</button>
              </div>
              <div v-if="mathStats.length === 0" class="stats-empty">暂无数据</div>
            </div>

            <h4 class="subject-label">英语</h4>
            <div class="stats-table">
              <div v-for="node in englishStats" :key="node.id" class="stats-row">
                <span class="stat-icon">{{ node.icon }}</span>
                <span class="stat-name">{{ node.label }}</span>
                <span class="stat-counts">
                  {{ node.totalAttempts }} 次答题 · {{ node.wrongCount }} 次错误
                </span>
                <span class="stat-accuracy" :class="accuracyClass(node.accuracy)">
                  {{ node.accuracy }}%
                </span>
                <button class="btn-reset-node" @click="resetNode('english', node.id)">重置</button>
              </div>
              <div v-if="englishStats.length === 0" class="stats-empty">暂无数据</div>
            </div>

            <div class="admin-subsection">
              <h4>错题反馈门槛</h4>
              <p class="setting-desc">
                某题型答题次数未达阈值前，错题反馈不生效（防止新手偶然答错导致题型权重暴涨）。
                当前：{{ minAttempts }} 次
              </p>
              <div class="min-attempts-slider">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  :value="minAttempts"
                  class="weight-slider"
                  @input="updateMinAttempts(parseInt($event.target.value))"
                >
                <span class="slider-value">{{ minAttempts }}</span>
              </div>
            </div>

            <div class="admin-actions">
              <button class="btn-reset-all" @click="resetAllKnowledge">🗑️ 重置全部知识数据</button>
            </div>
          </div>
        </div>

        <!-- ========== Tab 2: 权重调节 ========== -->
        <div v-show="activeTab === 'weights'" class="tab-content">
          <div class="admin-section">
            <h3>⚖️ 题型权重调节</h3>
            <p class="section-desc">设置各年级各题型的默认相对权重，修改后立即生效。</p>

            <div class="grade-selector">
              <label>年级：</label>
              <select v-model="weightGrade" class="grade-select">
                <option v-for="g in 6" :key="g" :value="g">{{ g }} 年级</option>
              </select>
            </div>

            <div class="weight-list">
              <div v-for="item in currentGradeWeights" :key="item.type" class="weight-row">
                <span class="weight-label">{{ item.label }}</span>
                <div class="weight-slider-group">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    :value="item.currentWeight"
                    class="weight-slider"
                    @input="updateWeight(item.type, parseInt($event.target.value))"
                  >
                  <span class="weight-value">{{ item.currentWeight }}</span>
                  <span v-if="item.isOverridden" class="weight-badge">已覆盖</span>
                </div>
              </div>
              <div v-if="currentGradeWeights.length === 0" class="stats-empty">该年级无题型配置</div>
            </div>

            <div class="weight-actions">
              <button class="btn-reset-grade" @click="resetGradeWeights">恢复该年级默认</button>
              <button class="btn-reset-all-weights" @click="resetAllWeights">恢复全部默认</button>
            </div>
          </div>
        </div>

        <!-- ========== Tab 3: 模板管理 ========== -->
        <div v-show="activeTab === 'templates'" class="tab-content">
          <div class="admin-section">
            <h3>✚ 模板管理</h3>

            <!-- 策略C 开关面板 -->
            <div class="strategy-section">
              <h4>策略C — 模式开关</h4>
              <p class="section-desc">启用后，对应玩法将可能遇到自定义模板题目</p>
              <div class="strategy-grid">
                <label
                  v-for="mode in strategyModes"
                  :key="mode.id"
                  class="strategy-checkbox"
                  :class="{ active: strategyConfig[mode.id] }"
                >
                  <input
                    type="checkbox"
                    :checked="strategyConfig[mode.id]"
                    @change="toggleStrategy(mode.id)"
                  >
                  <span>{{ mode.icon }} {{ mode.label }}</span>
                </label>
              </div>
            </div>

            <!-- 工具栏 -->
            <div class="template-toolbar">
              <input
                v-model="templateSearch"
                type="text"
                class="search-input"
                placeholder="🔍 搜索模板文本或标签..."
              >
              <select v-model="templateGradeFilter" class="grade-select filter-select">
                <option value="0">全部年级</option>
                <option v-for="g in 6" :key="g" :value="g">{{ g }} 年级</option>
              </select>
              <button class="btn-create" @click="openCreateModal">+ 新建模板</button>
            </div>

            <!-- 模板列表 -->
            <div v-if="filteredTemplates.length > 0" class="template-list">
              <div
                v-for="tpl in filteredTemplates"
                :key="tpl.id"
                class="template-card"
              >
                <div class="tpl-icon">📋</div>
                <div class="tpl-info">
                  <p class="tpl-text">{{ truncateText(tpl.template, 60) }}</p>
                  <div class="tpl-meta">
                    <span class="tpl-tag">{{ getKnowledgeLabel(tpl.knowledgeId) }}</span>
                    <span class="tpl-tag">{{ tpl.grade }} 年级</span>
                    <span class="tpl-tag">{{ difficultyLabel(tpl.difficulty) }}</span>
                    <span v-for="tag in tpl.tags" :key="tag" class="tpl-tag tag-user">{{ tag }}</span>
                  </div>
                </div>
                <div class="tpl-actions">
                  <button class="btn-tpl-edit" @click="openEditModal(tpl)">编辑</button>
                  <button class="btn-tpl-delete" @click="confirmDelete(tpl)">删除</button>
                </div>
              </div>
            </div>
            <div v-else class="stats-empty">
              {{ templateSearch || templateGradeFilter !== '0' ? '无匹配模板' : '暂无模板，点击上方按钮创建' }}
            </div>

            <!-- 新建/编辑模态 -->
            <div v-if="showTemplateModal" class="modal-overlay" @click="closeTemplateModal">
              <div class="modal-panel" @click.stop>
                <h3>{{ isEditing ? '编辑模板' : '新建模板' }}</h3>

                <div class="form-row">
                  <label>学科</label>
                  <select v-model="form.subject" class="form-input">
                    <option value="math">数学</option>
                    <option value="english">英语</option>
                  </select>
                </div>

                <div class="form-row">
                  <label>知识点</label>
                  <select v-model="form.knowledgeId" class="form-input">
                    <option
                      v-for="node in availableKnowledgeNodes"
                      :key="node.id"
                      :value="node.id"
                    >
                      {{ node.icon }} {{ node.label }}
                    </option>
                  </select>
                </div>

                <div class="form-row">
                  <label>年级</label>
                  <select v-model="form.grade" class="form-input">
                    <option v-for="g in 6" :key="g" :value="g">{{ g }} 年级</option>
                  </select>
                </div>

                <div class="form-row">
                  <label>难度</label>
                  <select v-model="form.difficulty" class="form-input">
                    <option value="easy">简单</option>
                    <option value="normal">普通</option>
                    <option value="hard">困难</option>
                  </select>
                </div>

                <div class="form-row">
                  <label>标签</label>
                  <input
                    v-model="form.tagsInput"
                    type="text"
                    class="form-input"
                    placeholder="逗号分隔，如：应用题, 加法"
                  >
                </div>

                <div class="form-row">
                  <label>题目模板文本</label>
                  <textarea
                    v-model="form.template"
                    class="form-textarea"
                    rows="3"
                    placeholder="使用 {paramName} 作为占位符，如：小明有{a}个苹果..."
                  />
                </div>

                <div class="form-row">
                  <label>答案公式</label>
                  <input
                    v-model="form.answerFormula"
                    type="text"
                    class="form-input"
                    placeholder="如：a + b"
                  >
                </div>

                <!-- 参数列表 -->
                <div class="form-row">
                  <label>参数</label>
                  <div class="params-list">
                    <div v-for="(param, idx) in form.params" :key="idx" class="param-row">
                      <input
                        v-model="param.name"
                        type="text"
                        class="param-input param-name"
                        placeholder="名称"
                      >
                      <select v-model="param.type" class="param-input param-type">
                        <option value="int">整数</option>
                        <option value="float">小数</option>
                      </select>
                      <input
                        v-model.number="param.range[0]"
                        type="number"
                        class="param-input param-range"
                        placeholder="最小值"
                      >
                      <span class="param-sep">~</span>
                      <input
                        v-model.number="param.range[1]"
                        type="number"
                        class="param-input param-range"
                        placeholder="最大值"
                      >
                      <input
                        v-model="param.constraint"
                        type="text"
                        class="param-input param-constraint"
                        placeholder="约束（可选）"
                      >
                      <button class="btn-param-remove" @click="removeParam(idx)">×</button>
                    </div>
                  </div>
                  <button class="btn-add-param" @click="addParam">+ 添加参数</button>
                </div>

                <div class="form-actions">
                  <button class="btn-test-gen" :disabled="isGenerating" @click="testGenerate">
                    {{ isGenerating ? '生成中...' : '测试生成' }}
                  </button>
                  <button class="btn-cancel" @click="closeTemplateModal">✕ 取消</button>
                  <button class="btn-save" @click="saveTemplate">✓ 保存</button>
                </div>

                <!-- 测试生成结果 -->
                <div v-if="testResults.length > 0" class="test-results">
                  <h4>测试生成结果</h4>
                  <div v-for="(item, idx) in testResults" :key="idx" class="test-item">
                    <span class="test-q">{{ item.question }}</span>
                    <span class="test-a">答案：{{ item.answer }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 删除确认 -->
            <div v-if="deleteTarget" class="modal-overlay" @click="deleteTarget = null">
              <div class="confirm-dialog" @click.stop>
                <h3>确认删除</h3>
                <p>确定要删除模板「{{ truncateText(deleteTarget.template, 40) }}」吗？</p>
                <div class="confirm-actions">
                  <button class="btn-cancel" @click="deleteTarget = null">取消</button>
                  <button class="btn-danger" @click="doDelete">确认删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMathKnowledgeStore } from '../store/mathKnowledgeStore';
import { useEnglishKnowledgeStore } from '../store/englishKnowledgeStore';
import { useCustomTemplateStore } from '../store/customTemplateStore';
import { mathKnowledgeNodes, englishKnowledgeNodes } from '../config/knowledge';
import { gradeQuestionWeights } from '../config/gradeQuestionWeights';
import storageManager, { STORAGE_KEYS } from '../utils/storage';
import { loadKnowledgeConfig } from '../config/knowledgeWeights';
import { generateFromTemplate } from '../utils/customTemplateGenerator';

defineEmits(['back']);

// ============================================================
//  PIN 验证
// ============================================================
const PIN_KEY = STORAGE_KEYS.ADMIN_PIN;
const DEFAULT_PIN = '0000';

const isAdminAuthed = ref(false);
const hasPin = ref(false);
const pinInput = ref('');
const newPin = ref('');
const newPinConfirm = ref('');
const pinError = ref('');

onMounted(() => {
  // 检查是否有 PIN
  hasPin.value = localStorage.getItem(PIN_KEY) !== null;
});

function verifyPin() {
  const storedPin = localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  if (pinInput.value === storedPin) {
    isAdminAuthed.value = true;
    pinError.value = '';
    pinInput.value = '';
  } else {
    pinError.value = 'PIN 错误，请重试';
  }
}

function confirmFirstPin() {
  if (!newPin.value || newPin.value.length < 4) {
    pinError.value = 'PIN 至少 4 位';
    return;
  }
  if (newPin.value !== newPinConfirm.value) {
    pinError.value = '两次输入的 PIN 不一致';
    return;
  }
  try {
    localStorage.setItem(PIN_KEY, newPin.value);
    isAdminAuthed.value = true;
    hasPin.value = true;
    pinError.value = '';
  } catch (e) {
    pinError.value = 'PIN 保存失败';
  }
}

// ============================================================
//  Tab 系统
// ============================================================
const activeTab = ref('mistakes');
const showHelp = ref(false);

const tabs = [
  { id: 'mistakes', name: '错题管理', icon: '📝' },
  { id: 'weights', name: '权重调节', icon: '⚖️' },
  { id: 'templates', name: '模板管理', icon: '✚' }
];

// ============================================================
//  错题管理（从 AdminPanel.vue 搬入）
// ============================================================
const mathKnowledgeStore = useMathKnowledgeStore();
const englishKnowledgeStore = useEnglishKnowledgeStore();

const minAttempts = ref(loadKnowledgeConfig().minAttempts || 3);

function buildNodeStats(nodes, records) {
  return nodes.map(node => {
    const rec = records[node.id];
    const totalAttempts = rec?.totalAttempts || 0;
    const wrongCount = rec?.wrongCount || 0;
    const accuracy = totalAttempts > 0 ? Math.round((1 - wrongCount / totalAttempts) * 100) : 0;
    return { ...node, totalAttempts, wrongCount, accuracy };
  }).filter(n => n.totalAttempts > 0);
}

const mathStats = computed(() => buildNodeStats(mathKnowledgeNodes, mathKnowledgeStore.records));
const englishStats = computed(() => buildNodeStats(englishKnowledgeNodes, englishKnowledgeStore.records));

function accuracyClass(accuracy) {
  if (accuracy >= 80) return 'acc-high';
  if (accuracy >= 50) return 'acc-mid';
  return 'acc-low';
}

function resetNode(subject, nodeId) {
  if (!confirm(`确定要重置该知识点的全部记录吗？`)) return;
  const store = subject === 'math' ? mathKnowledgeStore : englishKnowledgeStore;
  if (store.records[nodeId]) {
    store.$patch((state) => {
      const newRecords = { ...state.records };
      delete newRecords[nodeId];
      state.records = newRecords;
    });
    try {
      const key = subject === 'math' ? STORAGE_KEYS.MATH_KNOWLEDGE : STORAGE_KEYS.ENGLISH_KNOWLEDGE;
      storageManager._safeSetItem(key, JSON.stringify(store.records));
    } catch (e) {
      console.warn('保存知识记录失败:', e.message);
    }
  }
}

function resetAllKnowledge() {
  if (!confirm('确定要重置全部知识记录吗？此操作不可撤销！')) return;
  mathKnowledgeStore.reset();
  englishKnowledgeStore.reset();
}

function updateMinAttempts(value) {
  minAttempts.value = value;
  try {
    const config = loadKnowledgeConfig();
    config.minAttempts = value;
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.warn('保存知识配置失败:', e.message);
  }
}

// ============================================================
//  权重调节（从 AdminPanel.vue 搬入 + custom 行）
// ============================================================
const weightGrade = ref(1);
const weightOverrides = ref(loadOverrides());

function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_OVERRIDES);
    return raw ? JSON.parse(raw) : { grades: {}, globalSettings: {} };
  } catch {
    return { grades: {}, globalSettings: {} };
  }
}

function saveOverrides() {
  try {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_OVERRIDES, JSON.stringify(weightOverrides.value));
  } catch (e) {
    console.warn('保存权重覆盖失败:', e.message);
  }
}

const customTemplateStore = useCustomTemplateStore();

const currentGradeWeights = computed(() => {
  const grade = weightGrade.value;
  const defaults = gradeQuestionWeights[grade] || {};
  const overrides = weightOverrides.value.grades?.[grade] || {};

  const typeLabels = {};
  for (const node of mathKnowledgeNodes) {
    typeLabels[node.id] = node.label;
  }

  const items = Object.entries(defaults).map(([type, defaultWeight]) => {
    const isOverridden = overrides[type] !== undefined;
    return {
      type,
      label: typeLabels[type] || type,
      defaultWeight,
      currentWeight: isOverridden ? overrides[type] : defaultWeight,
      isOverridden
    };
  });

  // 当该年级有自定义模板时，追加 custom 行
  const hasCustomTemplates = customTemplateStore.templates.some(t => t.grade === grade && t.subject === 'math');
  if (hasCustomTemplates) {
    const isCustomOverridden = overrides['custom'] !== undefined;
    items.push({
      type: 'custom',
      label: '自定义模板',
      defaultWeight: 15,
      currentWeight: isCustomOverridden ? overrides['custom'] : 15,
      isOverridden: isCustomOverridden
    });
  }

  return items;
});

function updateWeight(type, value) {
  const grade = weightGrade.value;
  if (!weightOverrides.value.grades[grade]) {
    weightOverrides.value.grades[grade] = {};
  }
  weightOverrides.value.grades[grade][type] = value;
  saveOverrides();
}

function resetGradeWeights() {
  if (!confirm(`确定恢复 ${weightGrade.value} 年级的权重为默认值吗？`)) return;
  if (weightOverrides.value.grades[weightGrade.value]) {
    delete weightOverrides.value.grades[weightGrade.value];
    saveOverrides();
  }
}

function resetAllWeights() {
  if (!confirm('确定恢复全部年级的权重为默认值吗？')) return;
  weightOverrides.value = { grades: {}, globalSettings: {} };
  saveOverrides();
}

// ============================================================
//  模板管理
// ============================================================
const templateSearch = ref('');
const templateGradeFilter = ref('0');

const strategyModes = [
  { id: 'targetedTraining', label: '针对性训练', icon: '🎯' },
  { id: 'review', label: '复习模式', icon: '📖' },
  { id: 'speedChallenge', label: '速算竞技场', icon: '⚡' },
  { id: 'cardBattle', label: '卡牌对战', icon: '🃏' },
  { id: 'shop', label: '经营商店', icon: '🏪' },
  { id: 'cashier', label: '收银台', icon: '💰' }
];

const strategyConfig = computed(() => customTemplateStore.strategyConfig);

function toggleStrategy(modeId) {
  customTemplateStore.updateStrategyConfig({ [modeId]: !strategyConfig.value[modeId] });
}

const filteredTemplates = computed(() => {
  let list = customTemplateStore.templates;
  const search = templateSearch.value.trim().toLowerCase();
  const gradeFilter = parseInt(templateGradeFilter.value);

  if (search) {
    list = list.filter(t =>
      t.template.toLowerCase().includes(search) ||
      t.tags?.some(tag => tag.toLowerCase().includes(search))
    );
  }

  if (gradeFilter > 0) {
    list = list.filter(t => t.grade === gradeFilter);
  }

  return list;
});

function getKnowledgeLabel(id) {
  const node = mathKnowledgeNodes.find(n => n.id === id);
  return node ? node.label : id;
}

function difficultyLabel(diff) {
  const map = { easy: '简单', normal: '普通', hard: '困难' };
  return map[diff] || diff;
}

function truncateText(text, maxLen) {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
}

// ---- 表单状态 ----
const showTemplateModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const defaultForm = {
  subject: 'math',
  knowledgeId: 'add',
  grade: 2,
  difficulty: 'easy',
  tagsInput: '',
  template: '',
  answerFormula: '',
  params: []
};

const form = ref({ ...defaultForm });

const availableKnowledgeNodes = computed(() => {
  const nodes = form.value.subject === 'english' ? englishKnowledgeNodes : mathKnowledgeNodes;
  return nodes.filter(n => n.id !== 'custom');
});

function openCreateModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = { ...defaultForm, params: [] };
  testResults.value = [];
  showTemplateModal.value = true;
}

function openEditModal(tpl) {
  isEditing.value = true;
  editingId.value = tpl.id;
  form.value = {
    subject: tpl.subject,
    knowledgeId: tpl.knowledgeId,
    grade: tpl.grade,
    difficulty: tpl.difficulty,
    tagsInput: (tpl.tags || []).join(', '),
    template: tpl.template,
    answerFormula: tpl.answerFormula,
    params: JSON.parse(JSON.stringify(tpl.params || []))
  };
  testResults.value = [];
  showTemplateModal.value = true;
}

function closeTemplateModal() {
  showTemplateModal.value = false;
  editingId.value = null;
  testResults.value = [];
}

function addParam() {
  form.value.params.push({
    name: '',
    type: 'int',
    range: [1, 10],
    constraint: ''
  });
}

function removeParam(idx) {
  form.value.params.splice(idx, 1);
}

function saveTemplate() {
  if (!form.value.template.trim()) {
    alert('请输入题目模板文本');
    return;
  }
  if (!form.value.answerFormula.trim()) {
    alert('请输入答案公式');
    return;
  }

  const tags = form.value.tagsInput
    ? form.value.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const data = {
    subject: form.value.subject,
    knowledgeId: form.value.knowledgeId,
    grade: form.value.grade,
    difficulty: form.value.difficulty,
    tags,
    template: form.value.template.trim(),
    answerFormula: form.value.answerFormula.trim(),
    params: form.value.params.filter(p => p.name.trim())
  };

  if (isEditing.value && editingId.value) {
    customTemplateStore.updateTemplate(editingId.value, data);
  } else {
    customTemplateStore.addTemplate(data);
  }

  closeTemplateModal();
}

// ---- 删除 ----
const deleteTarget = ref(null);

function confirmDelete(tpl) {
  deleteTarget.value = tpl;
}

function doDelete() {
  if (deleteTarget.value) {
    customTemplateStore.deleteTemplate(deleteTarget.value.id);
    deleteTarget.value = null;
  }
}

// ---- 测试生成 ----
const testResults = ref([]);
const isGenerating = ref(false);

async function testGenerate() {
  if (form.value.params.length === 0) {
    alert('请至少添加一个参数');
    return;
  }

  isGenerating.value = true;
  testResults.value = [];

  // 从表单构建模板对象（不写入 store）
  const template = {
    template: form.value.template,
    params: form.value.params.map(p => ({
      name: p.name,
      type: p.type || 'int',
      range: p.range,
      constraint: p.constraint || ''
    })),
    answerFormula: form.value.answerFormula,
    knowledgeId: form.value.knowledgeId,
    grade: form.value.grade,
    difficulty: form.value.difficulty
  };

  // 模拟 5 条生成（直接通过 generateFromTemplate，不经过 store）
  const results = [];
  for (let i = 0; i < 5; i++) {
    try {
      const result = generateFromTemplate(template);
      if (result) {
        results.push(result);
      }
    } catch (e) {
      console.warn('测试生成失败:', e.message);
    }
  }

  testResults.value = results;
  isGenerating.value = false;
}
</script>

<style scoped>
/* ===== 全局布局 ===== */
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e);
  color: #fff;
  font-size: 14px;
}

/* ===== PIN 验证门 ===== */
.pin-gate {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.pin-panel {
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.pin-panel h2 {
  margin: 0 0 0.5rem 0;
  color: #fbbf24;
}

.pin-desc {
  font-size: 0.9rem;
  opacity: 0.7;
  margin: 0 0 1.5rem 0;
}

.pin-panel h3 {
  color: #a78bfa;
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.pin-input {
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 0.8rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1.2rem;
  text-align: center;
  letter-spacing: 0.3rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s;
}

.pin-input:focus {
  border-color: #667eea;
}

.pin-error {
  color: #ef4444;
  font-size: 0.85rem;
  margin: 0 0 0.8rem 0;
}

.btn-pin-submit {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 0.8rem;
}

.btn-pin-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* ===== 管理内容区 ===== */
.admin-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

/* ===== 顶部栏 ===== */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-header h1 {
  margin: 0;
  font-size: 1.2rem;
  color: #fbbf24;
}

.btn-back {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-help {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.15);
  color: #a78bfa;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-help:hover {
  background: rgba(102, 126, 234, 0.3);
}

/* ===== Tab 导航 ===== */
.admin-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
}

.admin-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  white-space: nowrap;
}

.admin-tab.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.admin-tab:hover:not(.active) {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

.tab-icon {
  font-size: 1.2rem;
}

/* ===== 主体内容 ===== */
.admin-body {
  padding: 1rem 0;
}

.tab-content {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 通用 Section ===== */
.admin-section {
  margin-bottom: 2rem;
}

.admin-section h3 {
  margin: 0 0 1rem 0;
  color: #fbbf24;
  font-size: 1.1rem;
}

.section-desc {
  font-size: 0.85rem;
  opacity: 0.6;
  margin: -0.5rem 0 1rem 0;
}

.subject-label {
  margin: 0.8rem 0 0.5rem 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
}

/* ===== 错题统计 ===== */
.stats-table {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 0.9rem;
}

.stat-icon {
  font-size: 1.2rem;
  width: 1.5rem;
  text-align: center;
}

.stat-name {
  font-weight: bold;
  min-width: 3rem;
}

.stat-counts {
  flex: 1;
  font-size: 0.8rem;
  opacity: 0.7;
}

.stat-accuracy {
  font-weight: bold;
  min-width: 3rem;
  text-align: right;
}

.acc-high { color: #4ade80; }
.acc-mid { color: #f59e0b; }
.acc-low { color: #ef4444; }

.stats-empty {
  text-align: center;
  padding: 1rem;
  opacity: 0.5;
  font-size: 0.9rem;
}

.btn-reset-node {
  padding: 0.3rem 0.6rem;
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.btn-reset-node:hover {
  background: rgba(239, 68, 68, 0.25);
}

.admin-actions {
  margin-top: 1rem;
}

.btn-reset-all {
  width: 100%;
  padding: 0.7rem;
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.btn-reset-all:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* 错题反馈门槛 */
.admin-subsection {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.setting-desc {
  font-size: 13px;
  color: #999;
  margin: 5px 0 10px;
}

.min-attempts-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-value {
  font-size: 16px;
  font-weight: bold;
  min-width: 24px;
}

/* ===== 权重调节 ===== */
.grade-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.grade-select {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
}

.grade-select:focus {
  outline: none;
  border-color: #667eea;
}

.grade-select option {
  color: #fff;
  background: #1a1a2e;
}

.weight-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.weight-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.weight-label {
  min-width: 4rem;
  font-weight: bold;
  font-size: 0.9rem;
}

.weight-slider-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.weight-slider {
  flex: 1;
  height: 6px;
  appearance: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  outline: none;
}

.weight-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  cursor: pointer;
}

.weight-value {
  min-width: 2rem;
  text-align: center;
  font-weight: bold;
  font-size: 0.95rem;
  color: #fbbf24;
}

.weight-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.weight-actions {
  display: flex;
  gap: 0.8rem;
}

.btn-reset-grade,
.btn-reset-all-weights {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-reset-grade:hover,
.btn-reset-all-weights:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* ===== 模板管理 — 策略C ===== */
.strategy-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.strategy-section h4 {
  margin: 0 0 0.3rem 0;
  color: #a78bfa;
}

.strategy-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.8rem;
}

.strategy-checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
  font-size: 0.85rem;
}

.strategy-checkbox.active {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
  color: #a78bfa;
}

.strategy-checkbox input {
  display: none;
}

.strategy-checkbox:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* ===== 模板工具栏 ===== */
.template-toolbar {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 180px;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #667eea;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.filter-select {
  min-width: 100px;
}

.btn-create {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-create:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
}

/* ===== 模板卡片列表 ===== */
.template-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.template-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s;
}

.template-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.tpl-icon {
  font-size: 1.5rem;
  width: 2rem;
  text-align: center;
  flex-shrink: 0;
}

.tpl-info {
  flex: 1;
  min-width: 0;
}

.tpl-text {
  margin: 0 0 0.3rem 0;
  font-size: 0.9rem;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tpl-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tpl-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: rgba(102, 126, 234, 0.15);
  color: #a78bfa;
}

.tpl-tag.tag-user {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.tpl-actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.btn-tpl-edit {
  padding: 0.3rem 0.6rem;
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 6px;
  background: rgba(102, 126, 234, 0.1);
  color: #a78bfa;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.btn-tpl-edit:hover {
  background: rgba(102, 126, 234, 0.25);
}

.btn-tpl-delete {
  padding: 0.3rem 0.6rem;
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.btn-tpl-delete:hover {
  background: rgba(239, 68, 68, 0.25);
}

/* ===== 模态弹窗 ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  padding: 1rem;
}

.modal-panel {
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-panel h3 {
  margin: 0 0 1.2rem 0;
  color: #fbbf24;
  font-size: 1.1rem;
}

/* 表单 */
.form-row {
  margin-bottom: 1rem;
}

.form-row label {
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.3rem;
}

.form-input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #667eea;
}

.form-input option {
  color: #fff;
  background: #1a1a2e;
}

.form-textarea {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-textarea:focus {
  border-color: #667eea;
}

/* 参数行 */
.params-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.param-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.param-input {
  padding: 0.4rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 0.8rem;
  outline: none;
  transition: border-color 0.3s;
}

.param-input:focus {
  border-color: #667eea;
}

.param-name {
  width: 60px;
}

.param-type {
  width: 60px;
}

.param-range {
  width: 60px;
  -moz-appearance: textfield;
}

.param-range::-webkit-outer-spin-button,
.param-range::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.param-sep {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
}

.param-constraint {
  flex: 1;
  min-width: 80px;
}

.btn-param-remove {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-param-remove:hover {
  background: rgba(239, 68, 68, 0.25);
}

.btn-add-param {
  padding: 0.4rem 0.8rem;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.btn-add-param:hover {
  border-color: #667eea;
  color: #a78bfa;
}

/* 表单按钮 */
.form-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1.2rem;
}

.btn-test-gen {
  padding: 0.6rem 1rem;
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.15);
  color: #a78bfa;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-test-gen:hover {
  background: rgba(102, 126, 234, 0.3);
}

.btn-test-gen:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-save {
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 测试结果 */
.test-results {
  margin-top: 1.2rem;
  padding: 1rem;
  background: rgba(74, 222, 128, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(74, 222, 128, 0.15);
}

.test-results h4 {
  margin: 0 0 0.8rem 0;
  color: #4ade80;
  font-size: 0.9rem;
}

.test-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.85rem;
  gap: 1rem;
}

.test-item:last-child {
  border-bottom: none;
}

.test-q {
  flex: 1;
  color: #e2e8f0;
}

.test-a {
  font-weight: bold;
  color: #fbbf24;
  white-space: nowrap;
}

/* 确认对话框 */
.confirm-dialog {
  width: 100%;
  max-width: 380px;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.confirm-dialog h3 {
  margin: 0 0 0.8rem 0;
  color: #ef4444;
}

.confirm-dialog p {
  margin: 0 0 1.2rem 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.confirm-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
}

.btn-danger {
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* ===== 帮助弹窗 ===== */
.help-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(2px);
  padding: 1rem;
}

.help-panel {
  width: 100%;
  max-width: 480px;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.help-panel h3 {
  margin: 0 0 1rem 0;
  color: #fbbf24;
}

.help-panel ul {
  margin: 0 0 1rem 0;
  padding-left: 1.2rem;
}

.help-panel li {
  margin-bottom: 0.6rem;
  font-size: 0.85rem;
  line-height: 1.5;
  opacity: 0.85;
}

.btn-close-help {
  width: 100%;
  padding: 0.6rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-close-help:hover {
  transform: translateY(-1px);
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .admin-content {
    padding: 0.6rem;
  }

  .admin-header h1 {
    font-size: 1rem;
  }

  .admin-tabs {
    gap: 0.3rem;
  }

  .admin-tab {
    padding: 0.5rem 0.6rem;
    font-size: 0.8rem;
  }

  .tab-icon {
    font-size: 1rem;
  }

  .tab-name {
    font-size: 0.75rem;
  }

  .stats-row {
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .stat-counts {
    width: 100%;
    order: 10;
  }

  .weight-row {
    flex-wrap: wrap;
  }

  .template-toolbar {
    flex-direction: column;
  }

  .search-input {
    min-width: auto;
  }

  .modal-panel {
    padding: 1rem;
    max-height: 90vh;
  }

  .param-row {
    gap: 0.3rem;
  }

  .param-name,
  .param-type,
  .param-range {
    width: 50px;
  }

  .form-actions {
    flex-wrap: wrap;
  }

  .test-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  .strategy-grid {
    gap: 0.4rem;
  }

  .strategy-checkbox {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }

  .weight-actions {
    flex-direction: column;
  }

  .tpl-actions {
    flex-direction: column;
    gap: 0.3rem;
  }

  .tpl-meta {
    gap: 0.2rem;
  }
}
</style>
