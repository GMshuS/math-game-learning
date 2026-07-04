/**
 * 数据分析场景模板（G3-G6）
 * 知识点：data_chart / data_average / data_percent / data_probability
 *
 * 模板 D1-D2:  G3（class_birthday, group_count）
 * 模板 D3-D5:  G4（exam_average, bar_chart_text, temp_average）
 * 模板 D6-D7:  G5（line_chart_text, shoot_percent）
 * 模板 D8-D9:  G6（pie_chart_text, probability_ball）
 *
 * 统一接口：export default { id, gradeMin, gradeMax, weight, generate }
 */
import { randomInt, pick, pickN } from '../_helpers.js';

// ============================================================
//  加权随机选择
// ============================================================
function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

// ============================================================
//  统一结果包装
// ============================================================
function toResult({ knowledgeId, question, parts }) {
  return {
    question,
    type: 'word',
    knowledgeId,
    parts,
    operands: parts.map(p => p.answer).filter(v => typeof v === 'number' && !Number.isNaN(v)),
    answer: parts[0].answer
  };
}

// ============================================================
//  G3 模板（D1-D2）— data_chart / data_average
// ============================================================

/**
 * D1: class_birthday — 统计表读取月份 + 人数 → data_chart
 * 例：某班学生出生月份统计：1月5人，3月8人，4月3人，6月7人。哪个月出生的人最多？有多少人？
 *
 * 4个随机月份，每个count ∈ [3,10]
 * parts: text（月份）+ number（人数）
 */
function generateClassBirthday() {
  const months = pickN(['1月', '2月', '3月', '4月', '5月', '6月'], 4);
  const counts = months.map(() => randomInt(3, 10));
  const maxIdx = counts.indexOf(Math.max(...counts));
  const mostMonth = months[maxIdx];
  const mostCount = counts[maxIdx];
  const dataStr = months.map((m, i) => `${m}${counts[i]}人`).join('，');
  const question = `某班学生出生月份统计：${dataStr}。哪个月出生的人最多？有多少人？`;
  return {
    knowledgeId: 'data_chart',
    question,
    parts: [
      { type: 'text', answer: mostMonth, label: '哪个月？' },
      { type: 'number', answer: mostCount, label: '多少人？' }
    ]
  };
}

/**
 * D2: group_count — 分组平均数 → data_average
 * 例：合唱团分组：7人、9人、5人、11人，平均每组多少人？
 *
 * groups ∈ {3,4,5}, counts ∈ [4,12]
 * average = total / groups（整数）
 */
function generateGroupCount() {
  const groups = pick([3, 4, 5]);
  const counts = [];
  for (let i = 0; i < groups; i++) {
    counts.push(randomInt(4, 12));
  }
  const total = counts.reduce((a, b) => a + b, 0);
  const average = total / groups;
  const question = `合唱团分组：${counts.join('人、')}人，平均每组多少人？`;
  return {
    knowledgeId: 'data_average',
    question,
    parts: [
      { type: 'number', answer: average, label: '人' }
    ]
  };
}

// ============================================================
//  G4 模板（D3-D5）— data_average / data_chart
// ============================================================

/**
 * D3: exam_average — 测验平均分 → data_average
 * 例：小明的5次测验成绩分别是85、92、78、96、88分，平均分是多少？
 *
 * 4/5/6次成绩，scores ∈ [72,98]
 * average = round(total / count, 1)
 */
function generateExamAverage() {
  const count = pick([4, 5, 6]);
  const scores = [];
  for (let i = 0; i < count; i++) {
    scores.push(randomInt(72, 98));
  }
  const total = scores.reduce((a, b) => a + b, 0);
  const average = Math.round(total / count * 10) / 10;
  const question = `小明的${count}次测验成绩分别是${scores.join('、')}分，平均分是多少？`;
  return {
    knowledgeId: 'data_average',
    question,
    parts: [
      { type: 'number', answer: average, label: '分' }
    ]
  };
}

