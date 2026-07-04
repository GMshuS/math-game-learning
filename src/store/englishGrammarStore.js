/**
 * 语法塔闯关 Store
 * 管理语法塔（Be动词塔等）的全部状态和逻辑
 * 遵循 save-on-write 模式，与 englishSpeedSpellStore 架构一致
 *
 * 进度数据存放在 gameStore.grammarProgress 中
 */
import { defineStore } from 'pinia';
import { useGameStore } from './gameStore';
import { useEnglishKnowledgeStore } from './englishKnowledgeStore';
import { getTowerById, getFloorByNumber } from '../config/english/grammar';
import { generateQuestion as generateEnglishQuestion } from '../utils/englishQuestionGenerator';

/**
 * 自适应 Level 计算
 * 根据英语知识记录，对基础 level 进行三区自适应调整
 *
 * @param {string} knowledgeType - 知识点类型（如 'beVerb'）
 * @param {number} floorNumber - 楼层号 (1-8)
 * @param {object} knowledgeStore - englishKnowledgeStore 实例
 * @returns {number} 调整后的 level (1-6)
 */
function calcAdaptiveLevel(knowledgeType, floorNumber, knowledgeStore) {
  // 1. 基础等级（同现有逻辑）
  const baseLevel = Math.min(Math.max(1, Math.floor(floorNumber / 2) + 1), 6);

  // 2. 读取错题记录
  const record = knowledgeStore?.records?.[knowledgeType];

  // 3. 冷启动保护：不足 3 次答题不上自适应
  if (!record || record.totalAttempts < 3) return baseLevel;

  const errorRate = record.wrongCount / record.totalAttempts;

  // 4. 三区自适应
  if (errorRate > 0.50) {
    // 错误率过半 → 降 1 级
    return Math.max(1, baseLevel - 1);
  }
  if (errorRate < 0.15) {
    // 错误率很低 → 升 1 级
    return Math.min(6, baseLevel + 1);
  }
  // 稳定区 → 保持 baseLevel
  return baseLevel;
}

