<template>
  <div class="game-app">
    <header class="game-header">
      <h1>🏰 数学王国大冒险</h1>
    </header>

    <!-- 导航栏 -->
    <GameNavbar
      v-if="currentView !== 'menu'"
      :current-mode="currentMode"
      :view-title="currentViewTitle"
      :player-name="playerInfo.name"
      :player-coins="playerInfo.coins"
      :player-gems="playerInfo.gems"
      :player-stars="playerInfo.stars"
      :player-level="playerInfo.level"
      @navigate="goBack"
      @open-menu="goToMenu"
      @open-settings="openSettings"
      @open-inventory="openInventoryFromNavbar"
    />

    <!-- 主内容区 - 使用动态组件注册表渲染 -->
    <main class="game-main">
      <component :is="viewComponent" v-bind="viewProps" v-on="viewEvents" />

      <!-- 成就弹窗（由 showAchievements 布尔控制，不归入 currentView 体系） -->
      <AchievementView
        v-if="showAchievements"
        :unlocked-achievements="achievementStore.unlockedAchievements"
        :total-rewards="achievementStore.totalRewards"
        :completion-rate="achievementStore.completionRate"
        @close="closeAchievements"
      />

      <!-- 设置弹窗（由 showSettings 布尔控制，不归入 currentView 体系） -->
      <SettingsPanel
        v-if="showSettings"
        :settings="settings"
        @close="closeSettings"
        @update="updateSettings"
        @export="handleExport"
        @import="handleImport"
        @reset="handleReset"
      />
    </main>

    <!-- 音频控制器 -->
    <AudioControls />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useGameStore } from '../store/gameStore';
import { useAudioStore } from '../store/audioStore';
import { useSettingsStore } from '../store/settingsStore';
import { useAchievementStore } from '../store/achievementStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSpeedChallengeStore } from '../store/speedChallengeStore';
import { useEnglishSpeedSpellStore } from '../store/englishSpeedSpellStore';
import { useEnglishGrammarStore } from '../store/englishGrammarStore';
import { useEnglishSpiritStore } from '../store/englishSpiritStore';
import { useEnglishAdventureStore } from '../store/englishAdventureStore';
import { useMathKnowledgeStore } from '../store/mathKnowledgeStore';
import { useEnglishKnowledgeStore } from '../store/englishKnowledgeStore';
import { useCustomTemplateStore } from '../store/customTemplateStore';
import storageManager from '../utils/storage';
import audioManager from '../utils/audioManager';
import adventureConfig from '../config/adventure';
import { getGameConfig } from '../utils/gameContext';

// 始终加载的核心组件（首屏必需）
import MainMenu from './MainMenu.vue';
import GameNavbar from './GameNavbar.vue';
import AudioControls from './AudioControls.vue';

// 懒加载重型视图组件 — 首屏不立即加载，首次使用时才加载
const AdventureMap = defineAsyncComponent(() => import('./AdventureMap.vue'));
const BattleGame = defineAsyncComponent(() => import('./BattleGame.vue'));
const MarketChallenge = defineAsyncComponent(() => import('./MarketChallenge.vue'));
const AchievementView = defineAsyncComponent(() => import('./AchievementView.vue'));
const SettingsPanel = defineAsyncComponent(() => import('./SettingsPanel.vue'));
const GameHall = defineAsyncComponent(() => import('./GameHall.vue'));
const SpeedChallenge = defineAsyncComponent(() => import('./SpeedChallenge.vue'));
const WordFillChallenge = defineAsyncComponent(() => import('./WordFillChallenge.vue'));
const CardBattle = defineAsyncComponent(() => import('./CardBattle.vue'));
const CardCollection = defineAsyncComponent(() => import('./CardCollection.vue'));
const CardPack = defineAsyncComponent(() => import('./CardPack.vue'));
const Leaderboard = defineAsyncComponent(() => import('./Leaderboard.vue'));
const LevelSelect = defineAsyncComponent(() => import('./LevelSelect.vue'));
const InventoryView = defineAsyncComponent(() => import('./InventoryView.vue'));
const BattlePrepare = defineAsyncComponent(() => import('./BattlePrepare.vue'));
const EnglishHall = defineAsyncComponent(() => import('./EnglishHall.vue'));
const EnglishSpeedSpell = defineAsyncComponent(() => import('./EnglishSpeedSpell.vue'));
const EnglishGrammar = defineAsyncComponent(() => import('./EnglishGrammar.vue'));
const EnglishGrammarGame = defineAsyncComponent(() => import('./EnglishGrammarGame.vue'));
const TargetedTraining = defineAsyncComponent(() => import('./TargetedTraining.vue'));
const ReviewSession = defineAsyncComponent(() => import('./ReviewSession.vue'));
const AdminPage = defineAsyncComponent(() => import('./AdminPage.vue'));
const EnglishAdventureMap = defineAsyncComponent(() => import('./EnglishAdventureMap.vue'));
const EnglishSpiritCollection = defineAsyncComponent(() => import('./EnglishSpiritCollection.vue'));
const EnglishRegionBattle = defineAsyncComponent(() => import('./EnglishRegionBattle.vue'));
const CardWorld = defineAsyncComponent(() => import('./CardWorld.vue'));
const ClockGame = defineAsyncComponent(() => import('./ClockGame.vue'));
const ProbabilityLab = defineAsyncComponent(() => import('./ProbabilityLab.vue'));
const GeometryGame = defineAsyncComponent(() => import('./GeometryGame.vue'));
const UnitGame = defineAsyncComponent(() => import('./UnitGame.vue'));
const ChartGame = defineAsyncComponent(() => import('./ChartGame.vue'));
const KnowledgeCenter = defineAsyncComponent(() => import('./KnowledgeCenter.vue'));

