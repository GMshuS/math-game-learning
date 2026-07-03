<template>
  <div class="question-renderer">
    <!-- ====== choice: 按钮网格 (4选1) ====== -->
    <template v-if="question.type === 'choice'">
      <p class="q-text">{{ question.question }}</p>
      <div class="q-options">
        <button
          v-for="(opt, idx) in question.options"
          :key="idx"
          class="q-option"
          :class="{ selected: selectedAnswer === opt }"
          :disabled="disabled"
          @click="selectChoice(opt)"
        >
          {{ opt }}
        </button>
      </div>
    </template>

    <!-- ====== fillBlank: 输入框 + 提交按钮 ====== -->
    <template v-if="question.type === 'fillBlank'">
      <p class="q-text">{{ question.question }}</p>
      <div class="fill-blank-area">
        <input
          ref="fillInputRef"
          v-model="inputValue"
          class="fill-input"
          type="text"
          :placeholder="fillPlaceholder"
          :disabled="disabled"
          @keyup.enter="submitFill"
        />
        <button
          class="btn-submit"
          :disabled="disabled || !inputValue.trim()"
          @click="submitFill"
        >
          确认
        </button>
      </div>
    </template>

    <!-- ====== dragOrder: 可点击交换/上下箭头的词块排列 ====== -->
    <template v-if="question.type === 'dragOrder'">
      <p class="q-text">{{ question.question || question.sentence }}</p>
      <div class="drag-order-area">
        <div class="word-blocks">
          <div
            v-for="(word, idx) in wordOrder"
            :key="idx"
            class="word-block"
            :class="{ selected: selectedWordIndex === idx }"
            @click="selectWord(idx)"
          >
            <span class="word-text">{{ word }}</span>
            <div class="word-arrows">
              <button
                class="arrow-btn"
                :disabled="disabled || idx === 0"
                @click.stop="moveWord(idx, -1)"
              >
                ▲
              </button>
              <button
                class="arrow-btn"
                :disabled="disabled || idx === wordOrder.length - 1"
                @click.stop="moveWord(idx, 1)"
              >
                ▼
              </button>
            </div>
          </div>
        </div>
        <p class="drag-hint">点击词块选中，再点击另一词块交换位置；也可使用 ▲▼ 箭头移动</p>
        <button
          class="btn-submit"
          :disabled="disabled"
          @click="submitOrder"
        >
          确认顺序
        </button>
      </div>
    </template>

    <!-- ====== bossFight: 改错选择 ====== -->
    <template v-if="question.type === 'bossFight'">
      <div class="boss-fight-area">
        <div class="wrong-sentence-box">
          <p class="ws-label">❌ 找出并修正错误：</p>
          <p class="ws-text">{{ question.wrongSentence }}</p>
        </div>
        <p class="q-text">{{ question.question || '请选择正确的修改：' }}</p>
        <div class="q-options">
          <button
            v-for="(opt, idx) in question.options"
            :key="idx"
            class="q-option"
            :class="{ selected: selectedAnswer === opt }"
            :disabled="disabled"
            @click="selectChoice(opt)"
          >
            {{ opt }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['answer']);

// ====== choice / bossFight 共享状态 ======
const selectedAnswer = ref(null);

// ====== fillBlank 状态 ======
const inputValue = ref('');
const fillInputRef = ref(null);

const fillPlaceholder = computed(() => {
  return '请输入答案...';
});

// ====== dragOrder 状态 ======
const wordOrder = ref([]);
const selectedWordIndex = ref(-1);

// 初始化 / 响应题目变化
watch(() => props.question, () => {
  resetState();
}, { immediate: true });

function resetState() {
  selectedAnswer.value = null;
  inputValue.value = '';
  selectedWordIndex.value = -1;

  if (props.question && props.question.type === 'dragOrder') {
    const words = props.question.words || props.question.options || [];
    // Fisher-Yates 洗牌
    const arr = [...words];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    wordOrder.value = arr;
  }

  nextTick(() => {
    if (props.question && props.question.type === 'fillBlank' && fillInputRef.value) {
      fillInputRef.value.focus();
    }
  });
}

// ====== choice 选择 ======
function selectChoice(value) {
  if (props.disabled) return;
  selectedAnswer.value = value;
  emit('answer', value);
}

// ====== fillBlank 提交 ======
function submitFill() {
  if (props.disabled) return;
  const val = inputValue.value.trim();
  if (!val) return;
  emit('answer', val);
}

// ====== dragOrder 操作 ======
function selectWord(idx) {
  if (props.disabled) return;
  if (selectedWordIndex.value === -1) {
    // 第一次选择
    selectedWordIndex.value = idx;
  } else if (selectedWordIndex.value === idx) {
    // 取消选择
    selectedWordIndex.value = -1;
  } else {
    // 交换位置
    swapWords(selectedWordIndex.value, idx);
    selectedWordIndex.value = -1;
  }
}

function moveWord(idx, direction) {
  if (props.disabled) return;
  const target = idx + direction;
  if (target < 0 || target >= wordOrder.value.length) return;
  swapWords(idx, target);
  selectedWordIndex.value = -1;
}

function swapWords(i, j) {
  const arr = [...wordOrder.value];
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  wordOrder.value = arr;
}

function submitOrder() {
  if (props.disabled) return;
  const result = wordOrder.value.join(' ');
  emit('answer', result);
}
</script>

<style scoped>
.question-renderer {
  width: 100%;
}

/* ====== 共用 ====== */
.q-text {
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.8;
  color: #fff;
}

.q-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.q-option {
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.q-option:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.q-option.selected {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.2);
}

.q-option:disabled {
  cursor: default;
  opacity: 0.6;
}

/* ====== fillBlank ====== */
.fill-blank-area {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
}

.fill-input {
  flex: 1;
  max-width: 400px;
  padding: 0.9rem 1.2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1.15rem;
  outline: none;
  transition: border-color 0.3s;
}

.fill-input:focus {
  border-color: #8b5cf6;
  background: rgba(255, 255, 255, 0.12);
}

.fill-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.fill-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit {
  padding: 0.9rem 1.8rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: #fff;
  font-size: 1.05rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4);
}

.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ====== dragOrder ====== */
.drag-order-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.word-blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  min-height: 80px;
}

.word-block {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(139, 92, 246, 0.15);
  color: #fff;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.word-block:hover {
  background: rgba(139, 92, 246, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

.word-block.selected {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.2);
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.3);
}

.word-text {
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.word-arrows {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 4px;
}

.arrow-btn {
  padding: 0;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.7rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s;
}

.arrow-btn:hover:not(:disabled) {
  color: #fbbf24;
}

.arrow-btn:disabled {
  color: rgba(255, 255, 255, 0.15);
  cursor: default;
}

.drag-hint {
  font-size: 0.8rem;
  opacity: 0.5;
  text-align: center;
  margin: 0;
}

/* ====== bossFight ====== */
.boss-fight-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wrong-sentence-box {
  padding: 1.2rem;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  text-align: center;
}

.ws-label {
  font-size: 0.9rem;
  opacity: 0.7;
  margin: 0 0 0.5rem 0;
}

.ws-text {
  font-size: 1.25rem;
  color: #fca5a5;
  font-weight: bold;
  margin: 0;
  line-height: 1.8;
}

/* ====== 响应式 ====== */
@media (max-width: 768px) {
  .q-options {
    grid-template-columns: 1fr;
  }

  .fill-blank-area {
    flex-direction: column;
  }

  .fill-input {
    max-width: 100%;
  }

  .word-blocks {
    padding: 0.8rem;
  }
}
</style>
