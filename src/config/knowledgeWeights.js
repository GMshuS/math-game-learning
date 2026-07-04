/**
 * 权重加载逻辑
 * 优先级: admin override (weightOverrides) > config 默认 > errorBoost 乘数
 *
 * 权重计算函数已提取至 src/utils/weightTools.js，此处仅做 namespace='math' 的包装。
 */

import { STORAGE_KEYS } from '../utils/storage';
import {
  calcDeficiencyBoost,
  calcSuccessDecay,
  loadFrequencyData,
  saveFrequencyData,
  recordTypeGenerated as wtRecordTypeGenerated,
  getRecencyFactor as wtGetRecencyFactor,
  recordCorrectAnswer as wtRecordCorrectAnswer,
  recordWrongAnswer as wtRecordWrongAnswer,
  getSuccessStreak
} from '../utils/weightTools';

// 不足度模型 — 目标正确率
export const TARGET_CORRECT_RATE = 0.80;

// 对数曲线陡度系数
export const DEFICIENCY_K = 5;

// 最大 boost cap
export const MAX_BOOST = 2.0;

// 成功衰减率（答对退火用）
export const DECAY_RATE = 5;

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
 * 从 localStorage 读取题型频率记录（namespace='math' 包装）
 * @returns {Object} { [type]: { frequency: number, lastSeen: number } }
 */
export function loadTypeFrequency() {
  return loadFrequencyData('math');
}

/**
 * 将题型频率记录写入 localStorage（namespace='math' 包装）
 * @param {Object} data - { [type]: { frequency: number, lastSeen: number } }
 */
export function saveTypeFrequency(data) {
  saveFrequencyData('math', data);
}

/**
 * 记录一道题目已被生成，更新跨会话频率（namespace='math' 包装）
 * @param {string} type - 题型标识
 */
export function recordTypeGenerated(type) {
  wtRecordTypeGenerated(type, 'math');
}

/**
 * 计算某题型的频率衰减因子（namespace='math' 包装）
 * @param {string} type - 题型标识
 * @param {Object} [frequencyData] - 可选，预加载的频率数据
 * @returns {number} 衰减因子
 */
export function getRecencyFactor(type, frequencyData) {
  return wtGetRecencyFactor(type, 'math', frequencyData);
}

/**
 * 记录一道题目回答正确，连续答对计数器 +1（namespace='math' 包装）
 * @param {string} type - 题型标识
 */
export function recordCorrectAnswer(type) {
  wtRecordCorrectAnswer(type, 'math');
}

/**
 * 记录一道题目回答错误，重置连续答对计数器为 0（namespace='math' 包装）
 * @param {string} type - 题型标识
 */
export function recordWrongAnswer(type) {
  wtRecordWrongAnswer(type, 'math');
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
  const frequencyData = loadFrequencyData('math');

  for (const [type, defaultWeight] of Object.entries(baseWeights)) {
    // 优先级1: admin override
    const weight = (gradeOverrides[type] !== undefined) ? gradeOverrides[type] : defaultWeight;

    // 优先级2: errorBoost — 不足度模型 + 对数 + cap (仅当答题次数达到 minAttempts 阈值后生效)
    let boost = 1.0;
    const record = knowledgeStore?.records?.[type];
    if (record && record.totalAttempts >= minAttempts) {
      const errorRate = record.wrongCount / record.totalAttempts;
      boost = calcDeficiencyBoost(errorRate, {
        targetRate: TARGET_CORRECT_RATE,
        K: DEFICIENCY_K,
        cap: MAX_BOOST
      });
    }

    // 优先级3: 成功抵消（答对退火）— 连续答对时指数衰减
    const successCount = getSuccessStreak(type, 'math');
    const effectiveBoost = boost * calcSuccessDecay(successCount, DECAY_RATE);

    // 优先级4: 跨会话频率衰减 — 出现越频繁权重越低（传入预加载的 frequencyData 避免重复读取）
    const recencyFactor = getRecencyFactor(type, 'math', frequencyData);

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
