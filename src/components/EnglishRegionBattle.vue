<template>
  <div class="english-region-battle">
    <GameTutorial
      v-if="showTutorial"
      title="⚔️ 区域对战玩法说明"
      :steps="tutorialSteps"
      @close="closeTutorial"
    />
    <div class="top-bar">
      <button class="btn-back" @click="handleBack">← 返回区域</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>

    <!-- 准备阶段 -->
    <div v-else-if="phase === 'prepare'" class="prepare-phase">
      <div class="boss-intro-card">
        <button class="btn-help" @click="showTutorial = true">❓ 玩法说明</button>
        <div class="boss-big-icon">{{ bossConfig.icon || '👹' }}</div>
        <h2>{{ bossConfig.name }}</h2>
        <p class="boss-desc">击败 {{ bossConfig.name }}，获得区域精灵！</p>
        <div class="prepare-hp-info">
          <span class="hp-label">BOSS HP</span>
          <span class="hp-value">{{ bossConfig.hp || 100 }}</span>
        </div>
        <div class="prepare-rules">
          <h4>⚔️ 战斗规则</h4>
          <ul>
            <li>连续答对问题可对 BOSS 造成伤害</li>
            <li>答错不会伤害 BOSS，但连击会中断</li>
            <li>击败 BOSS 后获得该区域的精灵</li>
          </ul>
        </div>
        <button class="btn-start-battle" @click="startBattle">
          ⚔️ 开始战斗
        </button>
      </div>
    </div>

    <!-- 战斗阶段 -->
    <div v-else-if="phase === 'battling'" class="battle-phase">
      <!-- BOSS 信息区 -->
      <div class="boss-status" :class="{ 'boss-shake': isBossShaking }">
        <div class="boss-avatar">
          <span class="boss-icon">{{ bossConfig.icon || '👹' }}</span>
        </div>
        <div class="boss-info">
          <div class="boss-name-row">
            <span class="boss-name">{{ bossConfig.name }}</span>
            <span class="boss-hp-text">HP: {{ currentBossHp }}/{{ maxBossHp }}</span>
          </div>
          <div class="boss-hp-bar">
            <div
              class="boss-hp-fill"
              :class="{ 'low-hp': currentBossHp / maxBossHp <= 0.25 }"
              :style="{ width: hpPercent + '%' }"
            />
          </div>
        </div>
      </div>

      <!-- 连击显示 -->
      <div v-if="combo >= 3" class="combo-fire" :class="'level-' + Math.min(comboLevel, 3)">
        🔥 {{ combo }}x 连击
      </div>
      <div v-else-if="combo > 0" class="combo-indicator">
        ⚡ {{ combo }}x
      </div>

      <!-- 答题区域 -->
      <div class="question-area">
        <!-- 选择题 -->
        <template v-if="currentQuestion">
          <div class="question-type-badge">{{ getTypeLabel(currentQuestion.type) }}</div>

          <!-- choice / bossFight 选择题 -->
          <div v-if="currentQuestion.type === 'choice' || currentQuestion.type === 'bossFight'" class="choice-question">
            <!-- v-html safe: renderSentence() sanitizes via escapeHtml() before inserting HTML -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p class="question-sentence" v-html="renderSentence(currentQuestion)" />
            <div class="options-grid">
              <button
                v-for="(opt, i) in currentQuestion.options"
                :key="i"
                class="option-btn"
                :class="{
                  correct: answered && opt === currentQuestion.answer,
                  wrong: answered && selectedAnswer === opt && opt !== currentQuestion.answer
                }"
                :disabled="answered"
                @click="selectAnswer(opt)"
              >
                {{ opt }}
              </button>
            </div>
          </div>

          <!-- fillBlank 填空题 -->
          <div v-else-if="currentQuestion.type === 'fillBlank'" class="fill-question">
            <p class="question-sentence">{{ currentQuestion.sentence || '' }}</p>
            <div class="input-area">
              <input
                v-model="fillInput"
                type="text"
                class="fill-input"
                :class="{ correct: answered && answeredCorrectly, wrong: answered && !answeredCorrectly }"
                placeholder="请输入答案"
                :disabled="answered"
                @keyup.enter="submitFill"
              >
              <button
                class="btn-confirm"
                :disabled="answered || !fillInput.trim()"
                @click="submitFill"
              >
                确认
              </button>
            </div>
            <div v-if="answered && !answeredCorrectly" class="feedback-wrong">
              正确答案: <strong>{{ currentQuestion.answer }}</strong>
            </div>
          </div>

          <!-- 其他题型兜底显示为选择 -->
          <div v-else class="choice-question">
            <p class="question-sentence">{{ currentQuestion.sentence || currentQuestion.question || '' }}</p>
            <div v-if="currentQuestion.options" class="options-grid">
              <button
                v-for="(opt, i) in currentQuestion.options"
                :key="i"
                class="option-btn"
                :class="{
                  correct: answered && opt === currentQuestion.answer,
                  wrong: answered && selectedAnswer === opt && opt !== currentQuestion.answer
                }"
                :disabled="answered"
                @click="selectAnswer(opt)"
              >
                {{ opt }}
              </button>
            </div>
          </div>

          <!-- 题目进度 -->
          <div class="question-counter">
            题目 {{ currentQuestionIndex + 1 }} / {{ questions.length }}
          </div>
        </template>
      </div>

      <!-- 反馈消息 -->
      <div v-if="feedbackMessage" class="feedback-overlay" :class="feedbackType">
        {{ feedbackMessage }}
      </div>
    </div>

    <!-- 胜利阶段 -->
    <div v-else-if="phase === 'victory'" class="victory-phase">
      <div class="victory-card">
        <div class="victory-icon">🎉</div>
        <h2>击败 {{ bossConfig.name }}！</h2>
        <div v-if="rewardSpirit" class="spirit-reward">
          <div class="spirit-reward-icon">{{ rewardSpirit.icon }}</div>
          <p>获得精灵: <strong>{{ rewardSpirit.name }}</strong></p>
          <p class="spirit-desc">{{ rewardSpirit.description }}</p>
        </div>
        <div class="victory-stats">
          <div class="stat">
            <span class="stat-label">答对数</span>
            <span class="stat-value correct">{{ correctCount }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">失误</span>
            <span class="stat-value wrong">{{ wrongCount }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">最高连击</span>
            <span class="stat-value combo">{{ maxComboRecord }}</span>
          </div>
        </div>
        <button class="btn-return" @click="$emit('back')">
          ← 返回区域
        </button>
      </div>
    </div>

    <!-- 失败阶段 -->
    <div v-else-if="phase === 'defeat'" class="defeat-phase">
      <div class="defeat-card">
        <div class="defeat-icon">😢</div>
        <h2>战斗失败</h2>
        <p>别灰心，再试一次吧！</p>
        <div class="defeat-stats">
          <p>答对 {{ correctCount }} 题</p>
        </div>
        <div class="defeat-actions">
          <button class="btn-retry" @click="retryBattle">🔄 重新挑战</button>
          <button class="btn-back-region" @click="$emit('back')">← 返回区域</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import GameTutorial from './GameTutorial.vue';
import { useEnglishGrammarStore } from '../store/englishGrammarStore';
import { useEnglishSpiritStore } from '../store/englishSpiritStore';
import { useEnglishAdventureStore } from '../store/englishAdventureStore';
import { getTowerById, getFloorByNumber } from '../config/english/grammar';
import { getSpirit } from '../config/english/spirits';
import { getEnglishRegion } from '../config/english/adventure';

const props = defineProps({
  regionId: {
    type: String,
    required: true
  },
  bossId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['back', 'regionComplete']);

// ============ 玩法说明 ============
const showTutorial = ref(false);
const tutorialSteps = [
  {
    title: 'BOSS 战斗机制',
    description: '击败区域 BOSS 即可获得该区域的精灵。BOSS 拥有 HP 值，你需要通过连续答对问题来对其造成伤害。'
  },
  {
    title: '连击规则',
    description: '连续答对 2 题以上即可对 BOSS 造成伤害，连击数越高伤害越大（每击最多 5 点）。答错会中断连击，但不会伤害 BOSS。'
  },
  {
    title: '失败条件',
    description: '累计答错 5 次将导致战斗失败。注意控制错误率，保持连击才能高效击败 BOSS。'
  },
  {
    title: '精灵收集',
    description: '成功击败 BOSS 后，你将获得该区域的精灵，并解锁新的冒险区域和挑战内容。'
  }
];
function closeTutorial() {
  showTutorial.value = false;
}

// ============ Stores ============
const grammarStore = useEnglishGrammarStore();
const spiritStore = useEnglishSpiritStore();
const adventureStore = useEnglishAdventureStore();

// ============ 状态 ============
const loading = ref(true);
const phase = ref('prepare'); // 'prepare' | 'battling' | 'victory' | 'defeat'
const currentBossHp = ref(100);
const maxBossHp = ref(100);
const combo = ref(0);
const maxComboRecord = ref(0);
const answered = ref(false);
const selectedAnswer = ref(null);
const fillInput = ref('');
const answeredCorrectly = ref(false);
const isBossShaking = ref(false);
const feedbackMessage = ref('');
const feedbackType = ref('');
const correctCount = ref(0);
const wrongCount = ref(0);
const maxErrors = ref(5); // 允许的最大错误次数，超过则战斗失败
const currentQuestionIndex = ref(0);
const questions = ref([]);

// ============ 计算属性 ============
const regionConfig = computed(() => getEnglishRegion(props.regionId));
const bossConfig = computed(() => {
  const region = regionConfig.value;
  if (!region) return { name: 'BOSS', icon: '👹', hp: 100 };
  const spiritId = region.boss?.spiritId || props.bossId;
  const spirit = getSpirit(spiritId);
  return {
    ...region.boss,
    icon: spirit?.icon || region.boss?.icon || '👹',
    name: spirit?.name || region.boss?.name || 'BOSS',
    hp: region.boss?.hp || 100,
    spiritId: spiritId || ''
  };
});

const rewardSpirit = computed(() => {
  const spiritId = bossConfig.value.spiritId;
  if (!spiritId) return null;
  return getSpirit(spiritId);
});

const hpPercent = computed(() => {
  if (maxBossHp.value <= 0) return 0;
  return Math.max(0, (currentBossHp.value / maxBossHp.value) * 100);
});

const comboLevel = computed(() => {
  if (combo.value >= 5) return 3;
  if (combo.value >= 3) return 2;
  return 1;
});

const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null;
});

// ============ 初始化 ============
onMounted(() => {
  loadBossFloor();
});

function loadBossFloor() {
  loading.value = true;

  // 从 region 配置中找到对应的 BOSS 战语法塔
  const region = regionConfig.value;
  if (!region) {
    loading.value = false;
    return;
  }

  // 使用区域最后一个塔的 BOSS 层作为战斗题目
  // 遍历区域的塔，找到包含 bossFight 类型的楼层
  const towerIds = region.towers;
  let bossQuestions = [];
  let bossHp = bossConfig.value.hp || 100;

  for (const towerId of towerIds) {
    const tower = getTowerById(towerId);
    if (!tower) continue;

    for (const floor of tower.floors) {
      if (floor.type === 'bossFight') {
        bossQuestions = floor.questions.map((q, idx) => ({
          ...q,
          _index: idx,
          type: q.type || 'choice'
        }));
        bossHp = floor.boss?.hp || bossConfig.value.hp || 100;
        break;
      }
    }
    if (bossQuestions.length > 0) break;
  }

  // 如果找不到 BOSS 战题目，生成默认题目
  if (bossQuestions.length === 0) {
    bossQuestions = generateDefaultQuestions();
  }

  questions.value = bossQuestions;
  currentQuestionIndex.value = 0;
  currentBossHp.value = bossHp;
  maxBossHp.value = bossHp;
  loading.value = false;
}

function generateDefaultQuestions() {
  const defaults = [
    {
      type: 'choice',
      sentence: '选择正确的选项：',
      options: ['A', 'B', 'C', 'D'],
      answer: 'A'
    },
    {
      type: 'choice',
      sentence: 'Which is correct?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      answer: 'Option 1'
    },
    {
      type: 'choice',
      sentence: '请选择正确答案：',
      options: ['正确', '错误', '不知道', '以上都不对'],
      answer: '正确'
    }
  ];
  return defaults;
}

// ============ 战斗逻辑 ============
function startBattle() {
  phase.value = 'battling';
  resetBattleState();
}

function resetBattleState() {
  combo.value = 0;
  maxComboRecord.value = 0;
  correctCount.value = 0;
  wrongCount.value = 0;
  currentQuestionIndex.value = 0;
  currentBossHp.value = maxBossHp.value;
  answered.value = false;
  selectedAnswer.value = null;
  fillInput.value = '';
  answeredCorrectly.value = false;
  feedbackMessage.value = '';
}

function selectAnswer(answer) {
  if (answered.value) return;
  answered.value = true;
  selectedAnswer.value = answer;

  const q = currentQuestion.value;
  if (!q) return;

  const isCorrect = String(answer).toLowerCase() === String(q.answer).toLowerCase();
  processAnswer(isCorrect);
}

function submitFill() {
  if (answered.value || !fillInput.value.trim()) return;
  answered.value = true;
  selectedAnswer.value = fillInput.value.trim();

  const q = currentQuestion.value;
  if (!q) return;

  const isCorrect = String(fillInput.value.trim()).toLowerCase() === String(q.answer).toLowerCase();
  processAnswer(isCorrect);
}

function processAnswer(isCorrect) {
  answeredCorrectly.value = isCorrect;

  if (isCorrect) {
    combo.value++;
    if (combo.value > maxComboRecord.value) {
      maxComboRecord.value = combo.value;
    }
    correctCount.value++;

    // 连击 >= 2 时对 BOSS 造成伤害
    if (combo.value >= 2) {
      const damage = Math.min(combo.value, 5); // 每击最多5点伤害
      currentBossHp.value = Math.max(0, currentBossHp.value - damage);
      triggerBossShake();

      showFeedback(`🔥 对 BOSS 造成 ${damage} 点伤害！`, 'hit');
    } else {
      showFeedback('✅ 回答正确！再连击一次可对 BOSS 造成伤害', 'correct');
    }
  } else {
    combo.value = 0;
    wrongCount.value++;

    // 检查失败条件：错误次数超过上限
    if (wrongCount.value >= maxErrors.value) {
      phase.value = 'defeat';
      return;
    }

    showFeedback(`❌ 回答错误，连击中断`, 'wrong');
  }

  // 检查 BOSS 是否被击败
  if (currentBossHp.value <= 0) {
    onBossDefeated();
    return;
  }

  // 推进到下一题
  setTimeout(() => {
    nextQuestion();
  }, isCorrect ? 800 : 1200);
}

function triggerBossShake() {
  isBossShaking.value = true;
  setTimeout(() => {
    isBossShaking.value = false;
  }, 600);
}

function showFeedback(message, type) {
  feedbackMessage.value = message;
  feedbackType.value = type;
  setTimeout(() => {
    feedbackMessage.value = '';
  }, 2000);
}

function nextQuestion() {
  const nextIdx = currentQuestionIndex.value + 1;

  if (nextIdx >= questions.value.length) {
    // 题库用完了，重新生成/循环
    // 如果 BOSS 还没被打败，继续出题
    if (currentBossHp.value > 0) {
      currentQuestionIndex.value = 0;
      // 重新洗牌题目
      questions.value = shuffleArray([...questions.value]);
    } else {
      onBossDefeated();
    }
  } else {
    currentQuestionIndex.value = nextIdx;
  }

  // 重置答题状态
  answered.value = false;
  selectedAnswer.value = null;
  fillInput.value = '';
  answeredCorrectly.value = false;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============ BOSS 击败 ============
function onBossDefeated() {
  phase.value = 'victory';

  // 触发精灵收集
  const spirit = rewardSpirit.value;
  if (spirit) {
    spiritStore.collectSpirit(spirit.id);
  }

  // 标记区域 BOSS 已击败
  adventureStore.defeatBoss(props.regionId);

  // 通知父组件
  const region = regionConfig.value;
  if (region) {
    emit('regionComplete', {
      regionId: props.regionId,
      spiritId: spirit?.id || '',
      totalCollected: spiritStore.collectedCount
    });
  }
}

// ============ 重试 ============
function retryBattle() {
  phase.value = 'prepare';
  loadBossFloor();
}

// ============ 返回 ============
function handleBack() {
  emit('back');
  // 注意：组件卸载时的清理在 onUnmounted 中统一处理
}

// ============ 工具函数 ============
function getTypeLabel(type) {
  const labels = {
    choice: '选择题',
    bossFight: 'BOSS 战',
    fillBlank: '填空题'
    // BOSS 战实际只使用以上题型
  };
  return labels[type] || type || '未知题型';
}

function renderSentence(q) {
  if (!q) return '';
  const escapeHtml = (s) => {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
  let html = escapeHtml(q.sentence || q.wrongSentence || q.question || '');
  if (q.blanks && q.blanks.length > 0) {
    for (const blank of q.blanks) {
      html = html.replace(escapeHtml(blank), '<span class="sentence-blank">______</span>');
    }
  }
  return html;
}

onUnmounted(() => {
  grammarStore.resetGame();
});
</script>

<style scoped>
.english-region-battle {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  color: #fff;
  background: linear-gradient(
    180deg,
    rgba(30, 10, 50, 1) 0%,
    rgba(15, 5, 35, 1) 100%
  );
  position: relative;
  overflow-y: auto;
}

/* ========== 返回按钮 ========== */
.btn-back {
  align-self: flex-start;
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
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
}

.btn-help:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* ========== 加载状态 ========== */
.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

/* ========== 准备阶段 ========== */
.prepare-phase {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.boss-intro-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(100, 50, 180, 0.2), rgba(180, 50, 50, 0.1));
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: fadeIn 0.5s ease-out;
}

.boss-big-icon {
  font-size: 4rem;
  animation: bossFloat 2s ease-in-out infinite;
}

@keyframes bossFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.boss-intro-card h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #ef4444;
}

.boss-desc {
  opacity: 0.7;
  margin: 0;
}

.prepare-hp-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hp-label {
  font-size: 0.9rem;
  opacity: 0.6;
}

.hp-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ef4444;
}

