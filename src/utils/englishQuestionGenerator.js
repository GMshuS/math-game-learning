/**
 * 英语题目生成器入口模块
 *
 * 通过英语题型注册表分发题型生成请求。
 * 结构同 src/utils/questionGenerator.js（数学题目生成器）。
 *
 * 当前支持题型（由各生成器模块注册）：
 * - beVerb, noun, thereBe, article, presentSimple, presentContinuous
 * - pastTense, futureTense, questionForm, pronoun, adjAdv
 * - comparative, preposition, conjunction, sentenceStructure, basicClause
 *
 * 题型输出格式：
 * - 至少支持 'choice'（选择题）和 'fillBlank'（填空）两种题型
 * - 返回 { question, answer, type, knowledgeId, options? }
 */
import { generate as registryGenerate, register, getRegisteredTypes } from '../questions/english/registry';

// 显式导入所有英语题型生成器（side-effect import：模块内自注册）
import '../questions/english/sprint1-2';
import '../questions/english/sprint3-4';

export { register, getRegisteredTypes };

/**
 * 生成指定类型的英语题目
 * @param {string} type - 语法题型标识（如 'beVerb', 'noun'）
 * @param {number} level - 难度等级 (1-6)
 * @returns {object|null} 题目对象
 */
export function generateQuestion(type, level = 1) {
  const question = registryGenerate(type, level);
  if (!question) return null;

  // 补充通用字段
  return {
    ...question,
    level,
    subject: 'english',
    id: 'eq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11),
    createdAt: new Date().toISOString()
  };
}

/**
 * 生成一组英语题目
 * @param {number} count - 题目数量
 * @param {object} options - 配置项 { types?, level? }
 * @returns {Array<object>} 题目数组
 */
export function generateQuestionSet(count = 10, options = {}) {
  const {
    types = [],
    level = 1
  } = options;

  const availableTypes = types.length > 0
    ? types.filter(t => getRegisteredTypes().includes(t))
    : getRegisteredTypes();

  if (availableTypes.length === 0) return [];

  const questions = [];
  for (let i = 0; i < count; i++) {
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const question = generateQuestion(randomType, level);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

export default {
  register,
  generateQuestion,
  generateQuestionSet,
  getRegisteredTypes
};
