/**
 * 场景题型调度器
 *
 * 根据年级筛选适用场景模块，按模块权重加权随机生成应用题。
 * 统一出口：generate(grade, range) → 标准题目对象
 *
 * 集成链路：
 *   questionGenerator.js
 *     └─ registryGenerate('scenario', grade, range)
 *          └─ scenarios/index.js (generate)
 *               ├─ 筛选 gradeMin≤grade≤gradeMax 的场景模块
 *               ├─ 按模块 weight 加权随机选择场景
 *               ├─ 调用 scenario.generate(grade, range)
 *               └─ 标准化输出（补充 answer / operands / type）
 *
 * 约束：调度器不持有状态，每次调用独立随机选择。
 */
import timeScenario from './scenarios-time.js';
import moneyScenario from './scenarios-money.js';
import measureScenario from './scenarios-measure.js';
import buildingScenario from './scenarios-building.js';
import dataScenario from './scenarios-data.js';
import multipleScenario from './scenarios-multiple.js';
import ratioScenario from './scenarios-ratio.js';
import compositeScenario from './scenarios-composite.js';

// 所有已实现的场景模块（Phase 1-4）
const scenarios = [
  timeScenario,
  moneyScenario,
  measureScenario,
  buildingScenario,
  dataScenario,
  multipleScenario,
  ratioScenario,
  compositeScenario
];

/**
 * 加权随机选择
 * @param {Array<{weight: number}>} items
 * @returns {object} 被选中的项
 */
function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

/**
 * 标准化题目对象，确保向后兼容字段
 * @param {object} question - 场景模块返回的原始题目
 * @returns {object} 标准化后的题目对象
 */
function normalizeQuestion(question) {
  const parts = question.parts || [];
  return {
    ...question,
    type: 'word',
    operands: question.operands !== undefined
      ? question.operands.filter(v => typeof v === 'number' && !Number.isNaN(v))
      : parts.map(p => p.answer).filter(v => typeof v === 'number' && !Number.isNaN(v)),
    answer: question.answer !== undefined
      ? question.answer
      : (parts[0] ? parts[0].answer : 0)
  };
}

/**
 * 按年级生成场景应用题
 *
 * @param {number} grade - 当前年级（1-6）
 * @param {object} range - 数字范围 { min, max }（由 grades.js 提供）
 * @returns {object} 标准题目对象
 */
export function generate(grade, range) {
  // 1. 筛选当前年级适用的场景模块
  const candidates = scenarios.filter(
    s => s.gradeMin <= grade && grade <= s.gradeMax
  );

  if (candidates.length === 0) {
    // 兜底：找不到适用场景时使用 time（覆盖 G1）
    return normalizeQuestion(timeScenario.generate(grade, range));
  }

  // 2. 按模块权重加权随机选择场景
  const scenario = weightedPick(candidates);

  // 3. 调用场景模块生成题目
  const question = scenario.generate(grade, range);

  // 4. 标准化并返回
  return normalizeQuestion(question);
}

export default { generate, scenarios };