export const useEnglishGrammarStore = defineStore('englishGrammar', {
  state: () => ({
    // 当前状态
    currentTower: null,       // 当前塔 id
    currentFloor: 0,          // 当前层 (0=教学关, 1-8)
    currentQuestionIndex: 0,  // 当前题目序号
    lives: 3,
    maxLives: 3,
    timeLeft: 15,             // 当前题剩余秒数
    score: 0,
    combo: 0,
    maxCombo: 0,
    // 楼层状态
    floorQuestions: [],       // 当前层的题目列表
    floorCorrectCount: 0,
    floorWrongCount: 0,
    floorHistory: [],         // 每题答题记录
    // 游戏态
    gamePhase: 'idle',        // 'idle' | 'tutorial' | 'playing' | 'floorResult' | 'gameOver' | 'victory'
    // BOSS战
    bossHp: 3,
    bossConsecutiveCorrect: 0,
    // 结果
    gameResult: null         // { stars, coins, exp, floorStars }
  }),

  getters: {
    /**
     * 当前题目对象
     * @returns {object|null}
     */
    currentQuestion: (state) => state.floorQuestions[state.currentQuestionIndex] || null,

    /**
     * 当前题目类型
     * @returns {string|null}
     */
    currentType: (state) => state.currentQuestion?.type || null,

    /**
     * 当前楼层星级评价
     * 5题答对3题通关
     * 0失误 -> ★★★, 1次失误 -> ★★, 2+次失误 -> ★
     * @returns {number} 0-3
     */
    floorStars: (state) => {
      if (state.floorCorrectCount < 3) return 0;
      const mistakes = state.floorWrongCount;
      if (mistakes === 0) return 3;
      if (mistakes <= 1) return 2;
      return 1;
    },

    /**
     * 当前楼层是否已通关
     * @returns {boolean}
     */
    isFloorCleared: (state) => state.floorCorrectCount >= 3,

    /**
     * 当前楼层是否已失败
     * @returns {boolean}
     */
    hasFloorFailed: (state) => state.lives <= 0 && state.floorCorrectCount < 3
  },

  actions: {
    /**
     * 进入语法塔
     * 从 grammar.js 读取塔配置，初始化状态
     * 如果塔从未通关 -> 进入教学关 (tutorial)
     * 如果塔已有进度 -> 恢复最高楼层
     * @param {string} towerId 塔标识
     */
    enterTower(towerId) {
      const tower = getTowerById(towerId);
      if (!tower) return;

      this.resetGame();
      this.currentTower = towerId;

      // 检查该塔是否有进度
      const gameStore = useGameStore();
      this._ensureProgressExists(gameStore);
      const progress = gameStore.grammarProgress.towerProgress[towerId];

      if (!progress || progress.highestFloor === 0) {
        // 从未通关 -> 教学关
        this.gamePhase = 'tutorial';
        this.currentFloor = 0;
      } else {
        // 已有进度 -> 恢复最高楼层
        this.currentFloor = progress.highestFloor;
        this.startFloor(this.currentFloor);
      }
    },

    /**
     * 动态生成题目（动态生成器优先，回退 grammar.js 静态题库）
     *
     * 对于 choice/fillBlank 类型楼层（1-6层）：调用 englishQuestionGenerator
     * 对于其他类型楼层（dragOrder/bossFight/特殊题型）：直接回退静态题库
     *
     * @param {object} floorData 楼层数据
     * @returns {Array<object>} 题目数组
     */
    /**
     * 将动态生成器输出的题目标准化为组件期望的格式
     * 动态生成器输出：{ question, answer, options, type, knowledgeId }
     * 组件期望：{ sentence, blanks, answer, options, type, ... }
     * @param {object} q 动态生成的原始题目
     * @param {string} floorType 楼层类型
     * @param {number} index 题目索引
     * @param {boolean} isBoss 是否为BOSS楼层
     * @returns {object} 标准化后的题目
     */
    _normalizeDynamicQuestion(q, floorType, index, isBoss) {
      const normalized = {
        ...q,
        _index: index,
        type: floorType,
        isBossFloor: isBoss,
        // 动态生成器用 `question` 字段，组件用 `sentence` 字段
        sentence: q.question || q.sentence || '',
        // 组件需要 blanks 数组用于渲染填空题下划线
        blanks: q.blanks || (floorType === 'fillBlank' ? ['___'] : []),
        // BOSS战需要 wrongSentence 字段
        wrongSentence: q.wrongSentence || '',
        // 确保有 voicePrompt
        voicePrompt: q.voicePrompt || q.question || q.sentence || ''
      };
      // 保留 question 字段作为向后兼容
      normalized.question = normalized.sentence;
      return normalized;
    },

    _generateQuestions(floorData) {
      if (!floorData || !this.currentTower) return [];

      const towerId = this.currentTower;
      const isChoiceOrFillBlank = floorData.type === 'choice' || floorData.type === 'fillBlank';

      // 动态生成器支持的知识点类型列表
      const dynamicSupportedTypes = [
        'beVerb', 'presentSimple', 'presentContinuous', 'noun',
        'thereBe', 'article', 'pastTense', 'futureTense',
        'pronoun', 'questionForm', 'adjAdv', 'comparative',
        'preposition', 'conjunction', 'sentenceStructure', 'basicClause'
      ];

      if (isChoiceOrFillBlank) {
        // 动态生成器优先（楼层 1-6）
        const knowledgeType = this._towerIdToKnowledgeType(towerId);
        if (knowledgeType && dynamicSupportedTypes.includes(knowledgeType)) {
          const generatedQuestions = [];
          const knowledgeStore = useEnglishKnowledgeStore();
          // 尝试生成 floorData.questions.length 个题目，默认 5 题
          const targetCount = floorData.questions.length || 5;
          for (let i = 0; i < targetCount; i++) {
            // level 根据知识记录自适应调整
            const level = calcAdaptiveLevel(knowledgeType, floorData.floor, knowledgeStore);
            const q = generateEnglishQuestion(knowledgeType, level);
            if (q) {
              generatedQuestions.push(
                this._normalizeDynamicQuestion(q, floorData.type, i, false)
              );
            }
          }
          // 若成功生成了至少 1 题，返回生成的题目
          if (generatedQuestions.length > 0) {
            return generatedQuestions;
          }
        }
      }

      // BOSS战楼层（楼层 8）：尝试用动态生成器产生 choice 题作为 bossFight 备选
      if (floorData.type === 'bossFight') {
        const knowledgeType = this._towerIdToKnowledgeType(towerId);
        if (knowledgeType && dynamicSupportedTypes.includes(knowledgeType)) {
          const generatedQuestions = [];
          const knowledgeStore = useEnglishKnowledgeStore();
          const targetCount = floorData.questions.length || 5;
          for (let i = 0; i < targetCount; i++) {
            // BOSS 楼层同样使用自适应 level
            const level = calcAdaptiveLevel(knowledgeType, floorData.floor, knowledgeStore);
            const q = generateEnglishQuestion(knowledgeType, level);
            if (q) {
              generatedQuestions.push(
                this._normalizeDynamicQuestion(q, floorData.type, i, true)
              );
            }
          }
          if (generatedQuestions.length > 0) {
            return generatedQuestions;
          }
        }
      }

      // 回退：使用 grammar.js 静态题库中的保留题
      return floorData.questions.map((q, index) => ({
        ...q,
        _index: index,
        type: floorData.type,
        isBossFloor: floorData.type === 'bossFight'
      }));
    },

    /**
     * 将塔 ID 映射为动态生成器的知识类型
     * @param {string} towerId
     * @returns {string|null}
     */
    _towerIdToKnowledgeType(towerId) {
      const mapping = {
        'be-verb': 'beVerb',
        'presentSimple': 'presentSimple',
        'presentContinuous': 'presentContinuous',
        'noun': 'noun',
        'thereBe': 'thereBe',
        'article': 'article',
        'pastTense': 'pastTense',
        'futureTense': 'futureTense',
        'pronoun': 'pronoun',
        'questionForm': 'questionForm',
        'comparative': 'comparative',
        'preposition': 'preposition',
        'conjunction': 'conjunction',
        'basicClause': 'basicClause',
        'phrase': null,
        'dialogue': null
      };
      return mapping[towerId] || null;
    },

    /**
     * 开始指定楼层
     * 加载该层题目，重置楼层相关状态
     * @param {number} floorNumber 楼层号 (1-8)
     */
    startFloor(floorNumber) {
      if (!this.currentTower) return;

      const floorData = getFloorByNumber(this.currentTower, floorNumber);
      if (!floorData) return;

      // 重置楼层相关状态
      this.currentFloor = floorNumber;
      this.currentQuestionIndex = 0;
      this.lives = this.maxLives;
      this.timeLeft = 15;
      this.combo = 0;
      this.floorCorrectCount = 0;
      this.floorWrongCount = 0;
      this.floorHistory = [];
      this.bossHp = 3;
      this.bossConsecutiveCorrect = 0;

      // 动态出题：动态生成器优先 → 回退 grammar.js 静态
      this.floorQuestions = this._generateQuestions(floorData);

      // 无可用题目时跳过该层
      if (this.floorQuestions.length === 0) {
        console.warn(`[englishGrammarStore] 楼层 ${floorNumber} 无可用题目，跳过`);
        this.gamePhase = 'idle';
        return;
      }

      // BOSS层使用配置的HP
      if (floorData.type === 'bossFight' && floorData.boss) {
        this.bossHp = floorData.boss.hp || 3;
      }

      this.gamePhase = 'playing';
    },

    /**
     * 用户答题
     * 根据题型不同执行判题逻辑
     * 正确：combo+1, score+=计算, floorCorrectCount+1
     * 错误：combo=0, lives-1, floorWrongCount+1
     * 记录答题历史，记录错题到 englishKnowledgeStore
     * 检查是否该层结束，如果结束调用 endFloor()
     * @param {string|number|string[]} answer 用户答案
     * @returns {boolean} 是否正确
     */
    answerQuestion(answer) {
      if (this.gamePhase !== 'playing') return false;

      const question = this.currentQuestion;
      if (!question) return false;

      let isCorrect = false;

      // ---- 根据题型判题 ----
      switch (question.type) {
        case 'choice':
        case 'fillBlank':
          // 选项选择或填空，忽略大小写比较字符串答案
          isCorrect = String(answer).toLowerCase() === String(question.answer).toLowerCase();
          break;

        case 'dragOrder':
          // 排序题：将用户拖拽的单词数组拼接成完整句子进行比较
          if (Array.isArray(answer)) {
            const joined = answer.join(' ').trim();
            // 规范化标点前的空格，使 'a student ?' → 'a student?'，适配 answer 中标点紧贴前词的格式
            const normalizePunct = (s) => s.replace(/\s+([.,!?;:])/g, '$1').trim().toLowerCase();
            isCorrect = normalizePunct(joined) === normalizePunct(question.answer);
          } else {
            isCorrect = String(answer).trim().toLowerCase() === question.answer.trim().toLowerCase();
          }
          break;

        case 'bossFight':
          // BOSS战：选择正确的 be 动词修复句子
          isCorrect = String(answer).toLowerCase() === String(question.answer).toLowerCase();
          break;

        // 新题型：统一走字符串比较
        case 'categorize':
        case 'match':
        case 'imageChoice':
        case 'verbTable':
        case 'transform':
        case 'connector':
          // categorize/match/verbTable 的答案编码为字符串格式
          // imageChoice/transform/connector 为简单字符串
          isCorrect = String(answer).toLowerCase().trim() === String(question.answer).toLowerCase().trim();
          break;

        default:
          console.warn(`[englishGrammarStore] 未知题型 "${question.type}"，使用默认字符串比较`);
          isCorrect = String(answer).toLowerCase() === String(question.answer).toLowerCase();
      }

      // ---- 记录答题历史 ----
      this.floorHistory.push({
        questionIndex: this.currentQuestionIndex,
        question: question.sentence || question.wrongSentence || '',
        userAnswer: answer,
        correctAnswer: question.answer,
        isCorrect,
        type: question.type
      });

      // ---- 更新状态 ----
      if (isCorrect) {
        this._onCorrectAnswer(question);
      } else {
        this._onWrongAnswer(question);
      }

      // ---- 记录到错题本 ----
      const knowledgeStore = useEnglishKnowledgeStore();
      const nodeId = question.knowledgeId || this._towerIdToKnowledgeType(this.currentTower) || `${this.currentTower}_floor${this.currentFloor}`;
      knowledgeStore.recordResult(nodeId, isCorrect);

      // ---- 检查该层是否结束 ----
      const totalQuestions = this.floorQuestions.length;
      const isLastQuestion = this.currentQuestionIndex >= totalQuestions - 1;
      const noLivesLeft = this.lives <= 0;
      const bossDefeated = this.bossHp <= 0;
      const floorCleared = this.isFloorCleared;
      const floorFailed = this.hasFloorFailed;

      if (isLastQuestion || noLivesLeft || bossDefeated || floorCleared || floorFailed) {
        this.endFloor();
      } else {
        // 未结束，自动推进到下一题
        this.currentQuestionIndex++;
        this.timeLeft = 15;
      }

      return isCorrect;
    },

    /**
     * 正确答案处理
     * 增加连击、计算得分、更新正确计数
     * @param {object} question 当前题目
     */
    _onCorrectAnswer(question) {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      // 得分 = 基础分 + 连击奖励
      const BASE_POINTS = 10;
      const COMBO_BONUS_RATE = 0.5;
      const comboBonus = Math.floor(BASE_POINTS * (this.combo - 1) * COMBO_BONUS_RATE);
      this.score += BASE_POINTS + comboBonus;
      this.floorCorrectCount++;

      // BOSS战特殊逻辑
      if (question.isBossFloor) {
        this.bossConsecutiveCorrect++;
        this.bossHp = Math.max(0, this.bossHp - 1);
      }
    },

    /**
     * 错误答案处理
     * 重置连击、减少生命、增加错误计数
     * @param {object} question 当前题目
     */
    _onWrongAnswer(question) {
      this.combo = 0;
      this.lives--;
      this.floorWrongCount++;

      // BOSS战：中断连击但BOSS不减血
      if (question.isBossFloor) {
        this.bossConsecutiveCorrect = 0;
      }
    },

    /**
     * 结束当前楼层
     * 计算星级，更新 towerProgress
     * 如果通关 -> floorResult 阶段
     * 如果失败 -> gameOver 阶段
     */
    endFloor() {
      if (!this.currentTower) return;

      const stars = this.floorStars;
      const cleared = this.isFloorCleared;
      const failed = this.hasFloorFailed;

      // 更新进度
      const gameStore = useGameStore();
      this._ensureProgressExists(gameStore);
      const progress = gameStore.grammarProgress.towerProgress[this.currentTower];

      if (cleared) {
        // 记录最高楼层
        if (this.currentFloor > progress.highestFloor) {
          progress.highestFloor = this.currentFloor;
        }

        // 记录楼层星级（取历史最高分）
        const existingStars = progress.floorStars[this.currentFloor] || 0;
        progress.floorStars[this.currentFloor] = Math.max(existingStars, stars);

        // 重新计算总星数
        progress.totalStars = Object.values(progress.floorStars).reduce((sum, s) => sum + s, 0);

        // 如果通关第8层，标记塔为已通关
        if (this.currentFloor >= 8 && cleared) {
          progress.cleared = true;
        }

        gameStore.saveGame();

        this.gamePhase = 'floorResult';
      } else if (failed) {
        this.gamePhase = 'gameOver';
      } else {
        // 未达到结束条件但被调用（超时等），视为失败
        gameStore.saveGame();
        this.gamePhase = 'gameOver';
      }
    },

    /**
     * 进入下一楼层
     * 如果 currentFloor < 8 -> currentFloor++, startFloor()
     * 如果 currentFloor >= 8 -> endTower()
     */
    nextFloor() {
      if (!this.currentTower) return;

      const tower = getTowerById(this.currentTower);
      if (!tower) return;

      const totalFloors = tower.floors.length;

      if (this.currentFloor < totalFloors) {
        this.startFloor(this.currentFloor + 1);
      } else {
        this.endTower();
      }
    },

    /**
     * 结束塔（全部楼层通关）
     * 计算总得分，发放奖励，更新进度
     */
    endTower() {
      if (!this.currentTower) return;

      const gameStore = useGameStore();
      this._ensureProgressExists(gameStore);
      const progress = gameStore.grammarProgress.towerProgress[this.currentTower];

      // 计算奖励：基础奖励 + 每颗星的奖励
      const COINS_BASE = 10;
      const COINS_PER_STAR = 5;
      const EXP_BASE = 20;
      const EXP_PER_STAR = 10;
      const totalStars = progress.totalStars || 0;
      const coins = totalStars * COINS_PER_STAR + COINS_BASE;
      const exp = totalStars * EXP_PER_STAR + EXP_BASE;

      // 发放奖励
      gameStore.addCoins(coins);
      gameStore.addExp(exp);

      // 全三星通关奖励钥匙
      let keysEarned = 0;
      const tower = getTowerById(this.currentTower);
      if (tower) {
        const totalFloors = tower.floors.length;
        const floorsWithStars = Object.keys(progress.floorStars).length;
        if (floorsWithStars >= totalFloors) {
          const allThreeStars = tower.floors.every(
            (f) => (progress.floorStars[f.floor] || 0) >= 3
          );
          if (allThreeStars) {
            keysEarned = 1;
            gameStore.grammarProgress.totalKeys = (gameStore.grammarProgress.totalKeys || 0) + keysEarned;
          }
        }
      }

      gameStore.saveGame();

      this.gameResult = {
        stars: totalStars,
        coins,
        exp,
        keysEarned,
        towerId: this.currentTower,
        floorStars: { ...progress.floorStars }
      };

      this.gamePhase = 'victory';
    },

    /**
     * 计时器滴答（每秒由 UI 调用）
     * timeLeft--，如果 timeLeft <= 0 -> 自动判错
     */
    useTimerTick() {
      if (this.gamePhase !== 'playing') return;

      this.timeLeft--;
      if (this.timeLeft <= 0) {
        // 超时自动判错并推进
        this.answerQuestion('');
      }
    },

    /**
     * 跳过教学关
     * 直接进入第1层
     */
    skipTutorial() {
      this.gamePhase = 'playing';
      this.startFloor(1);
    },

    /**
     * 完成教学关
     * 进入第1层
     */
    completeTutorial() {
      this.gamePhase = 'playing';
      this.startFloor(1);
    },

    /**
     * 生成动态题目（公开接口）
     * 供外部组件或调试使用，直接调用英语生成器
     * @param {string} topic 知识点类型（如 'beVerb', 'noun'）
     * @param {number} level 难度等级 (1-6)
     * @returns {object|null} 题目对象
     */
    generateDynamicQuestion(topic, level = 1) {
      return generateEnglishQuestion(topic, level);
    },

    /**
     * 重置所有游戏状态到初始值
     */
    resetGame() {
      this.currentTower = null;
      this.currentFloor = 0;
      this.currentQuestionIndex = 0;
      this.lives = 3;
      this.maxLives = 3;
      this.timeLeft = 15;
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.floorQuestions = [];
      this.floorCorrectCount = 0;
      this.floorWrongCount = 0;
      this.floorHistory = [];
      this.gamePhase = 'idle';
      this.bossHp = 3;
      this.bossConsecutiveCorrect = 0;
      this.gameResult = null;
    },

    /**
     * 确保 gameStore 中存在 grammarProgress 结构
     * 按需初始化当前塔的进度数据
     * @param {object} gameStore gameStore 实例
     */
    _ensureProgressExists(gameStore) {
      if (!gameStore.grammarProgress) {
        gameStore.grammarProgress = {
          towerProgress: {},
          totalKeys: 0
        };
      }
      if (!gameStore.grammarProgress.towerProgress) {
        gameStore.grammarProgress.towerProgress = {};
      }
      if (this.currentTower && !gameStore.grammarProgress.towerProgress[this.currentTower]) {
        gameStore.grammarProgress.towerProgress[this.currentTower] = {
          highestFloor: 0,
          floorStars: {},
          totalStars: 0,
          cleared: false
        };
      }
    }
  }
});

export default useEnglishGrammarStore;
