/**
 * 共享权重工具函数
 *
 * 从 src/config/knowledgeWeights.js 和 src/utils/questionGenerator.js 提取，
 * 支持 namespace 隔离，可供数学和英语侧共用。
 *
 * @module weightTools
 */

// ==================== 常量 ====================

/** 不足度模型 — 目标正确率 */
const DEFAULT_TARGET_RATE = 0.80;

/** 对数曲线陡度系数 */
const DEFAULT_DEFICIENCY_K = 5;

/** 最大 boost cap */
const DEFAULT_MAX_BOOST = 2.0;

/** 成功衰减率（答对退火用） */
const DEFAULT_DECAY_RATE = 5;

/** 半衰期 1 小时（ms） */
const DEFAULT_HALF_LIFE = 3600000;

// ==================== Storage keys 映射 ====================

/**
 * 各 namespace 对应的 localStorage key
 * @type {Object<string, string>}
 */
export const STORAGE_KEYS_MAP = {
  math: 'math_game_type_frequency',
  english_grammar: 'english_grammar_type_frequency',
  english_speed: 'english_speedspell_frequency'
};

/**
 * 获取指定 namespace 的 localStorage key
 * @param {string} namespace - namespace 标识
 * @returns {string} localStorage key
 */
function getStorageKey(namespace) {
  return STORAGE_KEYS_MAP[namespace] || `math_game_${namespace}_frequency`;
}

// ==================== namespace 隔离的连续答对计数器 ====================

/** @type {Map<string, Map<string, number>>} key: namespace → Map<type, count> */
const successStreakMaps = new Map();

// ==================== 纯函数 ====================

/**
 * 计算错题 boost 乘数（不足度模型 + 对数 + cap）
 *
 * @param {number} errorRate - 错误率 (0-1)
 * @param {object} [options] - 可选参数
 * @param {number} [options.targetRate=0.80] - 目标正确率
 * @param {number} [options.K=5] - 对数曲线陡度系数
 * @param {number} [options.cap=2.0] - 最大 boost cap
 * @returns {number} boost 乘数 (1.0 ~ cap)
 */
export function calcDeficiencyBoost(errorRate, options = {}) {
  const targetRate = options.targetRate ?? DEFAULT_TARGET_RATE;
  const K = options.K ?? DEFAULT_DEFICIENCY_K;
  const cap = options.cap ?? DEFAULT_MAX_BOOST;

  const correctRate = 1 - errorRate;
  const deficiency = Math.max(0, targetRate - correctRate);
  let boost = 1 + Math.log(1 + deficiency * K) / Math.log(1 + K);
  return Math.min(boost, cap);
}

/**
 * 计算成功衰减因子（答对退火）
 *
 * 连续答对时指数衰减：Math.exp(-successCount / decayRate)
 *
 * @param {number} successCount - 连续答对数
 * @param {number} [decayRate=5] - 衰减率
 * @returns {number} 衰减因子 (0-1)
 */
export function calcSuccessDecay(successCount, decayRate = DEFAULT_DECAY_RATE) {
  return Math.exp(-successCount / decayRate);
}

/**
 * 计算某题型的频率衰减因子（含时间衰减）
 *
 * 先根据半衰期对 frequency 做时间衰减，再映射到 0.5 ~ 1.2 范围。
 * frequency=0 → 1.20（轻微提权），frequency=6 → 0.70（降权）
 *
 * @param {number} frequency - 当前频率值
 * @param {number} lastSeen - 上次出现时间戳 (ms)
 * @param {object} [options] - 可选参数
 * @param {number} [options.halfLife=3600000] - 半衰期 (ms)
 * @param {number} [options.now=Date.now()] - 当前时间戳
 * @returns {number} 0.5 ~ 1.2 的衰减因子
 */
export function calcRecencyFactor(frequency, lastSeen, options = {}) {
  const halfLife = options.halfLife ?? DEFAULT_HALF_LIFE;
  const now = options.now ?? Date.now();

  // 时间衰减
  const elapsed = now - lastSeen;
  const decay = Math.pow(0.5, elapsed / halfLife);
  const adjustedFreq = frequency * decay;

  // 频率 → 因子
  const factor = 1.2 - (adjustedFreq - 1) * 0.1;
  return Math.max(0.5, Math.min(1.2, factor));
}

/**
 * 对已选中的题型施加多样性惩罚
 *
 * 某题型实际出现次数超过期望值时，惩罚其权重。
 *
 * @param {object} weights - 原始调整后权重 { type: weight }
 * @param {object} counter - 当前批次各题型已出现次数 { type: count }
 * @returns {object} 惩罚后的权重副本
 */
export function applyDiversityPenalty(weights, counter) {
  const totalTypes = Object.keys(weights).length;
  if (totalTypes <= 0) return { ...weights };

  const totalSoFar = Object.values(counter).reduce((a, b) => a + b, 0);
  const expected = totalSoFar / totalTypes;
  const result = { ...weights };

  for (const [type, count] of Object.entries(counter)) {
    if (count > expected) {
      const penalty = 1 + (count - expected);
      result[type] = Math.max(1, Math.round(result[type] / penalty));
    }
  }
  return result;
}