const gameStore = useGameStore();
const audioStore = useAudioStore();
const settingsStore = useSettingsStore();
const achievementStore = useAchievementStore();
const notificationStore = useNotificationStore();
const speedChallengeStore = useSpeedChallengeStore();
const englishSpeedSpellStore = useEnglishSpeedSpellStore();
const englishGrammarStore = useEnglishGrammarStore();

const currentView = ref('menu');
const previousView = ref(null);
const showSettings = ref(false);
const showAchievements = ref(false);
const unlockedAreas = ref(['area_1']);
const currentAreaId = ref('area_1');
const selectedArea = ref(null);
const selectedLevel = ref(null);
// 战斗数据（用于传递给 BattleGame）
const battlePlayer = computed(() => ({
  name: gameStore.playerName,
  hp: gameStore.player?.hp || 100,
  maxHp: gameStore.player?.maxHp || 100,
  attack: gameStore.player?.attack || 10,
  defense: gameStore.player?.defense || 5,
  luck: gameStore.player?.luck || 0,
  equipmentBonus: gameStore.player?.equipmentBonus || {}
}));

const battleMonster = ref(null);
const battleGrade = ref(1);
const battleStreak = ref(0);
const battleDifficultyScale = ref(null);

// 获取设置对象
const settings = computed(() => ({
  sound: settingsStore.sound,
  music: settingsStore.music,
  musicVolume: settingsStore.musicVolume * 100,
  soundVolume: settingsStore.soundVolume * 100,
  difficulty: settingsStore.difficulty,
  gradeRange: { ...settingsStore.gradeRange },
  grade: settingsStore.gradeRange.max,
  language: settingsStore.language,
  showTutorial: settingsStore.showTutorial
}));

// 玩家信息
const playerInfo = computed(() => ({
  name: gameStore.playerName,
  level: gameStore.playerLevel,
  coins: gameStore.playerCoins,
  gems: gameStore.playerGems,
  stars: gameStore.playerStars,
  grade: settingsStore.gradeRange.max
}));

// 视图标题映射 —— 每个视图显示各自的具体名称
const viewTitleMap = {
  // 数学乐园子功能
  challenge: '数学乐园',
  geometryGame: '几何王国',
  unitGame: '单位大冒险',
  chartGame: '统计图表',
  speedChallenge: '速算竞技场',
  wordFill: '应用与填空',
  clock: '钟表学院',
  probability: '概率实验室',
  market: '超市大挑战',
  targetedTraining: '针对性训练',
  review: '复习模式',
  leaderboard: '排行榜',
  // 英语乐园子功能
  englishHall: '英语乐园',
  englishSpeedSpell: '单词速拼',
  englishGrammar: '语法城堡',
  englishGrammarGame: '语法闯关',
  englishAdventureMap: '英语冒险',
  englishSpiritCollection: '精灵收集',
  englishRegionBattle: '区域对战',
  // 卡牌世界子功能
  cardWorld: '卡牌世界',
  cardBattle: '卡牌对战',
  cardCollection: '卡牌收藏',
  cardPack: '开卡包',
  // 其他
  adventure: '冒险模式',
  battle: '战斗中',
  levelSelect: '选择关卡',
  battlePrepare: '战斗准备',
  inventory: '背包',
  admin: '管理模式',
  menu: '主菜单'
};

const currentViewTitle = computed(() => {
  return viewTitleMap[currentView.value] || '';
});