/**
 * D4: bar_chart_text — 条形图数据比较 → data_chart
 * 例：喜欢的水果人数：苹果12人，香蕉8人，橘子15人，梨6人。喜欢苹果的比喜欢橘子的多几人？
 *
 * 4种水果，counts ∈ [4,16]
 * diff = |counts[0] - counts[2]|
 */
function generateBarChartText() {
  const fruits = pickN(['苹果', '香蕉', '橘子', '梨', '葡萄'], 4);
  const counts = fruits.map(() => randomInt(4, 16));
  const diff = Math.abs(counts[0] - counts[2]);
  const dataStr = fruits.map((f, i) => `${f}${counts[i]}人`).join('，');
  const question = `喜欢的水果人数：${dataStr}。喜欢${fruits[0]}的比喜欢${fruits[2]}的多几人？`;
  return {
    knowledgeId: 'data_chart',
    question,
    parts: [
      { type: 'number', answer: diff, label: '人' }
    ]
  };
}

/**
 * D5: temp_average — 一周平均气温 → data_average
 * 例：某地一周气温（°C）：28、31、26、29、33、27、30，平均气温是多少度？
 *
 * 7天气温 ∈ [24,33]
 * average = round(total / 7, 1)
 */
function generateTempAverage() {
  const temps = [];
  for (let i = 0; i < 7; i++) {
    temps.push(randomInt(24, 33));
  }
  const total = temps.reduce((a, b) => a + b, 0);
  const average = Math.round(total / 7 * 10) / 10;
  const question = `某地一周气温（°C）：${temps.join('、')}，平均气温是多少度？`;
  return {
    knowledgeId: 'data_average',
    question,
    parts: [
      { type: 'number', answer: average, label: '°C' }
    ]
  };
}

// ============================================================
//  G5 模板（D6-D7）— data_chart / data_percent
// ============================================================

/**
 * D6: line_chart_text — 折线图数据读取 → data_chart
 * 例：某店上半年销量：1月45件，2月62件，3月38件，4月71件，5月55件，6月83件。哪个月销量最高？卖了多少件？
 *
 * 6个月，sales ∈ [30,90]
 * parts: text（月份）+ number（件数）
 */
function generateLineChartText() {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
  const sales = months.map(() => randomInt(30, 90));
  const maxIdx = sales.indexOf(Math.max(...sales));
  const maxMonth = months[maxIdx];
  const maxVal = sales[maxIdx];
  const dataStr = months.map((m, i) => `${m}${sales[i]}件`).join('，');
  const question = `某店上半年销量：${dataStr}。哪个月销量最高？卖了多少件？`;
  return {
    knowledgeId: 'data_chart',
    question,
    parts: [
      { type: 'text', answer: maxMonth, label: '哪个月？' },
      { type: 'number', answer: maxVal, label: '多少件？' }
    ]
  };
}

/**
 * D7: shoot_percent — 投篮命中率 → data_percent
 * 例：小明投篮20次命中14次，命中率是多少？
 *
 * shots ∈ {15,20,25,30}
 * makes ∈ [shots*0.5, shots*0.85]
 * rate = round(makes / shots * 100)
 */
function generateShootPercent() {
  const shots = pick([15, 20, 25, 30]);
  const minMakes = Math.ceil(shots * 0.5);
  const maxMakes = Math.floor(shots * 0.85);
  const makes = randomInt(minMakes, maxMakes);
  const rate = Math.round(makes / shots * 100);
  const question = `小明投篮${shots}次命中${makes}次，命中率是多少？`;
  return {
    knowledgeId: 'data_percent',
    question,
    parts: [
      { type: 'number', answer: rate, label: '%' }
    ]
  };
}

// ============================================================
//  G6 模板（D8-D9）— data_chart / data_probability
// ============================================================

