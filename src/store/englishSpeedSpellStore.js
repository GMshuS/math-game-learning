/**
 * 英语速拼 Store
 * 参考 src/store/speedChallengeStore.js 架构，共享 _challengeBase 公共逻辑
 */
import { defineStore } from 'pinia';
import { useGameStore } from './gameStore';
import { useSettingsStore } from './settingsStore';
import { useEnglishKnowledgeStore } from './englishKnowledgeStore';
import { speedSpellConfig } from '../config/english/speedSpell';
import { getWordsByLevel } from '../config/english/grades';
import {
  createChallengeState,
  createChallengeGetters,
  baseStartGame,
  baseAnswer,
  baseTick,
  baseEndGame
} from './_challengeBase';

export const useEnglishSpeedSpellStore = defineStore('englishSpeedSpell', {
  state: () => ({
    ...createChallengeState()
  }),

  getters: {
    ...createChallengeGetters(() => speedSpellConfig)
  },

  actions: {
    /**
     * 开始游戏
     * @param {string} mode - 'base' | 'blitz' | 'survival'
     * @returns {boolean} 是否成功启动
     */
    startGame(mode) {
      const config = speedSpellConfig.modes[mode];
      return baseStartGame(this, config, mode, () => this.generateQuestion());
    },

    /**
     * 生成题目
     * 从 englishGradesConfig 按等级取词，按题型权重随机选题型，生成 4 选项
     */
    generateQuestion() {
      const settingsStore = useSettingsStore();
      const level = settingsStore.getEffectiveEnglishLevel;
      const words = getWordsByLevel(level);
      if (words.length < 4) {
        console.warn(`[englishSpeedSpell] 当前等级 ${level} 词汇不足 4 个，无法生成题目`);
        this.currentQuestion = null;
        return;
      }

      // 随机选一个词
      const wordIndex = Math.floor(Math.random() * words.length);
      const word = words[wordIndex];

      // 按权重随机选题型
      const qType = this._pickQuestionType();

      // 生成干扰词（3个）
      const distractorDifficulty = this._getDistractorDifficulty();
      const distractors = this._generateDistractors(words, wordIndex, qType, distractorDifficulty, 3);

      // 组装选项
      const correctValue = (qType === 'en2cn' || qType === 'listening') ? word.cn : word.en;
      const allOptions = [correctValue, ...distractors];
      const options = this._shuffle(allOptions);
      const correctIndex = options.indexOf(correctValue);

      this.currentQuestion = {
        type: qType,
        word,
        options,
        correctIndex,
        distractors
      };
    },

    /**
     * 按权重随机选题型
     * @returns {string} 'en2cn' | 'cn2en' | 'listening'
     */
    _pickQuestionType() {
      const types = speedSpellConfig.questionTypes;
      const rand = Math.random();
      let cumulative = 0;
      for (const [type, cfg] of Object.entries(types)) {
        cumulative += cfg.weight;
        if (rand < cumulative) return type;
      }
      return 'en2cn';
    },

    /**
     * 随机获取干扰词难度策略
     * @returns {string} 'easy' | 'medium' | 'hard'
     */
    _getDistractorDifficulty() {
      const rand = Math.random();
      if (rand < 0.33) return 'easy';
      if (rand < 0.66) return 'medium';
      return 'hard';
    },

    /**
     * 生成干扰词选项
     * @param {Array} words - 全部词汇
     * @param {number} wordIndex - 正确词的索引
     * @param {string} qType - 题型
     * @param {string} difficulty - 干扰策略
     * @param {number} count - 需要生成的干扰词数量
     * @returns {Array} 干扰词字符串数组（cn 或 en，取决于题型）
     */
    _generateDistractors(words, wordIndex, qType, difficulty, count) {
      const word = words[wordIndex];
      const others = words.filter((w, i) => i !== wordIndex);

      let candidates = [];

      if (difficulty === 'easy') {
        // 简单：不同 category
        candidates = others.filter(w => w.category !== word.category);
      } else if (difficulty === 'medium') {
        // 中等：同 category
        candidates = others.filter(w => w.category === word.category);
      } else {
        // 困难：拼写相似（首字母相同、长度相同或结尾相似）
        const en = word.en.toLowerCase();
        candidates = others.filter(w => {
          const we = w.en.toLowerCase();
          return we[0] === en[0] ||
                 we.length === en.length ||
                 (we.length >= 2 && en.length >= 2 && we.slice(-2) === en.slice(-2));
        });
      }

      // 如果候选不够，用剩余词汇补齐
      if (candidates.length < count) {
        const usedSet = new Set(candidates);
        const remaining = others.filter(w => !usedSet.has(w));
        candidates = [...candidates, ...remaining];
      }

      // 随机取 count 个
      const picked = this._pickRandom(candidates, count);

      // 根据题型映射到对应字段
      const field = (qType === 'en2cn' || qType === 'listening') ? 'cn' : 'en';
      return picked.map(w => w[field]);
    },

    /**
     * 从数组中随机取 count 个元素（Fisher-Yates 洗牌）
     * @param {Array} arr
     * @param {number} count
     * @returns {Array}
     */
    _pickRandom(arr, count) {
      const shuffled = this._shuffle(arr);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    },

    /**
     * Fisher-Yates 洗牌算法
     * @param {Array} arr
     * @returns {Array}
     */
    _shuffle(arr) {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },

    /**
     * 答题
     * @param {number} selectedIndex - 所选选项的索引
     * @returns {boolean} 是否正确
     */
    answer(selectedIndex) {
      if (!this.isPlaying || !this.currentQuestion) return false;

      const isCorrect = selectedIndex === this.currentQuestion.correctIndex;

      // 记录错题到英语知识库
      const englishKnowledgeStore = useEnglishKnowledgeStore();
      const knowledgeNodeId = this.currentQuestion.type; // 'en2cn' | 'cn2en' | 'listening'
      if (knowledgeNodeId) {
        englishKnowledgeStore.recordResult(knowledgeNodeId, isCorrect);
      }

      return baseAnswer(this, isCorrect, {
        onCorrect: () => this.updateAI(),
        generateFn: () => this.generateQuestion()
      });
    },

    /**
     * 更新 AI 进度（闪电模式）
     */
    updateAI() {
      const config = this.modeConfig;
      const aiTime = config.aiAnswerTime.min + Math.random() * (config.aiAnswerTime.max - config.aiAnswerTime.min);
      const aiSpeed = 1 / aiTime;
      this.aiProgress += aiSpeed * 0.5;
    },

    /**
     * 计时器滴答
     */
    tick() {
      baseTick(this, () => this.endGame());
    },

    /**
     * 结束游戏
     * 计算结算数据、更新最佳成绩、发放奖励
     */
    endGame() {
      const result = baseEndGame(this, speedSpellConfig);

      // 更新最佳成绩
      const gameStore = useGameStore();
      const modeKey = this.currentMode;
      if (!gameStore.englishSpeedSpell) {
        gameStore.englishSpeedSpell = { bestScores: {}, totalGames: 0, totalCorrect: 0 };
      }
      const currentBest = gameStore.englishSpeedSpell?.bestScores?.[modeKey];
      if (!currentBest || this.score > currentBest.score) {
        gameStore.englishSpeedSpell.bestScores[modeKey] = {
          score: this.score,
          rating: result.rating,
          date: Date.now()
        };
      }
      gameStore.englishSpeedSpell.totalGames = (gameStore.englishSpeedSpell.totalGames || 0) + 1;
      gameStore.englishSpeedSpell.totalCorrect = (gameStore.englishSpeedSpell.totalCorrect || 0) + this.correctCount;

      // 发放奖励
      gameStore.addCoins(result.coins);
      if (result.gems > 0) gameStore.addGems(result.gems);
      gameStore.saveGame();
    }
  }
});

export default useEnglishSpeedSpellStore;
