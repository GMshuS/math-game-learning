/**
 * 单位大冒险 — 单位换算数据配置
 * 覆盖6大类：长度、质量、时间、面积、体积、人民币
 */

/**
 * 单位大类定义
 * 每个大类包含单位列表（以 base（基准单位）为1的换算系数）和年级适配范围
 */
export const unitCategories = {
  // 长度单位
  length: {
    name: '长度',
    icon: '📏',
    units: [
      { id: 'mm', name: '毫米', base: 0.001 },
      { id: 'cm', name: '厘米', base: 0.01 },
      { id: 'dm', name: '分米', base: 0.1 },
      { id: 'm', name: '米', base: 1 },
      { id: 'km', name: '千米', base: 1000 }
    ],
    gradeRange: {
      low: ['cm', 'm'],
      mid: ['cm', 'm', 'km'],
      high: ['mm', 'cm', 'dm', 'm', 'km']
    },
    // 常用换算对（用于出题）
    conversions: [
      { from: 'cm', to: 'm', factor: 100 },
      { from: 'm', to: 'cm', factor: 100 },
      { from: 'm', to: 'km', factor: 1000 },
      { from: 'km', to: 'm', factor: 1000 },
      { from: 'mm', to: 'cm', factor: 10 },
      { from: 'cm', to: 'mm', factor: 10 },
      { from: 'dm', to: 'm', factor: 10 },
      { from: 'm', to: 'dm', factor: 10 }
    ],
    color: '#3b82f6'
  },

  // 质量单位
  mass: {
    name: '质量',
    icon: '⚖️',
    units: [
      { id: 'g', name: '克', base: 1 },
      { id: 'kg', name: '千克', base: 1000 },
      { id: 't', name: '吨', base: 1000000 }
    ],
    gradeRange: {
      low: ['g', 'kg'],
      mid: ['g', 'kg', 't'],
      high: ['g', 'kg', 't']
    },
    conversions: [
      { from: 'g', to: 'kg', factor: 1000 },
      { from: 'kg', to: 'g', factor: 1000 },
      { from: 'kg', to: 't', factor: 1000 },
      { from: 't', to: 'kg', factor: 1000 }
    ],
    color: '#22c55e'
  },

  // 时间单位
  time: {
    name: '时间',
    icon: '⏰',
    units: [
      { id: 's', name: '秒', base: 1 },
      { id: 'min', name: '分', base: 60 },
      { id: 'h', name: '时', base: 3600 },
      { id: 'd', name: '天', base: 86400 }
    ],
    gradeRange: {
      low: ['min', 'h'],
      mid: ['min', 'h', 'd'],
      high: ['s', 'min', 'h', 'd']
    },
    conversions: [
      { from: 's', to: 'min', factor: 60 },
      { from: 'min', to: 's', factor: 60 },
      { from: 'min', to: 'h', factor: 60 },
      { from: 'h', to: 'min', factor: 60 },
      { from: 'h', to: 'd', factor: 24 },
      { from: 'd', to: 'h', factor: 24 }
    ],
    color: '#f59e0b'
  },

  // 面积单位
  area: {
    name: '面积',
    icon: '📐',
    units: [
      { id: 'cm2', name: '平方厘米', base: 1 },
      { id: 'dm2', name: '平方分米', base: 100 },
      { id: 'm2', name: '平方米', base: 10000 },
      { id: 'mu', name: '亩', base: 6666667 },
      { id: 'hm2', name: '公顷', base: 100000000 },
      { id: 'km2', name: '平方千米', base: 10000000000 }
    ],
    gradeRange: {
      low: ['cm2', 'm2'],
      mid: ['cm2', 'dm2', 'm2'],
      high: ['cm2', 'dm2', 'm2', 'hm2', 'km2']
    },
    conversions: [
      { from: 'cm2', to: 'm2', factor: 10000 },
      { from: 'm2', to: 'cm2', factor: 10000 },
      { from: 'cm2', to: 'dm2', factor: 100 },
      { from: 'dm2', to: 'cm2', factor: 100 },
      { from: 'dm2', to: 'm2', factor: 100 },
      { from: 'm2', to: 'dm2', factor: 100 },
      { from: 'm2', to: 'hm2', factor: 10000 },
      { from: 'hm2', to: 'm2', factor: 10000 },
      { from: 'hm2', to: 'km2', factor: 100 },
      { from: 'km2', to: 'hm2', factor: 100 }
    ],
    color: '#a78bfa'
  },

  // 体积/容积单位
  volume: {
    name: '体积',
    icon: '🧊',
    units: [
      { id: 'ml', name: '毫升', base: 1 },
      { id: 'cl', name: '厘升', base: 10 },
      { id: 'dl', name: '分升', base: 100 },
      { id: 'l', name: '升', base: 1000 },
      { id: 'm3', name: '立方米', base: 1000000 }
    ],
    gradeRange: {
      low: ['ml', 'l'],
      mid: ['ml', 'l'],
      high: ['ml', 'cl', 'dl', 'l', 'm3']
    },
    conversions: [
      { from: 'ml', to: 'l', factor: 1000 },
      { from: 'l', to: 'ml', factor: 1000 },
      { from: 'cl', to: 'dl', factor: 10 },
      { from: 'dl', to: 'cl', factor: 10 },
      { from: 'dl', to: 'l', factor: 10 },
      { from: 'l', to: 'dl', factor: 10 }
    ],
    color: '#06b6d4'
  },

  // 人民币
  currency: {
    name: '人民币',
    icon: '💰',
    units: [
      { id: 'fen', name: '分', base: 0.01 },
      { id: 'jiao', name: '角', base: 0.1 },
      { id: 'yuan', name: '元', base: 1 }
    ],
    gradeRange: {
      low: ['jiao', 'yuan'],
      mid: ['jiao', 'yuan'],
      high: ['fen', 'jiao', 'yuan']
    },
    conversions: [
      { from: 'fen', to: 'jiao', factor: 10 },
      { from: 'jiao', to: 'fen', factor: 10 },
      { from: 'jiao', to: 'yuan', factor: 10 },
      { from: 'yuan', to: 'jiao', factor: 10 },
      { from: 'fen', to: 'yuan', factor: 100 },
      { from: 'yuan', to: 'fen', factor: 100 }
    ],
    color: '#f97316'
  }
};