/**
 * 加权随机选择
 *
 * 根据权重对象返回一个键，权重越高被选中的概率越大。
 *
 * @param {object} weights - { type: weight, ... }
 * @returns {string} 选中的类型键
 */
export function weightedRandom(weights) {
  const entries = Object.entries(weights);
  if (entries.length === 0) return null;
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  let random = Math.random() * totalWeight;
  for (const [type, weight] of entries) {
    random -= weight;
    if (random <= 0) return type;
  }
  return entries[entries.length - 1][0];
}

/**
 * 创建一个多样性感知的题型选择器
 *
 * 返回的 pick 函数每次调用会应用多样性惩罚并记录已选题型。
 * 注意：本函数不调用 recordTypeGenerated，由调用方自行管理。
 *
 * @param {object} adjustedWeights - 调整后的权重 { type: weight }
 * @returns {Function} pick() → type
 */
export function createDiversityAwarePicker(adjustedWeights) {
  const counter = {};
  return function pick() {
    const penalized = applyDiversityPenalty(adjustedWeights, counter);
    const type = weightedRandom(penalized);
    counter[type] = (counter[type] || 0) + 1;
    return type;
  };
}

// ==================== Storage 操作函数 ====================

/**
 * 读取题型频率记录
 *
 * @param {string} [namespace='math'] - namespace 标识
 * @returns {object} { [type]: { frequency: number, lastSeen: number } }
 */
export function loadFrequencyData(namespace = 'math') {
  const key = getStorageKey(namespace);
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * 写入题型频率记录
 *
 * @param {string} [namespace='math'] - namespace 标识
 * @param {object} data - { [type]: { frequency: number, lastSeen: number } }
 */
export function saveFrequencyData(namespace = 'math', data) {
  const key = getStorageKey(namespace);
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`无法保存[${namespace}]题型频率数据:`, e.message);
  }
}

/**
 * 记录一道题目已被生成，更新跨会话频率
 *
 * 半衰期 1 小时（3600000ms），decay = 0.5^(elapsed/3600000)
 *
 * @param {string} type - 题型标识
 * @param {string} [namespace='math'] - namespace 标识
 */
export function recordTypeGenerated(type, namespace = 'math') {
  const data = loadFrequencyData(namespace);
  const now = Date.now();
  const record = data[type];
  let frequency = 0;
  if (record) {
    const elapsed = now - record.lastSeen;
    const decay = Math.pow(0.5, elapsed / DEFAULT_HALF_LIFE);
    frequency = record.frequency * decay + 1;
  } else {
    frequency = 1;
  }
  data[type] = { frequency, lastSeen: now };
  saveFrequencyData(namespace, data);
}

/**
 * 获取某题型的频率衰减因子
 *
 * 直接从（可选预加载的）频率数据中读取该题型的 frequency 值，
 * 映射到 0.5 ~ 1.2 范围。不含额外时间衰减，以保持与现有行为一致。
 *
 * @param {string} type - 题型标识
 * @param {string} [namespace='math'] - namespace 标识
 * @param {object} [frequencyData] - 可选，预加载的频率数据（避免重复读取 localStorage）
 * @returns {number} 0.5 ~ 1.2 的衰减因子
 */
export function getRecencyFactor(type, namespace = 'math', frequencyData) {
  const data = frequencyData || loadFrequencyData(namespace);
  const record = data[type];
  const frequency = record ? record.frequency : 0;
  const factor = 1.2 - (frequency - 1) * 0.1;
  return Math.max(0.5, Math.min(1.2, factor));
}

// ==================== 连续答对计数器 ====================

/**
 * 记录一道题目回答正确，连续答对计数器 +1
 *
 * @param {string} type - 题型标识
 * @param {string} [namespace='math'] - namespace 标识
 */
export function recordCorrectAnswer(type, namespace = 'math') {
  if (!type || typeof type !== 'string') return;
  if (!successStreakMaps.has(namespace)) {
    successStreakMaps.set(namespace, new Map());
  }
  const map = successStreakMaps.get(namespace);
  const current = map.get(type) || 0;
  map.set(type, current + 1);
}

/**
 * 记录一道题目回答错误，重置连续答对计数器为 0
 *
 * @param {string} type - 题型标识
 * @param {string} [namespace='math'] - namespace 标识
 */
export function recordWrongAnswer(type, namespace = 'math') {
  if (!type || typeof type !== 'string') return;
  const map = successStreakMaps.get(namespace);
  if (map && map.has(type) && map.get(type) > 0) {
    map.delete(type);
  }
}

/**
 * 获取连续答对数
 *
 * @param {string} type - 题型标识
 * @param {string} [namespace='math'] - namespace 标识
 * @returns {number} 连续答对数
 */
export function getSuccessStreak(type, namespace = 'math') {
  const map = successStreakMaps.get(namespace);
  if (!map) return 0;
  return map.get(type) || 0;
}