// 当前模式
const currentMode = computed(() => {
  if (currentView.value === 'adventure' || currentView.value === 'battle' || currentView.value === 'levelSelect' || currentView.value === 'battlePrepare') {
    return 'adventure';
  }
  if (currentView.value === 'market') {
    return 'market';
  }
  if (currentView.value === 'inventory') {
    return 'inventory';
  }
  if (currentView.value === 'challenge' || currentView.value === 'speedChallenge' ||
    currentView.value === 'wordFill' || currentView.value === 'cardBattle' ||
    currentView.value === 'cardCollection' || currentView.value === 'cardPack' ||
    currentView.value === 'cardWorld' || currentView.value === 'clock' ||
    currentView.value === 'probability' || currentView.value === 'geometryGame' ||
    currentView.value === 'unitGame' || currentView.value === 'chartGame' ||
    currentView.value === 'targetedTraining' ||
    currentView.value === 'leaderboard' || currentView.value === 'review') {
    return 'challenge_center';
  }
  if (currentView.value === 'englishHall' || currentView.value === 'englishSpeedSpell' ||
    currentView.value === 'englishGrammar' || currentView.value === 'englishGrammarGame' ||
    currentView.value === 'englishAdventureMap' || currentView.value === 'englishSpiritCollection' ||
    currentView.value === 'englishRegionBattle') {
    return 'english';
  }
  if (currentView.value === 'admin') {
    return 'admin';
  }
  return 'menu';
});

// 显示关卡选择界面
const showLevelSelect = (area) => {
  previousView.value = currentView.value;
  selectedArea.value = area;
  currentView.value = 'levelSelect';
};

// 从关卡选择进入战斗（先进入战斗准备界面）
const onLevelSelect = ({ area, level }) => {
  selectedLevel.value = level;
  selectedArea.value = area;
  previousView.value = currentView.value;
  currentView.value = 'battlePrepare';
};

// 从战斗准备界面进入战斗
const onBattlePrepareStart = () => {
  if (!selectedArea.value || !selectedLevel.value) {
    notificationStore.show('请先从冒险模式选择关卡', 'error');
    return;
  }
  startBattle(selectedArea.value, selectedLevel.value);
};

// 从导航栏打开背包
const openInventoryFromNavbar = () => {
  previousView.value = currentView.value;
  currentView.value = 'inventory';
};

// 从背包视图打开战斗准备
const openBattlePrepareFromInventory = () => {
  previousView.value = currentView.value;
  currentView.value = 'battlePrepare';
};

// 开始战斗

// 怪物平衡参数
const MONSTER_BASE_HP = 20;        // 基础血量
const MONSTER_HP_PER_LEVEL = 5;    // 每级血量增量
const MONSTER_BASE_ATTACK = 5;     // 基础攻击
const MONSTER_ATTACK_PER_LEVEL = 2; // 每级攻击增量
const MONSTER_MAX_DIFFICULTY = 5;  // 最大怪物难度等级
const MONSTER_DIFFICULTY_PER_LEVELS = 2; // 每2关升1级难度
const MONSTER_DEFENSE_PER_LEVELS = 3;    // 每3关+1防御

const startBattle = (area, level) => {
  previousView.value = currentView.value;
  
  // 根据区域和关卡计算怪物和年级
  const grade = area.gradeRange[0];
  const monsterDifficulty = Math.min(MONSTER_MAX_DIFFICULTY, Math.ceil(level.number / MONSTER_DIFFICULTY_PER_LEVELS));
  
  // 从配置中获取怪物
  const monsters = adventureConfig.monsters;
  const monsterIndex = Math.min(monsters.length - 1, monsterDifficulty - 1);
  const baseMonster = monsters[monsterIndex];
  
  // 根据关卡调整怪物血量
  const baseHp = MONSTER_BASE_HP + level.number * MONSTER_HP_PER_LEVEL;
  const baseAttack = MONSTER_BASE_ATTACK + level.number * MONSTER_ATTACK_PER_LEVEL;
  battleMonster.value = {
    ...baseMonster,
    hp: baseHp,
    currentHp: baseHp,
    attack: baseAttack,
    defense: Math.max(1, Math.floor(level.number / MONSTER_DEFENSE_PER_LEVELS)),
    difficulty: monsterDifficulty,
    color: area.color,
    maxHp: baseHp
    // icon 已通过 ...baseMonster 从怪物配置中获取，不再硬编码覆盖
  };
  
  // 获取难度配置并应用到怪物
  const gameConfig = getGameConfig(settingsStore.gradeRange.max, settingsStore.difficulty);
  const scale = gameConfig.scale;

  battleMonster.value = {
    ...battleMonster.value,
    hp: Math.floor(baseHp * scale.monsterHpRatio),
    currentHp: Math.floor(baseHp * scale.monsterHpRatio),
    attack: Math.floor(baseAttack * scale.monsterAttackRatio)
  };
  battleDifficultyScale.value = scale;
  
  battleGrade.value = grade;
  battleStreak.value = 0;
  
  currentView.value = 'battle';
  audioStore.playBgm('battle');
};

// 打开成就
const openAchievements = () => {
  showAchievements.value = true;
};

// 打开设置
const openSettings = () => {
  showSettings.value = true;
};

// 关闭设置
const closeSettings = () => {
  showSettings.value = false;
};

// 关闭成就
const closeAchievements = () => {
  showAchievements.value = false;
};

