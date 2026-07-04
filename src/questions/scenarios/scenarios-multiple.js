/**
 * 倍数关系场景模板（G5）
 * 知识点：multiple_gcd / multiple_lcm / multiple_cycle
 *
 * 模板 MU1-MU6: G5（share_fruit, bus_lcm, tile_gcd, line_up_lcm, light_cycle, candy_lcm）
 *
 * 统一接口：export default { id, gradeMin, gradeMax, weight, generate }
 */
import { randomInt, pick } from '../_helpers.js';
import { GCD, LCM } from '../_helpers.js';

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
//  G5 模板（MU1-MU6）— multiple_gcd / multiple_lcm / multiple_cycle
// ============================================================

/**
 * MU1: share_fruit — 平分水果求最大人数 → multiple_gcd
 * 例：将24个苹果和18个橘子平分给小朋友，每人分到同样多，最多分给几个小朋友？
 *
 * apples ∈ {18,24,30,36}, oranges ∈ {12,18,24,30}
 * gcd = GCD(apples, oranges)，确保 gcd ≥ 2
 */
function generateShareFruit() {
  let apples = pick([18, 24, 30, 36]);
  let oranges = pick([12, 18, 24, 30]);
  let gcd = GCD(apples, oranges);
  // 重试直到 gcd ≥ 2
  while (gcd < 2) {
    apples = pick([18, 24, 30, 36]);
    oranges = pick([12, 18, 24, 30]);
    gcd = GCD(apples, oranges);
  }
  const question = `将${apples}个苹果和${oranges}个橘子平分给小朋友，每人分到同样多，最多分给几个小朋友？`;
  return {
    knowledgeId: 'multiple_gcd',
    question,
    parts: [
      { type: 'number', answer: gcd, label: '个小朋友' }
    ]
  };
}

/**
 * MU2: bus_lcm — 公交车同时发车时间 → multiple_lcm
 * 例：3路车每8分钟一班，5路车每12分钟一班，早上6点同时发车，下一次同时发车是几时几分？
 *
 * busA ∈ {6,8,10,12}, busB ∈ {8,10,12,15}
 * lcm = LCM(busA, busB)
 * hour = 6 + floor(lcm / 60), min = lcm % 60
 */
function generateBusLCM() {
  const busA = pick([6, 8, 10, 12]);
  const busB = pick([8, 10, 12, 15]);
  const lcm = LCM(busA, busB);
  const hour = 6 + Math.floor(lcm / 60);
  const min = lcm % 60;
  const zeroPad = (n) => String(n).padStart(2, '0');
  const question = `3路车每${busA}分钟一班，5路车每${busB}分钟一班，早上6点同时发车，下一次同时发车是几时${zeroPad(min)}分？`;
  return {
    knowledgeId: 'multiple_lcm',
    question,
    parts: [
      { type: 'number', answer: hour, label: '时' },
      { type: 'number', answer: min, label: '分' }
    ]
  };
}

/**
 * MU3: tile_gcd — 地砖最大边长 → multiple_gcd
 * 例：用正方形地砖铺满长24分米宽18分米的房间，地砖边长最大是多少分米？
 *
 * lenDm ∈ {18,20,24,28,30}, widDm ∈ {12,15,16,18,20,24}
 * gcd = GCD(lenDm, widDm)，确保 gcd ≥ 2
 */
function generateTileGCD() {
  const lenCandidates = [18, 20, 24, 28, 30];
  const widCandidates = [12, 15, 16, 18, 20, 24];
  let lenDm = pick(lenCandidates);
  let widDm = pick(widCandidates);
  let gcd = GCD(lenDm, widDm);
  // 重试直到 gcd ≥ 2
  while (gcd < 2) {
    lenDm = pick(lenCandidates);
    widDm = pick(widCandidates);
    gcd = GCD(lenDm, widDm);
  }
  const question = `用正方形地砖铺满长${lenDm}分米宽${widDm}分米的房间，地砖边长最大是多少分米？`;
  return {
    knowledgeId: 'multiple_gcd',
    question,
    parts: [
      { type: 'number', answer: gcd, label: '分米' }
    ]
  };
}

