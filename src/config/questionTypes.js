/**
 * 题目难度配置
 */
export const difficultyConfig = {
  easy: {
    label: '简单',
    color: '#4ade80',
    expMultiplier: 1.0,
    coinMultiplier: 1.0,
    timeLimit: null
  },
  medium: {
    label: '中等',
    color: '#fbbf24',
    expMultiplier: 1.5,
    coinMultiplier: 1.5,
    timeLimit: 60
  },
  hard: {
    label: '困难',
    color: '#f87171',
    expMultiplier: 2.0,
    coinMultiplier: 2.0,
    timeLimit: 30
  }
};

/**
 * 题型配置
 */
export const questionTypeConfig = {
  add: {
    label: '加法',
    icon: '➕',
    color: '#60a5fa'
  },
  subtract: {
    label: '减法',
    icon: '➖',
    color: '#f472b6'
  },
  multiply: {
    label: '乘法',
    icon: '✖️',
    color: '#34d399'
  },
  divide: {
    label: '除法',
    icon: '➗',
    color: '#a78bfa'
  },
  mixed: {
    label: '混合运算',
    icon: '🔢',
    color: '#fb923c'
  },
  fraction: {
    label: '分数',
    icon: '📐',
    color: '#2dd4bf'
  },
  decimal: {
    label: '小数',
    icon: '🔢',
    color: '#6ee7b7'
  },
  percentage: {
    label: '百分比',
    icon: '%',
    color: '#fcd34d'
  },
  word: {
    label: '应用题',
    icon: '📝',
    color: '#f87171'
  },
  numberFill: {
    label: '填空题',
    icon: '⬜',
    color: '#a78bfa'
  },
  estimate: {
    label: '估算题',
    icon: '≈',
    color: '#34d399'
  },
  equation: {
    label: '方程求解',
    icon: '✕',
    color: '#fbbf24'
  },
  numberCompare: {
    label: '数的大小比较',
    icon: '⚖️',
    color: '#f97316'
  },
  placeValue: {
    label: '数位认知',
    icon: '🔢',
    color: '#06b6d4'
  },
  numberProperty: {
    label: '数的性质',
    icon: '🔬',
    color: '#8b5cf6'
  },
  operationLaw: {
    label: '运算定律',
    icon: '📐',
    color: '#ec4899'
  },
  patternFind: {
    label: '找规律',
    icon: '🔍',
    color: '#14b8a6'
  },
  averageCalc: {
    label: '平均数',
    icon: '📊',
    color: '#f59e0b'
  },
  negativeNumber: {
    label: '负数',
    icon: '➖',
    color: '#ef4444'
  },
  ratioProportion: {
    label: '比和比例',
    icon: '📏',
    color: '#6366f1'
  },
  // 单位换算题型
  unit_length: {
    label: '长度单位',
    icon: '📏',
    color: '#3b82f6'
  },
  unit_mass: {
    label: '质量单位',
    icon: '⚖️',
    color: '#22c55e'
  },
  unit_time: {
    label: '时间单位',
    icon: '⏰',
    color: '#f59e0b'
  },
  unit_area: {
    label: '面积单位',
    icon: '📐',
    color: '#a78bfa'
  },
  unit_volume: {
    label: '体积单位',
    icon: '🧊',
    color: '#06b6d4'
  },
  unit_currency: {
    label: '货币单位',
    icon: '💰',
    color: '#f97316'
  },
  // 图表读图题型
  chart_bar: {
    label: '条形统计图',
    icon: '📊',
    color: '#3b82f6'
  },
  chart_line: {
    label: '折线统计图',
    icon: '📈',
    color: '#22c55e'
  },
  chart_pie: {
    label: '扇形统计图',
    icon: '🥧',
    color: '#f59e0b'
  },
  // 几何图形题型
  geometry_perimeter: { label: '周长计算', icon: '📏', color: '#3b82f6' },
  geometry_area: { label: '面积计算', icon: '📐', color: '#22c55e' },
  geometry_volume: { label: '体积计算', icon: '📦', color: '#a78bfa' },
  geometry_surface: { label: '表面积计算', icon: '📦', color: '#8b5cf6' },
  geometry_angle: { label: '角度认识', icon: '📐', color: '#f59e0b' },
  geometry_shape: { label: '图形认知', icon: '🔷', color: '#06b6d4' },
  geometry_circle: { label: '圆的认识', icon: '⭕', color: '#ef4444' },
  geometry_transform: { label: '图形变换', icon: '🔄', color: '#ec4899' },
  // 概率题型
  probability_basic: { label: '概率基础', icon: '🎲', color: '#8b5cf6' },
  probability_compare: { label: '概率比较', icon: '⚖️', color: '#f59e0b' },
  probability_calc: { label: '概率计算', icon: '🧮', color: '#ef4444' },
  probability_event: { label: '事件分类', icon: '📋', color: '#06b6d4' }
};