// 返回
const goBack = () => {
  if (previousView.value) {
    currentView.value = previousView.value;
    previousView.value = null;
  } else {
    currentView.value = 'menu';
  }
  audioStore.playBgm('main');
};

// 返回主菜单
const goToMenu = () => {
  previousView.value = currentView.value;
  currentView.value = 'menu';
  gameStore.setGameMode(null);
  audioStore.playBgm('main');
};

// 更新设置
const updateSettings = (newSettings) => {
  Object.entries(newSettings).forEach(([key, value]) => {
    // 转换音量值（UI 显示 0-100，store 存 0-1）
    if ((key === 'musicVolume' || key === 'soundVolume') && typeof value === 'number') {
      value = value / 100;
    }
    // 先更新 store 持久化
    settingsStore.updateSetting(key, value);

    // 同步到音频播放系统
    switch (key) {
    case 'musicVolume':
      audioStore.setBgmVolume(value);
      break;
    case 'soundVolume':
      audioStore.setSfxVolume(value);
      break;
    case 'music':
      if (value) {
        if (!audioManager.bgmEnabled) audioManager.toggleBgm();
      } else {
        if (audioManager.bgmEnabled) audioManager.toggleBgm();
      }
      break;
    case 'sound':
      if (value) {
        if (!audioManager.sfxEnabled) audioManager.toggleSfx();
      } else {
        if (audioManager.sfxEnabled) audioManager.toggleSfx();
      }
      break;
    }
  });
};