/**
 * MU4: line_up_lcm — 排队最少人数 → multiple_lcm
 * 例：一排队伍，每行站6人或每行站8人都刚好站完，这个排至少有多少人？
 *
 * rowA ∈ {4,5,6,8}, rowB ∈ {6,7,8,9}
 * lcm = LCM(rowA, rowB)
 */
function generateLineUpLCM() {
  const rowA = pick([4, 5, 6, 8]);
  const rowB = pick([6, 7, 8, 9]);
  // 确保 rowA !== rowB（有意义的不同）
  if (rowA === rowB) {
    const choices = [6, 7, 8, 9].filter(v => v !== rowA);
    return generateLineUpLCM._retry(rowA, pick(choices));
  }
  const lcm = LCM(rowA, rowB);
  const question = `一排队伍，每行站${rowA}人或每行站${rowB}人都刚好站完，这个排至少有多少人？`;
  return {
    knowledgeId: 'multiple_lcm',
    question,
    parts: [
      { type: 'number', answer: lcm, label: '人' }
    ]
  };
}
generateLineUpLCM._retry = (a, b) => {
  const lcm = LCM(a, b);
  const question = `一排队伍，每行站${a}人或每行站${b}人都刚好站完，这个排至少有多少人？`;
  return {
    knowledgeId: 'multiple_lcm',
    question,
    parts: [
      { type: 'number', answer: lcm, label: '人' }
    ]
  };
};

/**
 * MU5: light_cycle — 彩灯周期颜色 → multiple_cycle
 * 例：彩灯按红→黄→蓝→红→黄→蓝……的顺序循环亮，第25盏灯是什么颜色？
 *
 * colors = ['红','黄','蓝'], n = 3
 * nth ∈ [15, 40]
 * remainder = nth % n
 * idx = remainder === 0 ? n-1 : remainder-1
 * parts: choice with options ['红','黄','蓝']
 */
function generateLightCycle() {
  const colors = ['红', '黄', '蓝'];
  const n = colors.length;
  const nth = randomInt(15, 40);
  const remainder = nth % n;
  const idx = remainder === 0 ? n - 1 : remainder - 1;
  const answerColor = colors[idx];
  const question = `彩灯按红→黄→蓝→红→黄→蓝……的顺序循环亮，第${nth}盏灯是什么颜色？`;
  return {
    knowledgeId: 'multiple_cycle',
    question,
    parts: [
      { type: 'choice', answer: answerColor, options: ['红', '黄', '蓝'] }
    ]
  };
}

/**
 * MU6: candy_lcm — 糖果最少颗数 → multiple_lcm
 * 例：一些糖果，每人分4颗或每人分6颗都刚好分完，糖果至少有多少颗？
 *
 * perPerson ∈ {3,4,5,6}
 * perPerson2 = perPerson + randomInt(1, 3)（不同的数）
 * lcm = LCM(perPerson, perPerson2)
 */
function generateCandyLCM() {
  const perPerson = pick([3, 4, 5, 6]);
  const delta = pick([1, 2, 3]);
  const perPerson2 = perPerson + delta;
  const lcm = LCM(perPerson, perPerson2);
  const question = `一些糖果，每人分${perPerson}颗或每人分${perPerson2}颗都刚好分完，糖果至少有多少颗？`;
  return {
    knowledgeId: 'multiple_lcm',
    question,
    parts: [
      { type: 'number', answer: lcm, label: '颗' }
    ]
  };
}

// ============================================================
//  模板注册
// ============================================================
const g5Templates = [
  { fn: generateShareFruit, weight: 3 },
  { fn: generateBusLCM, weight: 3 },
  { fn: generateTileGCD, weight: 2 },
  { fn: generateLineUpLCM, weight: 2 },
  { fn: generateLightCycle, weight: 2 },
  { fn: generateCandyLCM, weight: 2 }
];

// ============================================================
//  场景模块默认导出
// ============================================================
export default {
  id: 'multiple',
  gradeMin: 5,
  gradeMax: 5,
  weight: 5,

  /**
   * 按年级生成倍数关系应用题
   * @param {number} grade - 当前年级（仅支持 G5）
   * @param {object} _range - 数字范围（本场景未使用）
   * @returns {object} 题目对象
   */
  generate(_grade, _range) {
    // G5 及以上使用 G5 模板（仅 G5 有定义）
    const result = weightedPick(g5Templates).fn();
    return toResult(result);
  }
};
