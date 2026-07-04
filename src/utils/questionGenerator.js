/**
 * 数学题目生成器
 * 支持加减乘除、分数、小数、百分比等运算
 * 题型生成逻辑委托给 src/questions/ 下的独立模块，通过注册表管理
 *
 * 题目工具函数（选项生成、答案校验、选择题格式转换）请使用 questionUtils.js。
 */
import { getGradeRange, getGradeOperations } from '../config/grades';
import { generate as registryGenerate, register } from '../questions/registry';
import { gradeQuestionWeights } from '../config/gradeQuestionWeights';
import { getAdjustedWeights, recordTypeGenerated } from '../config/knowledgeWeights';
import {
  weightedRandom,
  createDiversityAwarePicker as wtCreateDiversityAwarePicker
} from '../utils/weightTools';
import { STORAGE_KEYS } from '../utils/storage';
import { useMathKnowledgeStore } from '../store/mathKnowledgeStore';
import { randomInt } from '../questions/_helpers';
import { useCustomTemplateStore } from '../store/customTemplateStore';
import { generate as generateCustomQuestion, getCustomWeight } from './customTemplateGenerator';
import { mergeWeightsForRange, getAvailableTypesForRange } from './gradeRangeWeights';
import { generate as generateScenario } from '../questions/scenarios/index.js';

// 显式导入所有题型生成器（非 side-effect import，避免 tree-shaking 移除）
import generateAddition from '../questions/addition';
import generateSubtraction from '../questions/subtraction';
import generateMultiplication from '../questions/multiplication';
import generateDivision from '../questions/division';
import generateMixedOperation from '../questions/mixed';
import generateFraction from '../questions/fraction';
import generateDecimal from '../questions/decimal';
import generatePercentage from '../questions/percentage';
import generateWordProblem from '../questions/wordProblem';
import generateNumberFill from '../questions/numberFill';
import generateEstimate from '../questions/estimate';
import generateEquation from '../questions/equation';
import generateNumberCompare from '../questions/numberCompare';
import generatePlaceValue from '../questions/placeValue';
import generateNumberProperty from '../questions/numberProperty';
import generateOperationLaw from '../questions/operationLaw';
import generatePatternFind from '../questions/patternFind';
import generateAverageCalc from '../questions/averageCalc';
import generateNegativeNumber from '../questions/negativeNumber';
import generateRatioProportion from '../questions/ratioProportion';

// 单位换算 & 图表读图题 & 几何题生成器（side-effect import：模块内自注册）
import '../questions/unit';
import '../questions/chart';
import '../questions/geometry';

// 显式注册所有题型，确保 tree-shaking 安全
register('add', generateAddition);
register('subtract', generateSubtraction);
register('multiply', generateMultiplication);
register('divide', generateDivision);
register('mixed', generateMixedOperation);
register('fraction', generateFraction);
register('decimal', generateDecimal);
register('percentage', generatePercentage);
register('word', generateWordProblem);
register('numberFill', generateNumberFill);
register('estimate', generateEstimate);
register('equation', generateEquation);
register('numberCompare', generateNumberCompare);
register('placeValue', generatePlaceValue);
register('numberProperty', generateNumberProperty);
register('operationLaw', generateOperationLaw);
register('patternFind', generatePatternFind);
register('averageCalc', generateAverageCalc);
register('negativeNumber', generateNegativeNumber);
register('ratioProportion', generateRatioProportion);
register('scenario', generateScenario);

/**
 * 创建本地多样性感知选择器（包装 weightTools 版，添加 recordTypeGenerated）
 * @param {Object} adjustedWeights - 调整后的权重
 * @returns {Function} pick() → type
 */
function createDiversityAwarePicker(adjustedWeights) {
  const picker = wtCreateDiversityAwarePicker(adjustedWeights);
  return function pick() {
    const type = picker();
    recordTypeGenerated(type);
    return type;
  };
}

/**
 * 加载 AdminPanel 的权重覆盖配置，合并到 gradeQuestionWeights
 * 无覆盖时返回 null，调用方回退到默认配置
 * @returns {Object|null} 合并后的 { grade: { type: weight } } 对象或 null
 */
function loadGradeWeightsWithOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_OVERRIDES);
    if (!raw) return null;
    const overrides = JSON.parse(raw);
    if (!overrides.grades || Object.keys(overrides.grades).length === 0) return null;
    // 深拷贝默认权重，避免修改全局配置
    const weights = JSON.parse(JSON.stringify(gradeQuestionWeights));
    for (const [gradeStr, types] of Object.entries(overrides.grades)) {
      const grade = Number(gradeStr);
      if (weights[grade]) {
        Object.assign(weights[grade], types);
      }
    }
    return weights;
  } catch {
    return null;
  }
}

/**
 * 根据年级生成题目
 * 支持 options.gradeRange 参数实现多年级区间出题
 */
export function generateQuestion(grade = 1, questionType = 'random', options = {}) {
  const gradeRange = options.gradeRange || { min: grade, max: grade };
  const range = getGradeRange(grade);
  const operations = getGradeOperations(grade);
  
  if (questionType === 'random') {
    // 使用区间合并权重，整合 AdminPanel 权重覆盖（单年级时等价于 gradeQuestionWeights[grade]）
    const effectiveWeights = loadGradeWeightsWithOverrides();
    const mergedWeights = mergeWeightsForRange(gradeRange.min, gradeRange.max, 'linear_up', effectiveWeights);
    
    if (mergedWeights && Object.keys(mergedWeights).length > 0) {
      // 获取区间可用题型并集
      const availableTypes = getAvailableTypesForRange(gradeRange.min, gradeRange.max);
      const filteredWeights = {};
      for (const type of availableTypes) {
        if (mergedWeights[type] !== undefined) {
          filteredWeights[type] = mergedWeights[type];
        }
      }
      // ★ custom 题型集成（策略C1）
      // 仅在调用方传入了 mode 参数且该模式启用了 custom 模板时加入
      if (options && options.mode) {
        const customTemplateStore = useCustomTemplateStore();
        if (customTemplateStore.isModeEnabled(options.mode)) {
          const customWeight = getCustomWeight(grade);
          if (customWeight > 0) {
            filteredWeights.custom = customWeight;
          }
        }
      }
      if (Object.keys(filteredWeights).length > 0) {
        // ★ 注入错题反馈权重
        const mathKnowledgeStore = useMathKnowledgeStore();
        const adjustedWeights = getAdjustedWeights(grade, filteredWeights, mathKnowledgeStore);
        questionType = weightedRandom(adjustedWeights);
      } else {
        // Fallback: 等概率选择可用题型
        questionType = availableTypes[randomInt(0, availableTypes.length - 1)];
      }
    } else {
      // Fallback: 权重配置不存在，回退到原有等概率逻辑
      const availableTypes = [];
      if (operations.includes('add')) availableTypes.push('add');
      if (operations.includes('subtract')) availableTypes.push('subtract');
      if (operations.includes('multiply')) availableTypes.push('multiply');
      if (operations.includes('divide')) availableTypes.push('divide');
      if (operations.includes('fraction')) availableTypes.push('fraction');
      if (operations.includes('decimal')) availableTypes.push('decimal');
      if (operations.includes('percentage')) availableTypes.push('percentage');
      // 1-3 年级可以生成应用题
      if (grade <= 3 && Math.random() < 0.3) {
        availableTypes.push('word');
      }
      if (grade >= 3 && operations.includes('multiply') && operations.includes('add')) {
        availableTypes.push('mixed');
      }
      questionType = availableTypes[randomInt(0, availableTypes.length - 1)];
    }
  }
  
  let question;
  // ★ custom 类型的特殊处理：通过 customTemplateGenerator 生成
  if (questionType === 'custom') {
    const customQuestion = generateCustomQuestion(grade);
    if (customQuestion) {
      question = customQuestion;
    } else {
      // 生成失败，回退到加法
      questionType = 'add';
      question = registryGenerate('add', grade, range);
    }
  } else {
    // 统一走注册表生成题目（word 类型已通过 src/questions/wordProblem.js 注册）
    question = registryGenerate(questionType, grade, range);
  }
  if (!question) {
    // fallback 到加法
    question = registryGenerate('add', grade, range);
  }
  // 使用扩展运算符创建新对象，避免修改注册表返回的共享引用
  question = {
    ...question,
    grade,
    difficulty: getDifficulty(grade, questionType),
    id: generateQuestionId(),
    createdAt: new Date().toISOString()
  };
  
  return question;
}

/**
 * 计算题目难度
 */
function getDifficulty(grade, type) {
  const easyTypes = ['add', 'subtract'];
  const mediumTypes = ['multiply', 'divide', 'word'];
  
  if (easyTypes.includes(type)) return 'easy';
  if (mediumTypes.includes(type)) return 'medium';
  return 'hard';
}