.prepare-rules {
  text-align: left;
  width: 100%;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.prepare-rules h4 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: #fbbf24;
}

.prepare-rules ul {
  margin: 0;
  padding-left: 1.2rem;
}

.prepare-rules li {
  font-size: 0.85rem;
  opacity: 0.7;
  line-height: 1.6;
}

.btn-start-battle {
  padding: 0.8rem 2.5rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.btn-start-battle:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

/* ========== 战斗阶段 ========== */
.battle-phase {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
}

/* BOSS 状态 */
.boss-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 14px;
  transition: all 0.3s;
}

.boss-status.boss-shake {
  animation: shake 0.6s ease-in-out;
}

.boss-avatar {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  font-size: 2rem;
  flex-shrink: 0;
}

.boss-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.boss-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.boss-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #ef4444;
}

.boss-hp-text {
  font-size: 0.85rem;
  color: #fca5a5;
  font-weight: bold;
}

.boss-hp-bar {
  height: 14px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 7px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.boss-hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #f97316, #fbbf24);
  border-radius: 7px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.boss-hp-fill.low-hp {
  animation: hpWarning 0.8s ease-in-out infinite alternate;
}

@keyframes hpWarning {
  0% { opacity: 1; filter: brightness(1); }
  50% { opacity: 0.7; filter: brightness(1.4); }
  100% { opacity: 1; filter: brightness(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-6px) rotate(-1deg); }
  20% { transform: translateX(6px) rotate(1deg); }
  30% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  50% { transform: translateX(-2px); }
  60% { transform: translateX(2px); }
}

/* 连击显示 */
.combo-fire {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  align-self: center;
  padding: 0.3rem 0.8rem;
  background: conic-gradient(from 0deg, #ff4500, #ff8c00, #ffd700, #ff8c00, #ff4500);
  border-radius: 20px;
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: 0 0 10px rgba(255, 69, 0, 0.6), 0 0 20px rgba(255, 69, 0, 0.4);
  animation: comboPulse 0.6s ease-in-out infinite alternate;
}

@keyframes comboPulse {
  0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 69, 0, 0.6); }
  100% { transform: scale(1.08); box-shadow: 0 0 20px rgba(255, 69, 0, 0.8); }
}

