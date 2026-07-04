<template>
  <div class="wordfill-answer">
    <div class="parts-container">
      <div
        v-for="(part, index) in parts"
        :key="index"
        class="part-item"
      >
        <!-- 数字输入 -->
        <div v-if="part.type === 'number'" class="part-input-wrapper">
          <input
            :ref="el => setInputRef(index, el)"
            :value="localAnswers[index] ?? ''"
            type="number"
            class="part-input part-input-number"
            :class="{ 'has-value': localAnswers[index] !== undefined && localAnswers[index] !== '' }"
            :placeholder="part.label || '输入数字...'"
            :disabled="disabled"
            step="any"
            @input="onInputChange(index, $event.target.value)"
            @keyup.enter="onEnterKey"
          />
          <span v-if="part.label" class="part-label">{{ part.label }}</span>
        </div>

        <!-- 选择输入（按钮组） -->
        <div v-else-if="part.type === 'choice'" class="part-input-wrapper">
          <div class="choice-group">
            <button
              v-for="option in part.options"
              :key="option"
              class="choice-btn"
              :class="{ selected: localAnswers[index] === option }"
              :disabled="disabled"
              @click="onChoiceSelect(index, option)"
            >
              {{ option }}
            </button>
          </div>
          <span v-if="part.label" class="part-label">{{ part.label }}</span>
        </div>

        <!-- 文本输入 -->
        <div v-else-if="part.type === 'text'" class="part-input-wrapper">
          <input
            :ref="el => setInputRef(index, el)"
            :value="localAnswers[index] ?? ''"
            type="text"
            class="part-input part-input-text"
            :class="{ 'has-value': localAnswers[index] !== undefined && localAnswers[index] !== '' }"
            :placeholder="part.label || '输入答案...'"
            :disabled="disabled"
            @input="onInputChange(index, $event.target.value)"
            @keyup.enter="onEnterKey"
          />
          <span v-if="part.label" class="part-label">{{ part.label }}</span>
        </div>
      </div>
    </div>

    <div v-if="showError" class="error-message">
      ⚠️ 请填写所有答案
    </div>

    <div v-if="showResult !== null" class="result-message" :class="showResult ? 'result-correct' : 'result-wrong'">
      {{ showResult ? '✅ 全部正确！' : '❌ 有错误，请检查' }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  parts: {
    type: Array,
    required: true
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

// 内部状态：用户填写的答案数组
const localAnswers = ref([]);
const showError = ref(false);
const showResult = ref(null); // null=未验证, true=全对, false=有错
const inputRefs = ref({});

// 同步外部 modelValue → localAnswers
watch(() => props.modelValue, (val) => {
  if (val && val.length > 0) {
    localAnswers.value = [...val];
  } else {
    localAnswers.value = new Array(props.parts.length).fill(undefined);
  }
}, { immediate: true });

// 部件数变化时重置
watch(() => props.parts.length, () => {
  localAnswers.value = new Array(props.parts.length).fill(undefined);
  showError.value = false;
  showResult.value = null;
});

/**
 * 是否为全空（所有部件均未填写）
 */
const allEmpty = computed(() => {
  return localAnswers.value.every(v => v === undefined || v === '');
});

/**
 * 是否全部已填写
 */
const allFilled = computed(() => {
  return localAnswers.value.every(v => v !== undefined && v !== '');
});

function setInputRef(index, el) {
  if (el) {
    inputRefs.value[index] = el;
  }
}

function onInputChange(index, value) {
  showError.value = false;
  showResult.value = null;
  const newVal = value === '' ? undefined : value;
  const updated = [...localAnswers.value];
  updated[index] = newVal;
  localAnswers.value = updated;
  emit('update:modelValue', [...updated]);
}

function onChoiceSelect(index, option) {
  if (props.disabled) return;
  showError.value = false;
  showResult.value = null;
  const updated = [...localAnswers.value];
  // 点击已选中的选项则取消选择
  if (updated[index] === option) {
    updated[index] = undefined;
  } else {
    updated[index] = option;
  }
  localAnswers.value = updated;
  emit('update:modelValue', [...updated]);
}

function onEnterKey() {
  // 由父组件监听 enter 事件触发提交
  // 此处不自动提交，父组件可监听 enter
}

/**
 * 聚焦到第一个未填写的输入框
 */
function focusFirstEmpty() {
  for (let i = 0; i < props.parts.length; i++) {
    const val = localAnswers.value[i];
    if (val === undefined || val === '') {
      const el = inputRefs.value[i];
      if (el) {
        el.focus();
        break;
      }
    }
  }
}

/**
 * 外部调用：验证所有答案是否正确
 * @returns {boolean} 是否全部正确
 */
function validate() {
  showResult.value = null;
  showError.value = false;

  if (!allFilled.value) {
    showError.value = true;
    focusFirstEmpty();
    return false;
  }

  const allCorrect = props.parts.every((part, index) => {
    const userAns = localAnswers.value[index];
    if (userAns === undefined || userAns === '') return false;
    if (part.type === 'number') {
      return Number(userAns) === part.answer;
    }
    // choice 和 text 类型直接字符串比较
    return String(userAns).trim() === String(part.answer).trim();
  });

  showResult.value = allCorrect;
  return allCorrect;
}

/**
 * 重置所有填写状态
 */
function reset() {
  localAnswers.value = new Array(props.parts.length).fill(undefined);
  showError.value = false;
  showResult.value = null;
}

/**
 * 暴露给父组件的方法
 */
defineExpose({
  validate,
  reset,
  allFilled,
  allEmpty,
  focusFirstEmpty
});
</script>

<style scoped>
.wordfill-answer {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.parts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.part-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.part-input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.part-input {
  padding: 0.8rem 1rem;
  font-size: 1.3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  outline: none;
  transition: border-color 0.3s;
  text-align: center;
  width: 140px;
}

.part-input:focus {
  border-color: #fbbf24;
}

.part-input.has-value {
  border-color: rgba(74, 222, 128, 0.5);
}

.part-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 隐藏 number 输入框的增量按钮 */
.part-input-number::-webkit-outer-spin-button,
.part-input-number::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.part-input-number {
  -moz-appearance: textfield;
}

.part-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
}

/* 选择按钮组 */
.choice-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.choice-btn {
  padding: 0.7rem 1.5rem;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.choice-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.choice-btn.selected {
  background: rgba(251, 191, 36, 0.3);
  border-color: #fbbf24;
  color: #fbbf24;
}

.choice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 提示消息 */
.error-message {
  text-align: center;
  color: #ef4444;
  font-size: 0.95rem;
  padding: 0.3rem;
}

.result-message {
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.result-correct {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.result-wrong {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 响应式 */
@media (max-width: 768px) {
  .part-input {
    width: 110px;
    font-size: 1.1rem;
    padding: 0.6rem 0.8rem;
  }

  .choice-btn {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
  }
}
</style>