/**
 * 获取所有大类ID列表
 * @returns {string[]}
 */
export function getCategoryIds() {
  return Object.keys(unitCategories);
}

/**
 * 根据年级获取适配的单位列表
 * @param {string} categoryId - 大类ID
 * @param {number} grade - 年级 (1-6)
 * @returns {Array} 单位列表
 */
export function getUnitsForGrade(categoryId, grade) {
  const category = unitCategories[categoryId];
  if (!category) return [];

  let level = 'high';
  if (grade <= 2) level = 'low';
  else if (grade <= 4) level = 'mid';

  const allowedIds = category.gradeRange[level];
  return category.units.filter(u => allowedIds.includes(u.id));
}

/**
 * 获取某大类的换算对（年级适配）
 * @param {string} categoryId - 大类ID
 * @param {number} grade - 年级
 * @returns {Array} 换算对列表
 */
export function getConversionsForGrade(categoryId, grade) {
  const category = unitCategories[categoryId];
  if (!category) return [];

  const units = getUnitsForGrade(categoryId, grade);
  const unitIds = new Set(units.map(u => u.id));

  return category.conversions.filter(c => unitIds.has(c.from) && unitIds.has(c.to));
}

/**
 * 生成一道单位换算题
 * @param {string} categoryId - 大类ID
 * @param {number} grade - 年级
 * @returns {object} 题目 { question, answer, fromUnit, toUnit, fromValue, choices }
 */
export function generateConversionQuestion(categoryId, grade) {
  const category = unitCategories[categoryId];
  const conversions = getConversionsForGrade(categoryId, grade);

  if (conversions.length === 0) return null;

  const conv = conversions[Math.floor(Math.random() * conversions.length)];
  const fromUnit = category.units.find(u => u.id === conv.from);
  const toUnit = category.units.find(u => u.id === conv.to);

  // 生成合适的数值
  const factor = conv.factor;
  let fromValue;
  if (factor <= 10) {
    fromValue = Math.floor(Math.random() * 9) + 1;
  } else if (factor <= 100) {
    fromValue = Math.floor(Math.random() * 9) + 1;
    if (Math.random() < 0.3) fromValue = fromValue * 10;
  } else {
    fromValue = Math.floor(Math.random() * 5) + 1;
    if (Math.random() < 0.3) fromValue = fromValue * 10;
  }

  // 根据换算方向决定乘除：小→大用除法，大→小用乘法
  // fromUnit.base / toUnit.base 即换算比率（如 cm→m = 0.01/1 = 0.01）
  let answer = fromValue * (fromUnit.base / toUnit.base);
  // 对涉及非精确换算比率的单位进行浮点取整（如亩 → 保留 4 位小数）
  if (fromUnit.id === 'mu' || toUnit.id === 'mu') {
    answer = Math.round(answer * 10000) / 10000;
  }

  // 生成干扰选项
  const wrongOptions = generateWrongConversionOptions(answer, factor, 3);
  const choices = shuffleArray([answer, ...wrongOptions]);

  return {
    question: `${fromValue} ${fromUnit.name} = ? ${toUnit.name}`,
    answer,
    fromUnit: fromUnit.name,
    toUnit: toUnit.name,
    fromValue,
    categoryId,
    categoryName: category.name,
    choices,
    inputType: 'choice'
  };
}

/**
 * 生成错误换算选项
 */
function generateWrongConversionOptions(correct, factor, count) {
  const pool = new Set();
  // 加减误差
  pool.add(correct + factor);
  pool.add(correct - factor > 0 ? correct - factor : correct + factor);
  pool.add(correct * 2);
  if (Math.round(correct / 2) !== correct) {
    pool.add(Math.round(correct / 2));
  }
  pool.add(correct + Math.round(factor / 2));

  // 去除正确值
  pool.delete(correct);

  let result = Array.from(pool).filter(n => n > 0 && n !== correct);
  // 不足 count 个时补充生成
  while (result.length < count) {
    const extra = correct + Math.floor(Math.random() * factor * 2 + 1) * (Math.random() < 0.5 ? 1 : -1);
    if (extra > 0 && extra !== correct && !result.includes(extra)) {
      result.push(extra);
    }
  }
  return result.slice(0, count);
}

/**
 * 打乱数组
 */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default {
  unitCategories,
  getCategoryIds,
  getUnitsForGrade,
  getConversionsForGrade,
  generateConversionQuestion
};
