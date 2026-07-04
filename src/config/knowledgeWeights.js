/**
 * 权重加载逻辑
 * 优先级: admin override (weightOverrides) > config 默认 > errorBoost 乘数
 */

import { STORAGE_KEYS } from '../utils/storage';

// 不足度模型 — 目标正确率
export const TARGET_CORRECT_RATE = 0.80;

// 对数曲线陡度系数
export const DEFICIENCY_K = 5;

// 最大 boost cap
export const MAX_BOOST = 2.0;

// 成功衰减率（答对退火用）
export const DECAY_RATE = 5;

// localStorage key — 跨会话题型频率记录
const STORAGE_KEY_TYPE_FREQUENCY = 'math_game_type_frequency';

// 内存中连续答对计数器（页面刷新后重置，第一期行为）
const successStreakMap = new Map();

/**
 * 从 localStorage 读取 weightOverrides
 * @returns {Object} { grades: { [grade]: { type: weight } }, globalSettings: {} }
 */
function loadWeightOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_OVERRIDES);
    return raw ? JSON.parse(raw) : { grades: {}, globalSettings: {} };
  } catch {
    return { grades: {}, globalSettings: {} };
  }
}

/**
 * 从 localStorage 读取知识系统配置
 * @returns {Object} { minAttempts: number }
 */
export function loadKnowledgeConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_CONFIG);
    return raw ? JSON.parse(raw) : { minAttempts: 3 };
  } catch {
    return { minAttempts: 3 };
  }
}

/**
 * 从 localStorage 读取题型频率记录
 * @returns {Object} { [type]: { frequency: number, lastSeen: number } }
 */
export function loadTypeFrequency() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TYPE_FREQUENCY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * 将题型频率记录写入 localStorage
 * @param {Object} data - { [type]: { frequency: number, lastSeen: number } }
 */
export function saveTypeFrequency(data) {
  try {
    localStorage.setItem(STORAGE_KEY_TYPE_FREQUENCY, JSON.stringify(data));
  } catch (e) {
    console.warn('无法保存题型频率数据:', e.message);
  }
}

/**
 * 记录一道题目已被生成，更新跨会话频率
 * 半衰期 1 小时（3600000ms），decay = 0.5^(elapsed/3600000)
 * @param {string} type - 题型标识
 */
export function recordTypeGenerated(type) {
  const data = loadTypeFrequency();
  const now = Date.now();
  const record = data[type];
  let frequency = 0;
  if (record) {
    const elapsed = now - record.lastSeen;
    const decay = Math.pow(0.5, elapsed / 3600000);
    frequency = record.frequency * decay + 1;
  } else {
    frequency = 1;
  }
  data[type] = { frequency, lastSeen: now };
  saveTypeFrequency(data);
}

/**
 * 计算某题型的频率衰减因子
 * recencyFactor = clamp(1.2 - (frequency - 1) * 0.1, 0.5, 1.2)
 * frequency=0 → 1.20（轻微提权），frequency=6 → 0.70（降权）
 * @param {string} type - 题型标识
 * @param {Object} [frequencyData] - 可选，预加载的频率数据（避免重复读取 localStorage）
 * @returns {number} 衰减因子
 */
export function getRecencyFactor(type, frequencyData) {
  const data = frequencyData || loadTypeFrequency();
  const record = data[type];
  const frequency = record ? record.frequency : 0;
  const factor = 1.2 - (frequency - 1) * 0.1;
  return Math.max(0.5, Math.min(1.2, factor));
}

/**
 * 记录一道题目回答正确，连续答对计数器 +1
 * @param {string} type - 题型标识
 */
export function recordCorrectAnswer(type) {
  // 防御：确保 type 为有效字符串，防止污染 successStreakMap
  if (!type || typeof type !== 'string') return;
  const current = successStreakMap.get(type) || 0;
  successStreakMap.set(type, current + 1);
}

/**
 * 记录一道题目回答错误，重置连续答对计数器为 0
 * @param {string} type - 题型标识
 */
export function recordWrongAnswer(type) {
  // 防御：确保 type 为有效字符串
  if (!type || typeof type !== 'string') return;
  // 清理：count 归零时删除键以释放 Map 空间
  if (successStreakMap.has(type) && successStreakMap.get(type) > 0) {
    successStreakMap.delete(type);
  }
}

/**
 * 获取调整后的权重
 * @param {number} grade - 年级
 * @param {Object} baseWeights - gradeQuestionWeights[grade] 的默认权重
 * @param {Object} knowledgeStore - mathKnowledgeStore 实例 (需有 records 属性)
 * @returns {Object} adjustedWeights - { type: adjustedWeight }
 */
export function getAdjustedWeights(grade, baseWeights, knowledgeStore) {
  const overrides = loadWeightOverrides();
  const gradeOverrides = overrides.grades?.[grade] || {};
  const adjusted = {};

  // 最小值阈值 (errorBoost 冷启动保护)
  const config = loadKnowledgeConfig();
  const minAttempts = config.minAttempts || 3;

  // 一次性加载频率数据，避免循环中反复读取 localStorage
  const frequencyData = loadTypeFrequency();

  for (const [type, defaultWeight] of Object.entries(baseWeights)) {
    // 优先级1: admin override
    const weight = (gradeOverrides[type] !== undefined) ? gradeOverrides[type] : defaultWeight;

    // 优先级2: errorBoost — 不足度模型 + 对数 + cap (仅当答题次数达到 minAttempts 阈值后生效)
    let boost = 1.0;
    const record = knowledgeStore?.records?.[type];
    if (record && record.totalAttempts >= minAttempts) {
      const errorRate = record.wrongCount / record.totalAttempts;
      const correctRate = 1 - errorRate;
      const deficiency = Math.max(0, TARGET_CORRECT_RATE - correctRate);
      boost = 1 + Math.log(1 + deficiency * DEFICIENCY_K) / Math.log(1 + DEFICIENCY_K);
      boost = Math.min(boost, MAX_BOOST);
    }

    // 优先级3: 成功抵消（答对退火）— 连续答对时指数衰减
    const successCount = successStreakMap.get(type) || 0;
    const effectiveBoost = boost * Math.exp(-successCount / DECAY_RATE);

    // 优先级4: 跨会话频率衰减 — 出现越频繁权重越低（传入预加载的 frequencyData 避免重复读取）
    const recencyFactor = getRecencyFactor(type, frequencyData);

    adjusted[type] = Math.round(weight * effectiveBoost * recencyFactor);
  }

  return adjusted;
}

export default {
  getAdjustedWeights,
  loadKnowledgeConfig,
  loadTypeFrequency,
  saveTypeFrequency,
  recordTypeGenerated,
  getRecencyFactor,
  recordCorrectAnswer,
  recordWrongAnswer,
  TARGET_CORRECT_RATE,
  DEFICIENCY_K,
  MAX_BOOST,
  DECAY_RATE
};