// 导出数据
const handleExport = () => {
  try {
    const exportData = {
      version: storageManager.currentVersion, // 使用存储系统版本号而非硬编码
      exportDate: new Date().toISOString(),
      settings: {
        sound: settingsStore.sound,
        music: settingsStore.music,
        musicVolume: settingsStore.musicVolume,
        soundVolume: settingsStore.soundVolume,
        difficulty: settingsStore.difficulty,
        grade: settingsStore.gradeRange.max,
        language: settingsStore.language,
        showTutorial: settingsStore.showTutorial
      },
      player: gameStore.player,
      progress: gameStore.progress,
      items: gameStore.items,
      playerName: gameStore.playerName,
      playerCoins: gameStore.playerCoins,
      playerGems: gameStore.playerGems,
      playerLevel: gameStore.playerLevel
    };
    
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `math-game-backup-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notificationStore.show('数据导出成功！', 'success');
  } catch (error) {
    console.error('Export failed:', error);
    notificationStore.show('数据导出失败：' + error.message, 'error');
  }
};

// 导入数据
const handleImport = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      // 验证数据格式
      if (!importData.version || !importData.settings) {
        throw new Error('无效的数据文件格式');
      }

      // 字段类型校验（防止恶意构造的 JSON）
      if (typeof importData.version !== 'string') {
        throw new Error('数据版本格式不正确');
      }

      // 版本兼容性检查：主版本号不同则拒绝导入
      const importMajor = importData.version.split('.')[0];
      const currentMajor = storageManager.currentVersion.split('.')[0];
      if (importMajor !== currentMajor) {
        throw new Error(`数据版本 ${importData.version} 与当前版本 ${storageManager.currentVersion} 不兼容，请重新导出数据`);
      }
      if (importData.settings && typeof importData.settings !== 'object') {
        throw new Error('设置数据格式不正确');
      }
      if (importData.player && typeof importData.player !== 'object') {
        throw new Error('玩家数据格式不正确');
      }
      if (importData.progress && typeof importData.progress !== 'object') {
        throw new Error('进度数据格式不正确');
      }

      // 数值范围校验
      if (importData.settings && typeof importData.settings.grade === 'number') {
        if (importData.settings.grade < 1 || importData.settings.grade > 6) {
          throw new Error('年级数据超出范围（1-6）');
        }
      }
      if (importData.settings && typeof importData.settings.musicVolume === 'number') {
        if (importData.settings.musicVolume < 0 || importData.settings.musicVolume > 1) {
          throw new Error('音量数据超出范围（0-1）');
        }
      }
      if (importData.settings && typeof importData.settings.soundVolume === 'number') {
        if (importData.settings.soundVolume < 0 || importData.settings.soundVolume > 1) {
          throw new Error('音量数据超出范围（0-1）');
        }
      }
      
      // 导入设置
      if (importData.settings) {
        Object.entries(importData.settings).forEach(([key, value]) => {
          // 归一化音量值：如果值 > 1，说明是百分比格式，需要转换为 0-1 范围
          if ((key === 'musicVolume' || key === 'soundVolume') && typeof value === 'number') {
            value = value > 1 ? value / 100 : value;
            value = Math.max(0, Math.min(1, value));
          }
          settingsStore.updateSetting(key, value);
        });
      }
      
      // 导入玩家数据（使用 $patch 确保响应式追踪）
      gameStore.$patch({
        player: importData.player || gameStore.player,
        progress: importData.progress || gameStore.progress,
        playerCoins: importData.playerCoins ?? gameStore.playerCoins,
        playerGems: importData.playerGems ?? gameStore.playerGems,
        playerLevel: importData.playerLevel ?? gameStore.playerLevel
      });
      if (importData.playerName && gameStore.player) {
        gameStore.player.name = importData.playerName;
      }
      
      // 保存游戏
      gameStore.saveGame();
      settingsStore.saveSettings();
      
      // 重新初始化所有 store，不刷新页面
      gameStore.$reset();
      await gameStore.initGame();
      settingsStore.loadSettings();
      currentView.value = 'menu';
      notificationStore.show('数据导入成功！', 'success');
    } catch (error) {
      console.error('Import failed:', error);
      notificationStore.show('数据导入失败：' + (error.message || '文件格式不正确'), 'error');
    }
  };
  input.click();
};

// 重置游戏进度
const handleReset = async () => {
  if (confirm('确定要重置游戏进度吗？此操作不可撤销！\n\n您的设置将保留，但所有游戏进度（关卡、金币、宝石等）将被清除。')) {
    // 备份当前设置，用于失败恢复（在 try 块外声明以在 catch 中可访问）
    let backupSettings = null;
    try {
      // 1. 备份当前设置（resetGameKeepSettings 会保留设置，但此处做运行时备份）
      backupSettings = settingsStore.$state;

      // 2. 创建新存档数据
      const playerName = gameStore.playerName || '冒险者';
      const grade = settingsStore.gradeRange.max || 1;

      // 3. 执行原子操作：先清除存储，然后立即创建新存档
      storageManager.resetGameKeepSettings();
      const newGameData = storageManager.createNewGame(playerName, grade);

      if (!newGameData || !newGameData.player) {
        throw new Error('创建新存档失败，请尝试刷新页面');
      }

      // 4. 成功后才重置所有 stores（通过 gameStore 统一管理，减少 GameApp 的 store 依赖）
      await gameStore.resetAllProgress();

      // 5. 重新加载数据
      await gameStore.initGame();
      settingsStore.loadSettings();
      currentView.value = 'menu';
      notificationStore.show('游戏进度已重置！', 'success');
    } catch (error) {
      console.error('Reset failed:', error);
      // 尝试从备份恢复设置
      if (backupSettings) {
        try {
          settingsStore.$patch(backupSettings);
          settingsStore.saveSettings();
        } catch (restoreErr) {
          console.error('恢复设置失败:', restoreErr);
        }
      }
      notificationStore.show('重置失败：' + error.message + '。原有设置已保留。', 'error');
    }
  }
};

// 战斗结束处理
const onBattleEnd = (result) => {
  if (result.result === 'victory') {
    audioStore.playSfx('victory');
    gameStore.addExp(result.rewards.exp);
    gameStore.addCoins(result.rewards.coins);
    
    // 保存关卡进度
    if (selectedArea.value && selectedLevel.value) {
      const levelId = `${selectedArea.value.id}_level_${selectedLevel.value.number}`;
      // 根据战斗表现计算星级（这里简化为1星，可根据时间/连击等优化）
      const stars = result.streak >= 5 ? 3 : result.streak >= 3 ? 2 : 1;
      gameStore.completeLevel(levelId, stars);
    }
  }
  goBack();
};

// 导航到数学乐园
const startChallengeCenter = () => {
  previousView.value = currentView.value;
  currentView.value = 'challenge';
  gameStore.setGameMode('challenge_center');
  audioStore.playBgm('main');
};

// 从数学乐园进入冒险模式
const startAdventureFromHall = () => {
  previousView.value = 'challenge';
  currentView.value = 'adventure';
  gameStore.setGameMode('adventure');
  audioStore.playBgm('adventure');
};

// 从数学乐园进入超市大挑战
const startMarketFromHall = () => {
  previousView.value = 'challenge';
  currentView.value = 'market';
  gameStore.setGameMode('challenge_center');
  audioStore.playBgm('main');
};

// 从数学乐园进入钟表学院
const startClockFromHall = () => {
  previousView.value = 'challenge';
  currentView.value = 'clock';
  gameStore.setGameMode('challenge_center');
  audioStore.playBgm('main');
};

// 从数学乐园进入概率实验室
const startProbabilityFromHall = () => {
  previousView.value = 'challenge';
  currentView.value = 'probability';
  gameStore.setGameMode('challenge_center');
  audioStore.playBgm('main');
};

// 从数学乐园进入几何王国
const startGeometryFromHall = () => {
  previousView.value = 'challenge';
  currentView.value = 'geometryGame';
  gameStore.setGameMode('challenge_center');
  audioStore.playBgm('main');
};

// 从数学乐园进入单位大冒险
const startUnitFromHall = () => {
  previousView.value = 'challenge';
  currentView.value = 'unitGame';
  gameStore.setGameMode('challenge_center');
  audioStore.playBgm('main');
};

// 从数学乐园进入统计图表
const startChartFromHall = () => {
  previousView.value = 'challenge';
  currentView.value = 'chartGame';
  gameStore.setGameMode('challenge_center');
  audioStore.playBgm('main');
};

// 导航到速算竞技
const startSpeedChallenge = () => {
  previousView.value = currentView.value;
  speedChallengeStore.$reset();
  currentView.value = 'speedChallenge';
};

// 导航到应用与填空
const startWordFill = () => {
  previousView.value = currentView.value;
  currentView.value = 'wordFill';
};

// 打开卡牌收藏
const openCardCollection = () => {
  previousView.value = currentView.value;
  currentView.value = 'cardCollection';
};

// 打开卡包
const openCardPack = () => {
  previousView.value = currentView.value;
  currentView.value = 'cardPack';
};

// 打开排行榜
const openLeaderboard = () => {
  previousView.value = currentView.value;
  currentView.value = 'leaderboard';
};

// 速算结束处理（奖励发放已在 store.endGame() 中完成）
// 不调用 goBack()，让 SpeedChallenge 组件展示结算界面
const onChallengeEnd = (_result) => {
  // 结算结果已由 store.endGame() 处理，无需额外操作
};

// ====== 英语学科导航 ======

const startEnglishHall = () => {
  previousView.value = currentView.value;
  currentView.value = 'englishHall';
};

const startEnglishSpeedSpell = (mode) => {
  previousView.value = currentView.value;
  englishSpeedSpellStore.$reset();
  englishSpeedSpellStore.startGame(mode);
  currentView.value = 'englishSpeedSpell';
};

const onSpellEnd = (_result) => {
  // 奖励已在 store.endGame() 中发放
};

// ====== 语法城堡导航 ======

const currentGrammarTowerId = ref(null);

const startGrammarTower = (towerId) => {
  previousView.value = currentView.value;
  currentGrammarTowerId.value = towerId;
  englishGrammarStore.$reset();
  currentView.value = 'englishGrammarGame';
};

const startGrammarHall = () => {
  previousView.value = currentView.value;
  currentView.value = 'englishGrammar';
};

const goBackFromGrammar = () => {
  goBack();
};

const goBackFromGrammarGame = () => {
  englishGrammarStore.resetGame();
  currentView.value = 'englishGrammar';
};

// ====== 英语冒险导航 ======

const currentEnglishRegionId = ref(null);

const startEnglishAdventure = () => {
  previousView.value = currentView.value;
  const adventureStore = useEnglishAdventureStore();
  currentEnglishRegionId.value = adventureStore.currentRegion || null;
  currentView.value = 'englishAdventureMap';
  audioStore.playBgm('adventure');
};

const startEnglishRegionBattle = (regionId) => {
  previousView.value = currentView.value;
  currentEnglishRegionId.value = regionId;
  currentView.value = 'englishRegionBattle';
};

// 当前学科（用于对 subject prop 的视图传递）
const currentSubject = ref('math');

const startTargetedTraining = () => {
  previousView.value = currentView.value;
  currentSubject.value = 'math';
  currentView.value = 'targetedTraining';
};

const startReview = () => {
  previousView.value = currentView.value;
  currentSubject.value = 'all';
  currentView.value = 'review';
};

// 从英语大厅进入针对性训练（带 subject='english'）
const startTargetedTrainingFromEnglish = () => {
  previousView.value = currentView.value;
  currentSubject.value = 'english';
  currentView.value = 'targetedTraining';
};

// 从英语大厅进入复习模式（带 subject='english'）
const startReviewFromEnglish = () => {
  previousView.value = currentView.value;
  currentSubject.value = 'english';
  currentView.value = 'review';
};

// 知识中心
const startKnowledgeCenter = () => {
  previousView.value = currentView.value;
  currentView.value = 'knowledgeCenter';
};

const startAdmin = () => {
  previousView.value = currentView.value;
  currentView.value = 'admin';
};

// 卡牌对战结束处理
const onCardBattleEnd = (result) => {
  if (result.rewards) {
    if (result.rewards.coins) gameStore.addCoins(result.rewards.coins);
    if (result.rewards.gems) gameStore.addGems(result.rewards.gems);
  }
};

// 导航到卡牌世界（从主菜单）
const startCardWorld = () => {
  previousView.value = currentView.value;
  currentView.value = 'cardWorld';
  gameStore.setGameMode('card_world');
  audioStore.playBgm('main');
};

// 从卡牌世界导航到子视图（卡牌对战、收藏、开卡包）
const navigateFromCardWorld = (view) => {
  previousView.value = currentView.value;
  currentView.value = view;
};

// 卡包开启处理
const onPackOpened = (_cards) => {
  // 卡牌已添加到收藏，刷新显示
};

// ====== 动态视图注册表 ======
// 将 20+ v-if 链替换为组件注册表 + <component :is=""> 模式
// 注意：必须放在所有函数定义之后（下文引用的函数需先定义）
const viewRegistry = {
  menu: {
    component: MainMenu,
    props: () => ({
      playerName: playerInfo.value.name,
      playerLevel: playerInfo.value.level,
      playerCoins: playerInfo.value.coins
    }),
    events: {
      'startChallengeCenter': startChallengeCenter,
      'openSettings': openSettings,
      'startEnglishHall': startEnglishHall,
      'startCardWorld': startCardWorld,
      'startAdmin': startAdmin
    }
  },
  adventure: {
    component: AdventureMap,
    props: () => ({
      unlockedAreas: unlockedAreas.value,
      currentAreaId: currentAreaId.value
    }),
    events: { 'areaSelect': showLevelSelect, back: goBack }
  },
  levelSelect: {
    component: LevelSelect,
    props: () => ({
      area: selectedArea.value,
      completedLevels: gameStore.progress?.completedLevels || [],
      stars: gameStore.progress?.stars || {}
    }),
    events: { 'levelSelect': onLevelSelect, back: goBack }
  },
  battle: {
    component: BattleGame,
    props: () => ({
      player: battlePlayer.value,
      monster: battleMonster.value,
      grade: battleGrade.value,
      streak: battleStreak.value,
      difficultyScale: battleDifficultyScale.value
    }),
    events: { 'battleEnd': onBattleEnd, back: goBack }
  },
  market: {
    component: MarketChallenge,
    props: () => ({}),
    events: {
      back: goBack
    }
  },
  inventory: {
    component: InventoryView,
    props: () => ({}),
    events: { back: goBack, 'openBattlePrepare': openBattlePrepareFromInventory }
  },
  battlePrepare: {
    component: BattlePrepare,
    props: () => ({}),
    events: { back: goBack, 'startBattle': onBattlePrepareStart }
  },
  challenge: {
    component: GameHall,
    props: () => ({}),
    events: {
      'startSpeedChallenge': startSpeedChallenge,
      'startWordFill': startWordFill,
      'startMarket': startMarketFromHall,
      'startClock': startClockFromHall,
      'startProbability': startProbabilityFromHall,
      'startAdventure': startAdventureFromHall,
      'startTargetedTraining': startTargetedTraining,
      'startReview': startReview,
      'startGeometryGame': startGeometryFromHall,
      'startUnitGame': startUnitFromHall,
      'startChartGame': startChartFromHall,
      'startKnowledgeCenter': startKnowledgeCenter,
      'openLeaderboard': openLeaderboard,
      'openAchievements': openAchievements,
      back: goBack
    }
  },
  clock: {
    component: ClockGame,
    props: () => ({}),
    events: { back: goBack }
  },
  probability: {
    component: ProbabilityLab,
    props: () => ({}),
    events: { back: goBack }
  },
  geometryGame: {
    component: GeometryGame,
    props: () => ({}),
    events: { back: goBack }
  },
  unitGame: {
    component: UnitGame,
    props: () => ({}),
    events: { back: goBack }
  },
  chartGame: {
    component: ChartGame,
    props: () => ({}),
    events: { back: goBack }
  },
  speedChallenge: {
    component: SpeedChallenge,
    props: () => ({}),
    events: { 'challengeEnd': onChallengeEnd, back: goBack }
  },
  wordFill: {
    component: WordFillChallenge,
    props: () => ({}),
    events: { back: goBack }
  },
  cardBattle: {
    component: CardBattle,
    props: () => ({}),
    events: { 'battleEnd': onCardBattleEnd, 'openCollection': openCardCollection, back: goBack }
  },
  cardCollection: {
    component: CardCollection,
    props: () => ({}),
    events: { back: goBack, 'openPack': openCardPack }
  },
  cardPack: {
    component: CardPack,
    props: () => ({}),
    events: { 'packOpened': onPackOpened, back: goBack }
  },
  cardWorld: {
    component: CardWorld,
    props: () => ({}),
    events: {
      'navigate': navigateFromCardWorld,
      'openAchievements': openAchievements,
      'openLeaderboard': openLeaderboard,
      back: goBack
    }
  },
  leaderboard: {
    component: Leaderboard,
    props: () => ({}),
    events: { back: goBack }
  },
  englishHall: {
    component: EnglishHall,
    props: () => ({}),
    events: {
      'startSpeedSpell': startEnglishSpeedSpell,
      'enterGrammar': startGrammarHall,
      'startAdventure': startEnglishAdventure,
      'startTargetedTraining': startTargetedTrainingFromEnglish,
      'startReview': startReviewFromEnglish,
      'startKnowledgeCenter': startKnowledgeCenter,
      'openAchievements': openAchievements,
      'openLeaderboard': openLeaderboard,
      back: goBack
    }
  },
  englishSpeedSpell: {
    component: EnglishSpeedSpell,
    props: () => ({}),
    events: { back: goBack, 'challengeEnd': onSpellEnd }
  },
  englishGrammar: {
    component: EnglishGrammar,
    props: () => ({}),
    events: {
      'enterTower': startGrammarTower,
      back: goBackFromGrammar
    }
  },
  englishGrammarGame: {
    component: EnglishGrammarGame,
    props: () => ({
      towerId: currentGrammarTowerId.value
    }),
    events: {
      back: goBackFromGrammarGame,
      'towerComplete': () => {
        // 塔通关事件（暂不处理）
      }
    }
  },
  targetedTraining: {
    component: TargetedTraining,
    props: () => ({
      subject: currentSubject.value
    }),
    events: { back: goBack }
  },
  review: {
    component: ReviewSession,
    props: () => ({
      subject: currentSubject.value
    }),
    events: { back: goBack }
  },
  knowledgeCenter: {
    component: KnowledgeCenter,
    props: () => ({
      subject: currentSubject.value
    }),
    events: { back: goBack }
  },
  admin: {
    component: AdminPage,
    props: () => ({}),
    events: { back: goBack }
  },

  // ====== 英语冒险视图 ======

  englishAdventureMap: {
    component: EnglishAdventureMap,
    props: () => {
      const adventureStore = useEnglishAdventureStore();
      return {
        unlockedRegions: adventureStore.unlockedRegionIds,
        currentRegionId: adventureStore.currentRegion || 'region_1'
      };
    },
    events: {
      regionSelect: (region) => startEnglishRegionBattle(region.id || region),
      back: goBack
    }
  },

  englishSpiritCollection: {
    component: EnglishSpiritCollection,
    props: () => ({}),
    events: { back: goBack }
  },

  englishRegionBattle: {
    component: EnglishRegionBattle,
    props: () => ({
      regionId: currentEnglishRegionId.value
    }),
    events: {
      back: goBack,
      regionComplete: (_result) => {
        // 区域通关后回到冒险地图
        currentView.value = 'englishAdventureMap';
      }
    }
  }
};

// 当前视图的组件、props、事件
const viewComponent = computed(() => viewRegistry[currentView.value]?.component || null);
const viewProps = computed(() => viewRegistry[currentView.value]?.props() || {});
const viewEvents = computed(() => viewRegistry[currentView.value]?.events || {});

onMounted(async () => {
  // 初始化游戏 - 等待完成
  const loaded = await gameStore.initGame();
  if (import.meta.env.DEV) console.log('GameApp onMounted - game loaded:', loaded, 'player:', gameStore.player);
  
  // 如果没有存档，创建新游戏
  if (!loaded || !gameStore.player) {
    if (import.meta.env.DEV) console.log('No saved game, creating new game');
    await gameStore.newGame('冒险者', 1);
    if (import.meta.env.DEV) console.log('New game created - player:', gameStore.player);
  }
  
  audioStore.init();
  settingsStore.loadSettings();

  // 初始化知识中心 stores
  const mathKnowledgeStore = useMathKnowledgeStore();
  const englishKnowledgeStore = useEnglishKnowledgeStore();
  mathKnowledgeStore.init();
  englishKnowledgeStore.init();

  // 初始化自定义模板 store（从 localStorage 加载模板数据）
  const customTemplateStore = useCustomTemplateStore();
  customTemplateStore.init();

  // 初始化英语冒险 stores（从 gameStore 加载持久化数据）
  const englishSpiritStore = useEnglishSpiritStore();
  const englishAdventureStore = useEnglishAdventureStore();
  englishSpiritStore.loadFromSave();
  englishAdventureStore.loadFromSave();
  
  // 同步已持久化的设置到音频系统（使用统一的 syncSettings 接口）
  audioManager.syncSettings({
    bgmVolume: settingsStore.musicVolume,
    sfxVolume: settingsStore.soundVolume,
    bgmEnabled: settingsStore.music,
    sfxEnabled: settingsStore.sound
  });
  // 同步到 audioStore 状态
  audioStore.bgmVolume = settingsStore.musicVolume;
  audioStore.sfxVolume = settingsStore.soundVolume;
  audioStore.bgmEnabled = settingsStore.music;
  audioStore.sfxEnabled = settingsStore.sound;
  
  // 播放主菜单音乐
  audioStore.playBgm('main');

  // 移动端自动播放策略：首次用户交互时恢复被阻止的 BGM
  const resumeAudio = () => {
    audioManager.resumePendingBgm();
    document.removeEventListener('click', resumeAudio);
    document.removeEventListener('touchstart', resumeAudio);
  };
  document.addEventListener('click', resumeAudio, { once: true });
  document.addEventListener('touchstart', resumeAudio, { once: true });
});
</script>

<style scoped>
.game-app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.game-header {
  padding: 1rem;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
}

.game-header h1 {
  margin: 0;
  color: #fff;
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-main {
  flex: 1;
  overflow-y: auto;
}
</style>