/**
 * 生成题目 ID
 */
function generateQuestionId() {
  return 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
}

/**
 * 生成一组题目
 * 当 types 数组不为空时，按权重配置分发题型（而非等概率）；
 * 为空时由 generateQuestion(grade, 'random') 按全量权重分发。
 */
export function generateQuestionSet(grade, count = 10, options = {}) {
  const {
    types = [],
    difficulty = 'random',
    mode
  } = options;

  // --- 确定题型选择策略 ---
  let pickType;
  if (types.length > 0) {
    const gradeWeights = gradeQuestionWeights[grade];
    if (gradeWeights) {
      // 从 gradeWeights 中过滤出只包含 types 指定且有权重的条目
      const filteredWeights = {};
      for (const t of types) {
        if (gradeWeights[t] !== undefined) {
          filteredWeights[t] = gradeWeights[t];
        }
      }
      if (Object.keys(filteredWeights).length > 0) {
        // ★ 注入错题反馈权重 + 多样性约束
        const mathKnowledgeStore = useMathKnowledgeStore();
        const adjustedWeights = getAdjustedWeights(grade, filteredWeights, mathKnowledgeStore);
        pickType = createDiversityAwarePicker(adjustedWeights);
      } else {
        // 备选：指定题型都无权重时回退等概率
        pickType = () => types[randomInt(0, types.length - 1)];
      }
    } else {
      // 年级权重配置不存在时回退等概率
      pickType = () => types[randomInt(0, types.length - 1)];
    }
  } else {
    // types 为空 → 使用完整权重 + 多样性约束（只计算一次 adjustedWeights）
    const gradeRange = options.gradeRange || { min: grade, max: grade };
    const effectiveWeights = loadGradeWeightsWithOverrides();
    const mergedWeights = mergeWeightsForRange(gradeRange.min, gradeRange.max, 'linear_up', effectiveWeights);

    if (mergedWeights && Object.keys(mergedWeights).length > 0) {
      const availableTypes = getAvailableTypesForRange(gradeRange.min, gradeRange.max);
      const filteredWeights = {};
      for (const type of availableTypes) {
        if (mergedWeights[type] !== undefined) {
          filteredWeights[type] = mergedWeights[type];
        }
      }
      // custom 题型集成（策略C1）
      if (mode) {
        const customTemplateStore = useCustomTemplateStore();
        if (customTemplateStore.isModeEnabled(mode)) {
          const customWeight = getCustomWeight(grade);
          if (customWeight > 0) {
            filteredWeights.custom = customWeight;
          }
        }
      }
      if (Object.keys(filteredWeights).length > 0) {
        const mathKnowledgeStore = useMathKnowledgeStore();
        const adjustedWeights = getAdjustedWeights(grade, filteredWeights, mathKnowledgeStore);
        pickType = createDiversityAwarePicker(adjustedWeights);
      } else {
        // Fallback: 等概率选择可用题型
        pickType = () => availableTypes[randomInt(0, availableTypes.length - 1)];
      }
    } else {
      // Fallback: 权重配置不存在，回退到等概率
      const operations = getGradeOperations(grade);
      const fallbackTypes = [];
      if (operations.includes('add')) fallbackTypes.push('add');
      if (operations.includes('subtract')) fallbackTypes.push('subtract');
      if (operations.includes('multiply')) fallbackTypes.push('multiply');
      if (operations.includes('divide')) fallbackTypes.push('divide');
      if (operations.includes('fraction')) fallbackTypes.push('fraction');
      if (operations.includes('decimal')) fallbackTypes.push('decimal');
      if (operations.includes('percentage')) fallbackTypes.push('percentage');
      if (grade <= 3 && Math.random() < 0.3) fallbackTypes.push('word');
      if (grade >= 3 && operations.includes('multiply') && operations.includes('add')) fallbackTypes.push('mixed');
      pickType = () => fallbackTypes[randomInt(0, fallbackTypes.length - 1)];
    }
  }

  const questions = [];

  for (let i = 0; i < count; i++) {
    let question;
    let attempts = 0;

    do {
      const type = pickType();
      question = generateQuestion(grade, type, { mode });
      attempts++;
    } while (
      difficulty !== 'random' &&
      question.difficulty !== difficulty &&
      attempts < 10
    );

    questions.push(question);
  }

  return questions;
}

export default {
  generateQuestion,
  generateQuestionSet
};