/**
 * 获取难度配置
 */
export function getDifficultyConfig(difficulty) {
  return difficultyConfig[difficulty] || difficultyConfig.easy;
}

/**
 * 获取题型配置
 */
export function getQuestionTypeConfig(type) {
  return questionTypeConfig[type] || questionTypeConfig.add;
}

/**
 * 根据年级获取可用的题型
 */
export function getAvailableTypesForGrade(grade) {
  const typeMap = {
    1: ['add', 'subtract', 'word', 'numberFill',
        'numberCompare', 'placeValue', 'patternFind'],
    2: ['add', 'subtract', 'multiply', 'word', 'numberFill',
        'numberCompare', 'placeValue', 'estimate', 'patternFind'],
     3: ['add', 'subtract', 'multiply', 'divide', 'mixed', 'word',
        'estimate', 'numberCompare', 'numberProperty', 'patternFind',
        'averageCalc',
        'unit_length', 'unit_mass', 'unit_time', 'chart_bar',
        'geometry_shape', 'geometry_perimeter', 'geometry_area', 'geometry_angle',
        'probability_basic', 'probability_compare', 'probability_event'],
     4: ['add', 'subtract', 'multiply', 'divide', 'mixed', 'word',
        'decimal', 'numberCompare', 'numberProperty', 'operationLaw',
        'averageCalc',
        'unit_length', 'unit_mass', 'unit_time', 'unit_area',
        'unit_volume', 'unit_currency',
        'chart_bar', 'chart_line',
        'geometry_shape', 'geometry_perimeter', 'geometry_area', 'geometry_angle', 'geometry_transform',
        'probability_basic', 'probability_compare', 'probability_calc', 'probability_event'],
     5: ['add', 'subtract', 'multiply', 'divide', 'fraction', 'decimal',
        'mixed', 'word', 'equation', 'percentage',
        'numberProperty', 'operationLaw', 'ratioProportion',
        'negativeNumber', 'averageCalc',
        'unit_length', 'unit_mass', 'unit_time', 'unit_area',
        'unit_volume', 'unit_currency',
        'chart_bar', 'chart_line', 'chart_pie',
        'geometry_shape', 'geometry_perimeter', 'geometry_area', 'geometry_volume', 'geometry_surface',
        'geometry_angle', 'geometry_circle', 'geometry_transform',
        'probability_basic', 'probability_compare', 'probability_calc', 'probability_event'],
     6: ['add', 'subtract', 'multiply', 'divide', 'fraction', 'decimal',
        'percentage', 'mixed', 'word', 'equation',
        'numberProperty', 'operationLaw', 'ratioProportion',
        'negativeNumber', 'averageCalc',
        'unit_length', 'unit_mass', 'unit_time', 'unit_area',
        'unit_volume', 'unit_currency',
        'chart_bar', 'chart_line', 'chart_pie',
        'geometry_shape', 'geometry_perimeter', 'geometry_area', 'geometry_volume', 'geometry_surface',
        'geometry_angle', 'geometry_circle', 'geometry_transform',
        'probability_basic', 'probability_compare', 'probability_calc', 'probability_event']
  };

  return typeMap[grade] || typeMap[1];
}

export default {
  difficultyConfig,
  questionTypeConfig,
  getDifficultyConfig,
  getQuestionTypeConfig,
  getAvailableTypesForGrade
};
