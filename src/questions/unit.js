/**
 * 单位换算组合生成器
 * 导出 6 个子生成器：unit_length, unit_mass, unit_time, unit_area, unit_volume, unit_currency
 * 复用 src/config/units.js 的 generateConversionQuestion
 */
import { register } from './registry';
import { generateConversionQuestion } from '../config/units';

/**
 * 单位大类 → knowledge.js 知识节点 ID 映射
 */
const KNOWLEDGE_ID_MAP = {
  length: 'unit_length',
  mass: 'unit_mass',
  time: 'unit_time',
  area: 'unit_area',
  volume: 'unit_volume',
  currency: 'unit_currency'
};

/**
 * 创建一个单位换算子生成器
 * @param {string} categoryId - units.js 中的大类 ID
 * @returns {function} (grade, range) => { question, answer, options, type, knowledgeId }
 */
function createUnitGenerator(categoryId) {
  const knowledgeId = KNOWLEDGE_ID_MAP[categoryId];
  const typeName = `unit_${categoryId}`;

  return function generateUnitQuestion(grade, _range) {
    const result = generateConversionQuestion(categoryId, grade);

    if (!result) {
      // Fallback：生成器返回空，给一个兜底题
      return {
        question: `单位换算练习题（${categoryId}）`,
        answer: 1,
        type: typeName,
        knowledgeId,
        options: [1, 2, 3, 4]
      };
    }

    return {
      question: result.question,
      answer: result.answer,
      type: typeName,
      knowledgeId,
      options: result.choices
    };
  };
}

// 创建 6 个子生成器
const generateUnitLength = createUnitGenerator('length');
const generateUnitMass = createUnitGenerator('mass');
const generateUnitTime = createUnitGenerator('time');
const generateUnitArea = createUnitGenerator('area');
const generateUnitVolume = createUnitGenerator('volume');
const generateUnitCurrency = createUnitGenerator('currency');

// 注册到题型注册表（模块导入时自动触发）
register('unit_length', generateUnitLength);
register('unit_mass', generateUnitMass);
register('unit_time', generateUnitTime);
register('unit_area', generateUnitArea);
register('unit_volume', generateUnitVolume);
register('unit_currency', generateUnitCurrency);

export {
  generateUnitLength,
  generateUnitMass,
  generateUnitTime,
  generateUnitArea,
  generateUnitVolume,
  generateUnitCurrency
};
