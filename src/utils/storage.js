/**
 * LocalStorage 数据存储管理器
 */
import Player from '../models/Player';
import GameProgress from '../models/GameProgress';
import Inventory from '../models/Inventory';
import Settings from '../models/Settings';

const STORAGE_KEYS = {
  PLAYER: 'math_game_player',
  PROGRESS: 'math_game_progress',
  INVENTORY: 'math_game_inventory',
  SETTINGS: 'math_game_settings',
  VERSION: 'math_game_version',
  // 新增玩法数据
  SPEED_CHALLENGE: 'math_game_speed_challenge',
  CARD_BATTLE: 'math_game_card_battle',
  LEADERBOARD: 'math_game_leaderboard',
  NOTIFICATIONS: 'math_game_notifications',
  ENGLISH_SPEED_SPELL: 'math_game_english_speed_spell',
  // 知识管理系统
  MATH_KNOWLEDGE: 'math_game_math_knowledge',
  ENGLISH_KNOWLEDGE: 'math_game_english_knowledge',
  WEIGHT_OVERRIDES: 'math_game_weight_overrides',
  KNOWLEDGE_CONFIG: 'math_game_knowledge_config',
  // 自定义题目模板系统
  CUSTOM_TEMPLATES: 'math_game_custom_templates',
  TEMPLATE_CONFIG: 'math_game_template_config',
  // 管理面板
  ADMIN_PIN: 'math_game_admin_pin',
  // 英语模块扩展
  ENGLISH_SPIRITS: 'math_game_english_spirits',
  ENGLISH_ADVENTURE: 'math_game_english_adventure',
  // 卡牌系统独立持久化
  CARDS: 'math_game_cards'
};

const VERSION = '3.1.0';

class StorageManager {
  constructor() {
    this.currentVersion = VERSION;
  }

  /**
   * 检查存储版本
   */
  checkVersion() {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (!storedVersion) {
      return null;
    }
    if (storedVersion !== this.currentVersion) {
      console.warn(`旧版本存档检测到(v${storedVersion})，将在加载时自动清理重置为新版本`);
    }
    return storedVersion;
  }

  /**
   * 更新存储版本
   */
  updateVersion() {
    localStorage.setItem(STORAGE_KEYS.VERSION, this.currentVersion);
  }

