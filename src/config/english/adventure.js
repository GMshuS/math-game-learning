/**
 * 英语冒险模式区域配置
 * 定义4个英语学习区域，每个区域包含语法塔列表和BOSS配置
 */
export const englishAdventureConfig = {
  regions: [
    {
      id: 'region_1',
      name: '词法森林',
      icon: '🌳',
      towers: ['noun', 'pronoun', 'article', 'adjAdv'],
      boss: {
        spiritId: 'noun_spirit',
        name: '名词精灵',
        icon: '👑',
        hp: 100
      },
      unlockedBy: null
    },
    {
      id: 'region_2',
      name: '时态山脉',
      icon: '⛰️',
      towers: ['beVerb', 'presentSimple', 'presentContinuous', 'futureTense', 'pastTense'],
      boss: {
        spiritId: 'tense_spirit',
        name: '时态精灵',
        icon: '⏰',
        hp: 150
      },
      unlockedBy: 'region_1'
    },
    {
      id: 'region_3',
      name: '句法城堡',
      icon: '🏰',
      towers: ['preposition', 'thereBe', 'conjunction', 'basicClause', 'sentenceStructure'],
      boss: {
        spiritId: 'conjunction_spirit',
        name: '句法精灵',
        icon: '⚖️',
        hp: 200
      },
      unlockedBy: 'region_2'
    },
    {
      id: 'region_4',
      name: '口语小镇',
      icon: '💬',
      towers: ['phrase', 'dialogue'],
      boss: {
        spiritId: 'speaking_spirit',
        name: '口语精灵',
        icon: '🎤',
        hp: 250
      },
      unlockedBy: 'region_3'
    }
  ]
};

/**
 * 根据区域ID获取区域配置
 * @param {string} regionId - 区域ID
 * @returns {object|undefined} 区域配置对象
 */
export function getEnglishRegion(regionId) {
  return englishAdventureConfig.regions.find(r => r.id === regionId);
}

/**
 * 获取所有英语区域配置
 * @returns {object[]} 区域配置数组
 */
export function getAllEnglishRegions() {
  return englishAdventureConfig.regions;
}

/**
 * 获取已解锁的区域列表
 * @param {string[]} unlockedRegionIds - 已解锁的区域ID数组
 * @returns {object[]} 已解锁区域配置数组
 */
export function getUnlockedRegions(unlockedRegionIds) {
  return englishAdventureConfig.regions.filter(r => unlockedRegionIds.includes(r.id));
}

/**
 * 根据塔ID查找所属区域
 * @param {string} towerId - 语法塔ID
 * @returns {object|undefined} 区域配置对象
 */
export function getRegionByTower(towerId) {
  return englishAdventureConfig.regions.find(r => r.towers.includes(towerId));
}

export default englishAdventureConfig;