.combo-indicator {
  align-self: center;
  padding: 0.2rem 0.6rem;
  background: rgba(255, 165, 0, 0.2);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 12px;
  color: #f97316;
  font-size: 0.9rem;
  font-weight: bold;
}

/* 答题区域 */
.question-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}

.question-type-badge {
  align-self: flex-start;
  padding: 0.2rem 0.6rem;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  font-size: 0.75rem;
  color: #a78bfa;
}

.question-sentence {
  font-size: 1.4rem;
  text-align: center;
  font-weight: bold;
  color: #e8c8ff;
  line-height: 1.6;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(180, 120, 255, 0.15);
  border-radius: 12px;
  width: 100%;
  word-break: break-word;
}

:deep(.sentence-blank) {
  color: #fbbf24;
  text-decoration: underline;
  text-decoration-style: wavy;
  text-underline-offset: 4px;
  font-weight: bold;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
  width: 100%;
  max-width: 400px;
}

.option-btn {
  padding: 0.8rem 0.6rem;
  font-size: 1.2rem;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(180, 120, 255, 0.3);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.option-btn:hover:not(:disabled) {
  background: rgba(180, 120, 255, 0.2);
  border-color: #b078ff;
  transform: translateY(-2px);
}

.option-btn:disabled {
  cursor: default;
  opacity: 0.85;
}

.option-btn.correct {
  background: rgba(52, 211, 153, 0.3);
  border-color: #34d399;
  animation: correctFlash 0.5s ease;
}

.option-btn.wrong {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
  animation: shake 0.4s ease;
}

@keyframes correctFlash {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* 填空题 */
.input-area {
  display: flex;
  gap: 0.8rem;
  width: 100%;
  max-width: 400px;
}

.fill-input {
  flex: 1;
  padding: 0.8rem 1rem;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(180, 120, 255, 0.3);
  border-radius: 10px;
  color: #fff;
  outline: none;
  text-align: center;
  transition: all 0.2s;
}

.fill-input:focus {
  border-color: #b078ff;
  box-shadow: 0 0 15px rgba(180, 120, 255, 0.3);
}

.fill-input.correct {
  border-color: #34d399;
  background: rgba(52, 211, 153, 0.15);
}

.fill-input.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.btn-confirm {
  padding: 0.8rem 1.4rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.btn-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.feedback-wrong {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.95rem;
}

.feedback-wrong strong {
  color: #fbbf24;
}

.question-counter {
  font-size: 0.8rem;
  opacity: 0.4;
  text-align: center;
}

/* 反馈消息 */
.feedback-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  z-index: 100;
  animation: feedbackPop 0.3s ease-out;
  pointer-events: none;
}

.feedback-overlay.correct {
  background: rgba(52, 211, 153, 0.9);
  color: #fff;
}

.feedback-overlay.hit {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(249, 115, 22, 0.9));
  color: #fff;
}

.feedback-overlay.wrong {
  background: rgba(239, 68, 68, 0.85);
  color: #fff;
}

@keyframes feedbackPop {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  60% { transform: translate(-50%, -50%) scale(1.15); }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

/* ========== 胜利阶段 ========== */
.victory-phase {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.victory-card {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(139, 92, 246, 0.1));
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.victory-icon {
  font-size: 3.5rem;
  animation: celebrateBounce 1s ease infinite;
}

@keyframes celebrateBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.victory-card h2 {
  margin: 0;
  font-size: 1.6rem;
  background: linear-gradient(135deg, #ffd700, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.spirit-reward {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  width: 100%;
}

.spirit-reward-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.spirit-reward p {
  margin: 0.3rem 0;
  font-size: 0.95rem;
}

.spirit-reward strong {
  color: #fbbf24;
}

.spirit-desc {
  font-size: 0.8rem !important;
  opacity: 0.6;
}

.victory-stats {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.6;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: bold;
}

.stat-value.correct { color: #34d399; }
.stat-value.wrong { color: #ef4444; }
.stat-value.combo { color: #f97316; }

.btn-return {
  padding: 0.7rem 2rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-return:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

/* ========== 失败阶段 ========== */
.defeat-phase {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.defeat-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(100, 50, 180, 0.1));
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.defeat-icon {
  font-size: 3rem;
}

.defeat-card h2 {
  margin: 0;
  color: #ef4444;
  font-size: 1.5rem;
}

.defeat-card p {
  opacity: 0.7;
  margin: 0;
}

.defeat-stats {
  opacity: 0.6;
}

.defeat-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-retry {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.btn-back-region {
  padding: 0.7rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: #fff;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back-region:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ========== 动画 ========== */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .english-region-battle {
    padding: 1rem;
  }

  .question-sentence {
    font-size: 1.1rem;
    padding: 0.8rem;
  }

  .options-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .option-btn {
    padding: 0.7rem 0.4rem;
    font-size: 1rem;
  }

  .boss-big-icon {
    font-size: 3rem;
  }

  .victory-card h2 {
    font-size: 1.3rem;
  }

  .boss-intro-card h2 {
    font-size: 1.4rem;
  }

  .input-area {
    flex-direction: column;
  }
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 1rem 2rem 0 0;
}
</style>