/**
 * D8: pie_chart_text — 扇形图数据计算 → data_chart
 * 例：某班40人最喜欢的运动：足球35%，篮球25%，跑步20%，其他20%。喜欢篮球的有多少人？
 *
 * total ∈ {30,40,50}
 * sports[0].pct ∈ {40,35,30}
 * sports[1].pct = randomInt(floor(remain*0.3), floor(remain*0.5))
 * sports[2].pct = randomInt(floor(remain*0.2), floor(remain*0.3))
 * sports[3].pct = remain - sports[1].pct - sports[2].pct（确保≥5%）
 * 随机选一个运动作为目标
 */
function generatePieChartText() {
  const total = pick([30, 40, 50]);
  const sports = [
    { name: '足球', pct: null },
    { name: '篮球', pct: null },
    { name: '跑步', pct: null },
    { name: '其他', pct: null }
  ];
  sports[0].pct = pick([40, 35, 30]);
  const used = sports[0].pct;
  const remain = 100 - used;

  const max1 = Math.floor(remain * 0.5);
  const min1 = Math.floor(remain * 0.3);
  sports[1].pct = randomInt(min1, max1);

  const max2 = Math.floor(remain * 0.3);
  const min2 = Math.floor(remain * 0.2);
  sports[2].pct = randomInt(min2, Math.min(max2, remain - sports[1].pct - 5));

  sports[3].pct = remain - sports[1].pct - sports[2].pct;
  // 确保最后一项 ≥ 5%
  if (sports[3].pct < 5) {
    sports[3].pct = 5;
    sports[2].pct = remain - sports[1].pct - 5;
  }

  const targetSport = pick(sports);
  const targetCount = Math.round(total * targetSport.pct / 100);
  const dataStr = sports.map(s => `${s.name}${s.pct}%`).join('，');
  const question = `某班${total}人最喜欢的运动：${dataStr}。喜欢${targetSport.name}的有多少人？`;
  return {
    knowledgeId: 'data_chart',
    question,
    parts: [
      { type: 'number', answer: targetCount, label: '人' }
    ]
  };
}

/**
 * D9: probability_ball — 摸球概率（分数形式）→ data_probability
 * 例：盒子里有4个红球和2个蓝球，摸到红球的可能性是多少？（用分数表示）
 *
 * red ∈ {2,3,4,5}, blue ∈ {1,2,3}
 * answer = 'red/total'（分数形式，type: 'text'）
 */
function generateProbabilityBall() {
  const red = pick([2, 3, 4, 5]);
  const blue = pick([1, 2, 3]);
  const total = red + blue;
  const question = `盒子里有${red}个红球和${blue}个蓝球，摸到红球的可能性是多少？（用分数表示）`;
  return {
    knowledgeId: 'data_probability',
    question,
    parts: [
      { type: 'text', answer: `${red}/${total}`, label: '可能性' }
    ]
  };
}

// ============================================================
//  模板注册
// ============================================================
const g3Templates = [
  { fn: generateClassBirthday, weight: 3 },
  { fn: generateGroupCount, weight: 2 }
];

const g4Templates = [
  { fn: generateExamAverage, weight: 3 },
  { fn: generateBarChartText, weight: 2 },
  { fn: generateTempAverage, weight: 3 }
];

const g5Templates = [
  { fn: generateLineChartText, weight: 2 },
  { fn: generateShootPercent, weight: 2 }
];

const g6Templates = [
  { fn: generatePieChartText, weight: 3 },
  { fn: generateProbabilityBall, weight: 2 }
];

// ============================================================
//  场景模块默认导出
// ============================================================
export default {
  id: 'data',
  gradeMin: 3,
  gradeMax: 6,
  weight: 5,

  /**
   * 按年级生成数据分析应用题
   * @param {number} grade - 当前年级（3-6）
   * @param {object} _range - 数字范围（本场景未使用）
   * @returns {object} 题目对象
   */
  generate(grade, _range) {
    let result;
    if (grade === 3) {
      result = weightedPick(g3Templates).fn();
    } else if (grade === 4) {
      result = weightedPick(g4Templates).fn();
    } else if (grade === 5) {
      result = weightedPick(g5Templates).fn();
    } else {
      // G6 及以上使用 G6 模板
      result = weightedPick(g6Templates).fn();
    }
    return toResult(result);
  }
};
