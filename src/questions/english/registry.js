/**
 * 英语题型注册表
 * 管理各英语题型生成器的注册与调用
 * 结构同 src/questions/registry.js（数学注册表）
 */

const registry = {};

/**
 * 注册一个英语题型生成器
 * @param {string} type - 题型标识 ('beVerb', 'noun', 'article', etc.)
 * @param {function} generator - (level) => { question, answer, type, knowledgeId, ... }
 */
export function register(type, generator) {
  registry[type] = generator;
}

/**
 * 获取已注册的英语题型列表
 * @returns {string[]}
 */
export function getRegisteredTypes() {
  return Object.keys(registry);
}

/**
 * 生成指定类型的英语题目
 * @param {string} type - 题型标识
 * @param {number} level - 难度等级 (1-6)
 * @returns {object|null} 题目对象，若类型未注册则返回 null
 */
export function generate(type, level) {
  const generator = registry[type];
  if (!generator) return null;
  return generator(level);
}
