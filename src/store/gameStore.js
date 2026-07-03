/**
 * 游戏主 Store - 管理游戏全局状态
 */
import { defineStore } from 'pinia';
import storageManager from '../utils/storage';
import { useSettingsStore } from './settingsStore';
import { useBattleStore } from './battleStore';
import { useAchievementStore } from './achievementStore';
import { useEquipmentStore } from './equipmentStore';
import { useSpeedChallengeStore } from './speedChallengeStore';
import { useSaveDataStore } from './saveDataStore';
import { useQuestionStore } from './questionStore';
import { useCardStore } from './cardStore';
import { useInventoryStore } from './inventoryStore';
import { useEnglishSpeedSpellStore } from './englishSpeedSpellStore';
import { useEnglishGrammarStore } from './englishGrammarStore';
import { useMathKnowledgeStore } from './mathKnowledgeStore';
import { useEnglishKnowledgeStore } from './englishKnowledgeStore';
import { useEnglishSpiritStore } from './englishSpiritStore';
import { useEnglishAdventureStore } from './englishAdventureStore';

export const useGameStore = defineStore('game', {
  state: () => ({
    player: null,
    progress: null,
    inventory: null,
    settings: null,
    isLoaded: false,
    currentMode: null, // 'adventure' | 'shop' | 'challenge_center' | null
    playerGems: 0, // 钻石
    playerStars: 0, // 星星
    // 新玩法数据
    speedChallenge: null,
    cardBattle: null,
    leaderboard: null,
    notifications: [],
    englishSpeedSpell: null,
    grammarProgress: null,
    // 英语冒险扩展
    englishSpirits: null,
    englishAdventureProgress: null
  }),

  getters: {
    // 玩家相关
    playerName: (state) => state.player?.name || '冒险者',
    playerGrade: (_state) => {
      const settingsStore = useSettingsStore();
      return settingsStore.gradeRange.max;
    },
    playerLevel: (state) => state.player?.level || 1,
    playerExp: (state) => state.player?.exp || 0,
    playerCoins: (state) => state.player?.coins || 0,

    // 进度相关
    adventureLevel: (state) => state.progress?.adventureLevel || 1,
    shopLevel: (state) => state.progress?.shopLevel || 1,
    unlockedAreas: (state) => state.progress?.unlockedAreas || [],

    // 设置相关
    isSoundOn: (state) => state.settings?.sound ?? true,
    isMusicOn: (state) => state.settings?.music ?? true,
    difficulty: (state) => state.settings?.difficulty || 'normal',

    // 库存相关
    equipment: (state) => state.inventory?.equipment || {},
    items: (state) => state.inventory?.items || []

  },

  actions: {
    /**
     * 初始化游戏 - 从存储加载数据
     */
    async initGame() {
      const gameData = storageManager.loadGame();

      // 空值检查：当存档版本不匹配时 loadGame() 返回 null
      if (!gameData) {
        this.isLoaded = false;
        return false;
      }

      if (gameData.player) {
        this.player = gameData.player;
        this.progress = gameData.progress;
        this.inventory = gameData.inventory;
        this.settings = gameData.settings;
        this.isLoaded = true;
        
        // 加载双货币
        this.playerGems = gameData.player?.gems || 0;
        this.playerStars = gameData.player?.stars || 0;
        
        // 加载新玩法数据（向后兼容）
        this.speedChallenge = gameData.speedChallenge || this.getDefaultSpeedChallenge();
        this.cardBattle = gameData.cardBattle || this.getDefaultCardBattle();
        this.leaderboard = gameData.leaderboard || this.getDefaultLeaderboard();
        this.notifications = gameData.notifications || [];
        this.englishSpeedSpell = gameData.englishSpeedSpell || null;
        this.grammarProgress = gameData.grammarProgress || null;
        // 英语冒险扩展数据
        this.englishSpirits = gameData.englishSpirits ?? null;
        this.englishAdventureProgress = gameData.englishAdventureProgress ?? null;
      }
      
      return this.isLoaded;
    },

    /**
     * 创建新游戏
     */
    async newGame(playerName, grade = 1) {
      const gameData = storageManager.createNewGame(playerName, grade);
      
      this.player = gameData.player;
      this.progress = gameData.progress;
      this.inventory = gameData.inventory;
      this.settings = gameData.settings;
      this.isLoaded = true;
      this.currentMode = null;
      this.playerGems = 0;
      this.playerStars = 0;
      this.speedChallenge = this.getDefaultSpeedChallenge();
      this.cardBattle = this.getDefaultCardBattle();
      this.leaderboard = this.getDefaultLeaderboard();
      this.notifications = [];
      this.englishSpeedSpell = null;
      this.grammarProgress = null;
      this.englishSpirits = null;
      this.englishAdventureProgress = null;
    },

    /**
     * 重置游戏
     */
    async resetGame() {
      storageManager.resetGame();
      this.$reset();
    },

    /**
     * 重置所有游戏进度（由 handleReset 调用）
     * 集中管理所有 store 的重置，避免 GameApp.vue 直接依赖大量 store
     * @returns {Promise<void>}
     */
    resetAllProgress() {
      this.$reset();
      useBattleStore().$reset();
      useAchievementStore().$reset();
      useEquipmentStore().$reset();
      useSpeedChallengeStore().$reset();
      useSaveDataStore().$reset();
      useQuestionStore().$reset();
      useCardStore().$reset();
      useInventoryStore().$reset();
      useEnglishSpeedSpellStore().$reset();
      useEnglishGrammarStore().$reset();
      useMathKnowledgeStore().$reset();
      useEnglishKnowledgeStore().$reset();
      useEnglishSpiritStore().$reset();
      useEnglishAdventureStore().$reset();
    },

    /**
     * 设置当前游戏模式
     */
    setGameMode(mode) {
      this.currentMode = mode;
    },

    /**
     * 更新玩家数据
     */
    updatePlayer(updates) {
      if (this.player) {
        Object.assign(this.player, updates);
        this.saveGame();
      }
    },

    /**
     * 增加经验值
     * @param {number} amount - 经验值数量
     * @returns {boolean} 是否触发升级
     */
    addExp(amount) {
      if (!this.player) return false;
      const leveledUp = this.player.addExp(amount);
      this.saveGame();
      return leveledUp;
    },

    /**
     * 增加金币
     * @param {number} amount - 金币数量
     * @returns {void}
     */
    addCoins(amount) {
      if (!this.player) return;
      this.player.coins += amount;
      this.saveGame();
    },

    /**
     * 消费金币
     * @param {number} amount - 消费金额
     * @returns {boolean} 是否消费成功（余额不足时返回 false）
     */
    spendCoins(amount) {
      if (!this.player) return false;
      const result = this.player.spendCoins(amount);
      if (result) {
        this.saveGame();
      }
      return result;
    },

    /**
     * 更新游戏进度
     */
    updateProgress(updates) {
      if (this.progress) {
        Object.assign(this.progress, updates);
        this.saveGame();
      }
    },

    /**
     * 完成关卡
     */
    completeLevel(levelId, stars = 1) {
      if (this.progress) {
        this.progress.completeLevel(levelId, stars);
        this.saveGame();
      }
    },

    /**
     * 解锁区域
     */
    unlockArea(areaId) {
      if (this.progress) {
        return this.progress.unlockArea(areaId);
      }
      return false;
    },

    /**
     * 更新设置
     */
    updateSettings(updates) {
      if (this.settings) {
        Object.assign(this.settings, updates);
        this.saveGame();
      }
    },

    /**
     * 添加物品到库存
     */
    addItem(item) {
      if (this.inventory) {
        this.inventory.addItem(item);
        this.saveGame();
      }
    },

    /**
     * 从库存移除物品
     */
    removeItem(itemId, quantity = 1) {
      if (this.inventory) {
        return this.inventory.removeItem(itemId, quantity);
      }
      return false;
    },

    /**
     * 装备物品
     */
    equipItem(item) {
      if (this.inventory) {
        return this.inventory.equipItem(item);
      }
      return null;
    },

    /**
     * 添加收藏品
     */
    addCollectible(collectible) {
      if (this.inventory) {
        return this.inventory.addCollectible(collectible);
      }
      return false;
    },

    /**
     * 增加钻石
     */
    addGems(amount) {
      if (!this.player) return;
      this.$patch({
        playerGems: this.playerGems + amount
      });
      this.saveGame();
    },

    /**
     * 消费钻石
     */
    spendGems(amount) {
      if (this.playerGems >= amount) {
        this.$patch({
          playerGems: this.playerGems - amount
        });
        this.saveGame();
        return true;
      }
      return false;
    },

    /**
     * 增加星星
     */
    addStars(amount) {
      if (!this.player) return;
      this.$patch({
        playerStars: this.playerStars + amount
      });
      this.saveGame();
    },

    /**
     * 获取默认速算数据
     */
    getDefaultSpeedChallenge() {
      return {
        bestScores: {}, // { mode: { score, rating, date } }
        totalGames: 0,
        totalCorrect: 0
      };
    },

    /**
     * 获取默认卡牌数据
     */
    getDefaultCardBattle() {
      return {
        collection: [], // { cardId, quantity }
        deck: [], // cardId[]
        battleStats: { wins: 0, losses: 0, totalBattles: 0 }
      };
    },

    /**
     * 获取默认排行榜数据
     */
    getDefaultLeaderboard() {
      return {
        virtualPlayers: [],
        playerBest: {}, // { mode: { score, date } }
        lastGenerated: null
      };
    },

    /**
     * 获取默认英语速拼数据
     */
    getDefaultEnglishSpeedSpell() {
      return {
        bestScores: {}, // { mode: { score, rating, date } }
        totalGames: 0,
        totalCorrect: 0
      };
    },

    /**
     * 保存完整游戏存档到 localStorage
     * 包含 player、progress、inventory、settings 及扩展玩法数据
     * @returns {void}
     */
    saveGame() {
      if (this.player && this.progress && this.inventory && this.settings) {
        // 保存玩家货币到 player 对象
        const playerData = {
          ...this.player,
          gems: this.playerGems,
          stars: this.playerStars
        };
        
        storageManager.saveGame(
          playerData,
          this.progress,
          this.inventory,
          this.settings,
          {
            speedChallenge: this.speedChallenge,
            cardBattle: this.cardBattle,
            leaderboard: this.leaderboard,
            notifications: this.notifications,
            englishSpeedSpell: this.englishSpeedSpell,
            grammarProgress: this.grammarProgress,
            englishSpirits: this.englishSpirits,
            englishAdventureProgress: this.englishAdventureProgress
          }
        );
      }
    }
  }
});

export default useGameStore;