  /**
   * 安全执行 localStorage.setItem，捕获 QuotaExceededError
   */
  _safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
        console.warn('localStorage 容量不足，无法保存数据:', key);
      } else {
        console.error('localStorage 写入失败:', key, e);
      }
      return false;
    }
  }

  /**
   * 安全加载可选数据（解析失败时返回 null 并记录警告）
   * @param {string} storageKey - localStorage 的 key
   * @param {string} label - 日志标签，用于标识数据来源
   * @returns {any|null} 解析后的数据或 null
   */
  _loadOptionalData(storageKey, label) {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn(`Failed to parse ${label} data, resetting:`, e.message);
      return null;
    }
  }

  /**
   * 保存玩家数据
   */
  savePlayer(player) {
    const data = player instanceof Player ? player.toStorage() : player;
    this._safeSetItem(STORAGE_KEYS.PLAYER, JSON.stringify(data));
  }

  /**
   * 加载玩家数据
   */
  loadPlayer() {
    const data = localStorage.getItem(STORAGE_KEYS.PLAYER);
    if (data) {
      try {
        return Player.fromStorage(JSON.parse(data));
      } catch (e) {
        console.error('加载玩家数据失败:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * 保存游戏进度
   */
  saveProgress(progress) {
    const data = progress instanceof GameProgress ? progress.toStorage() : progress;
    this._safeSetItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
  }

  /**
   * 加载游戏进度
   */
  loadProgress() {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (data) {
      try {
        return GameProgress.fromStorage(JSON.parse(data));
      } catch (e) {
        console.error('加载游戏进度失败:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * 保存库存
   */
  saveInventory(inventory) {
    const data = inventory instanceof Inventory ? inventory.toStorage() : inventory;
    this._safeSetItem(STORAGE_KEYS.INVENTORY, JSON.stringify(data));
  }

  /**
   * 加载库存
   */
  loadInventory() {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (data) {
      try {
        return Inventory.fromStorage(JSON.parse(data));
      } catch (e) {
        console.error('加载库存失败:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * 保存设置
   */
  saveSettings(settings) {
    const data = settings instanceof Settings ? settings.toStorage() : settings;
    this._safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
  }

  /**
   * 加载设置
   */
  loadSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      try {
        return Settings.fromStorage(JSON.parse(data));
      } catch (e) {
        console.error('加载设置失败:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * 保存完整游戏存档
   * @param {Object|Player} player - 玩家数据或 Player 实例
   * @param {Object|GameProgress} progress - 游戏进度或 GameProgress 实例
   * @param {Object|Inventory} inventory - 库存或 Inventory 实例
   * @param {Object|Settings} settings - 设置或 Settings 实例
   * @param {Object} [extraData] - 扩展数据（speedChallenge, cardBattle 等）
   * @returns {void}
   */
  saveGame(player, progress, inventory, settings, extraData = {}) {
    const allSaved = this.savePlayer(player) !== false &&
      this.saveProgress(progress) !== false &&
      this.saveInventory(inventory) !== false &&
      this.saveSettings(settings) !== false;

    // 额外数据也使用 _safeSetItem（不抛出异常，返回 boolean）
    const extraKeys = {
      speedChallenge: STORAGE_KEYS.SPEED_CHALLENGE,
      cardBattle: STORAGE_KEYS.CARD_BATTLE,
      leaderboard: STORAGE_KEYS.LEADERBOARD,
      notifications: STORAGE_KEYS.NOTIFICATIONS,
      englishSpeedSpell: STORAGE_KEYS.ENGLISH_SPEED_SPELL,
      mathKnowledge: STORAGE_KEYS.MATH_KNOWLEDGE,
      englishKnowledge: STORAGE_KEYS.ENGLISH_KNOWLEDGE,
      weightOverrides: STORAGE_KEYS.WEIGHT_OVERRIDES,
      knowledgeConfig: STORAGE_KEYS.KNOWLEDGE_CONFIG,
      englishSpirits: STORAGE_KEYS.ENGLISH_SPIRITS,
      englishAdventureProgress: STORAGE_KEYS.ENGLISH_ADVENTURE
    };

    let extraSaved = true;
    for (const [key, storageKey] of Object.entries(extraKeys)) {
      if (extraData[key]) {
        extraSaved = this._safeSetItem(storageKey, JSON.stringify(extraData[key])) && extraSaved;
      }
    }

    // 仅在所有数据保存成功后更新版本
    if (allSaved && extraSaved) {
      this.updateVersion();
    } else {
      console.warn('saveGame: 部分数据保存失败，版本号未更新');
    }
  }

  /**
   * 加载完整游戏存档
   */
  loadGame() {
    // 版本检测：旧版本存档自动清理重置
    const storedVersion = this.checkVersion();
    if (storedVersion !== null && storedVersion !== this.currentVersion) {
      this.resetGame();
      return null;
    }

    const baseData = {
      player: this.loadPlayer(),
      progress: this.loadProgress(),
      inventory: this.loadInventory(),
      settings: this.loadSettings(),
      version: this.checkVersion()
    };
    
    // 批量加载扩展数据（向后兼容：旧存档对应字段返回 null）
    const optionalKeys = [
      { key: 'speedChallenge', storageKey: STORAGE_KEYS.SPEED_CHALLENGE },
      { key: 'cardBattle', storageKey: STORAGE_KEYS.CARD_BATTLE },
      { key: 'leaderboard', storageKey: STORAGE_KEYS.LEADERBOARD },
      { key: 'notifications', storageKey: STORAGE_KEYS.NOTIFICATIONS },
      { key: 'englishSpeedSpell', storageKey: STORAGE_KEYS.ENGLISH_SPEED_SPELL },
      { key: 'mathKnowledge', storageKey: STORAGE_KEYS.MATH_KNOWLEDGE },
      { key: 'englishKnowledge', storageKey: STORAGE_KEYS.ENGLISH_KNOWLEDGE },
      { key: 'weightOverrides', storageKey: STORAGE_KEYS.WEIGHT_OVERRIDES },
      { key: 'knowledgeConfig', storageKey: STORAGE_KEYS.KNOWLEDGE_CONFIG },
      { key: 'englishSpirits', storageKey: STORAGE_KEYS.ENGLISH_SPIRITS },
      { key: 'englishAdventureProgress', storageKey: STORAGE_KEYS.ENGLISH_ADVENTURE }
    ];
    for (const { key, storageKey } of optionalKeys) {
      baseData[key] = this._loadOptionalData(storageKey, key);
    }
    
    return baseData;
  }

  /**
   * 创建新游戏存档
   */
  createNewGame(playerName, grade = 1) {
    const player = new Player({ name: playerName });
    const progress = new GameProgress({ unlockedAreas: ['area_1'] });
    const inventory = new Inventory();
    const settings = new Settings({ grade });

    this.saveGame(player, progress, inventory, settings);

    return { player, progress, inventory, settings };
  }

  /**
   * 清理并修复损坏的设置数据
   */
  migrateSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return false;
    
    try {
      const settings = JSON.parse(data);
      let migrated = false;
      
      // 修复音量值：如果 > 1，说明存储的是百分比格式，需要转换为 0-1 范围
      if (typeof settings.musicVolume === 'number' && settings.musicVolume > 1) {
        settings.musicVolume = Math.max(0, Math.min(1, settings.musicVolume / 100));
        migrated = true;
      }
      
      if (typeof settings.soundVolume === 'number' && settings.soundVolume > 1) {
        settings.soundVolume = Math.max(0, Math.min(1, settings.soundVolume / 100));
        migrated = true;
      }
      
      // 如果进行了修复，保存回 localStorage
      if (migrated) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        console.log('Settings migrated - fixed volume values');
      }
      
      return migrated;
    } catch (e) {
      console.error('Settings migration failed:', e);
      return false;
    }
  }

  /**
   * 重置游戏（保留设置）
   */
  resetGameKeepSettings() {
    const excludeKeys = ['SETTINGS', 'MATH_KNOWLEDGE', 'ENGLISH_KNOWLEDGE', 'WEIGHT_OVERRIDES', 'KNOWLEDGE_CONFIG'];
    Object.entries(STORAGE_KEYS).forEach(([key, value]) => {
      if (!excludeKeys.includes(key)) {
        localStorage.removeItem(value);
      }
    });
  }

  /**
   * 重置游戏
   */
  resetGame() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * 清除所有数据
   */
  clearAll() {
    localStorage.clear();
  }

  /**
   * 导出数据
   */
  exportData() {
    const exportObj = {};
    Object.keys(STORAGE_KEYS).forEach(key => {
      const value = localStorage.getItem(STORAGE_KEYS[key]);
      if (value) {
        exportObj[key] = value;
      }
    });
    return JSON.stringify(exportObj, null, 2);
  }

  /**
   * 导入数据
   */
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      Object.keys(data).forEach(key => {
        if (STORAGE_KEYS[key]) {
          localStorage.setItem(STORAGE_KEYS[key], data[key]);
        }
      });
      return true;
    } catch (e) {
      console.error('导入数据失败:', e);
      return false;
    }
  }
}

// 创建单例
const storageManager = new StorageManager();

export default storageManager;
export { StorageManager, STORAGE_KEYS };
