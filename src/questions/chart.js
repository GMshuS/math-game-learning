/**
 * 图表读图题组合生成器
 * 导出 3 个子生成器：chart_bar, chart_line, chart_pie
 * 复用 src/config/charts.js 的数据，只注册可文字化读图题
 */
import { register } from './registry';
import { generateBarChart, generateLineChart, generatePieChart } from '../config/charts';

/**
 * 从图表题数组中随机选取一道
 * @param {Array} questions - 图表读图题数组
 * @param {string} fallbackQ - 兜底题目文字
 * @param {*} fallbackA - 兜底答案
 * @param {Array} fallbackOpts - 兜底选项
 * @returns {{ question, answer, options }}
 */
function pickRandomQuestion(questions, fallbackQ, fallbackA, fallbackOpts) {
  if (!questions || questions.length === 0) {
    return { question: fallbackQ, answer: fallbackA, options: fallbackOpts };
  }
  const q = questions[Math.floor(Math.random() * questions.length)];
  return {
    question: q.question,
    answer: q.answer,
    options: q.choices || []
  };
}

/**
 * 柱状图读图题生成器
 * @param {number} grade - 年级
 * @param {object} _range - 数字范围（本生成器忽略）
 * @returns {{ question, answer, options, type, knowledgeId }}
 */
function generateChartBar(grade, _range) {
  const result = generateBarChart(grade);
  const picked = pickRandomQuestion(
    result.questions,
    '哪种水果最多？',
    '苹果',
    ['苹果', '香蕉', '橘子', '葡萄']
  );
  return {
    question: picked.question,
    answer: picked.answer,
    type: 'chart_bar',
    knowledgeId: 'chart_bar',
    options: picked.options
  };
}

/**
 * 折线图读图题生成器
 * @param {number} grade - 年级
 * @param {object} _range - 数字范围（本生成器忽略）
 * @returns {{ question, answer, options, type, knowledgeId }}
 */
function generateChartLine(grade, _range) {
  const result = generateLineChart(grade);
  const picked = pickRandomQuestion(
    result.questions,
    '哪个月份气温最高？',
    '7月',
    ['6月', '7月', '8月', '9月']
  );
  return {
    question: picked.question,
    answer: picked.answer,
    type: 'chart_line',
    knowledgeId: 'chart_line',
    options: picked.options
  };
}

/**
 * 扇形图读图题生成器
 * @param {number} grade - 年级
 * @param {object} _range - 数字范围（本生成器忽略）
 * @returns {{ question, answer, options, type, knowledgeId }}
 */
function generateChartPie(grade, _range) {
  const result = generatePieChart(grade);
  const picked = pickRandomQuestion(
    result.questions,
    '哪种水果占比最大？',
    '苹果',
    ['苹果', '香蕉', '橘子', '葡萄']
  );
  return {
    question: picked.question,
    answer: picked.answer,
    type: 'chart_pie',
    knowledgeId: 'chart_pie',
    options: picked.options
  };
}

// 注册到题型注册表（模块导入时自动触发）
register('chart_bar', generateChartBar);
register('chart_line', generateChartLine);
register('chart_pie', generateChartPie);

export {
  generateChartBar,
  generateChartLine,
  generateChartPie
};
