/**
 * 综合实践场景模板（G6）
 * 知识点：composite_travel / composite_building / composite_shopping / composite_work
 *
 * 模板 C1-C4:
 *   C1 road_trip（自驾游综合：比例尺+速度+油耗+费用）
 *   C2 renovation（装修综合：表面积+漆量+费用）
 *   C3 shopping_combo（购物组合折扣：买二送一/折扣组合）
 *   C4 road_work（工程综合：合作铺路+费用）
 *
 * 统一接口：export default { id, gradeMin, gradeMax, weight, generate }
 */
import { randomInt, randomRange, pick } from '../_helpers.js';

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
//  G6 模板（C1-C4）
// ============================================================

/**
 * C1: road_trip — 自驾游综合 → composite_travel
 * 例：暑假自驾游，地图上距离6厘米（比例尺1:5000000），车速70公里/时，
 *     每百公里耗油8升，油价7.5元/升。需要多少小时？油费多少元？
 *
 * mapCm ∈ {4,5,6,8,10}
 * scale ∈ {3000000,5000000,8000000}
 * speed ∈ {60,70,80}
 * fuelPer100Km ∈ {7,8,9,10,12}
 * pricePerL ∈ {7.5,8,8.5}
 *
 * actualKm = mapCm * scale / 100000
 * hours = Math.round(actualKm / speed * 10) / 10
 * fuelL = Math.round(actualKm / 100 * fuelPer100Km * 10) / 10
 * cost = Math.round(fuelL * pricePerL * 100) / 100
 */
function generateRoadTrip() {
  const mapCm = pick([4, 5, 6, 8, 10]);
  const scale = pick([3000000, 5000000, 8000000]);
  const speed = pick([60, 70, 80]);
  const fuelPer100Km = pick([7, 8, 9, 10, 12]);
  const pricePerL = pick([7.5, 8, 8.5]);
  const actualKm = mapCm * scale / 100000;
  const hours = Math.round(actualKm / speed * 10) / 10;
  const fuelL = Math.round(actualKm / 100 * fuelPer100Km * 10) / 10;
  const cost = Math.round(fuelL * pricePerL * 100) / 100;
  const question = `暑假自驾游，地图上距离${mapCm}厘米（比例尺1:${scale.toLocaleString()}），车速${speed}公里/时，每百公里耗油${fuelPer100Km}升，油价${pricePerL}元/升。需要多少小时？油费多少元？`;
  return {
    knowledgeId: 'composite_travel',
    question,
    parts: [
      { type: 'number', answer: hours, label: '小时' },
      { type: 'number', answer: cost, label: '油费（元）' }
    ]
  };
}

/**
 * C2: renovation — 装修综合 → composite_building
 * 例：客厅长6米宽5米高3米，四壁和天花板刷漆，门窗面积8平方米，
 *     每平方米用漆0.25升，每升漆60元。共需多少元？
 *
 * length ∈ {5,6,7,8}
 * width ∈ {4,5,6}
 * height = 3
 * doorWin ∈ {6,8,10,12}
 * paintPerM2 ∈ {0.2,0.25,0.3}
 * pricePerL ∈ {50,60,80}
 *
 * wall = 2*(length+width)*height
 * ceiling = length*width
 * totalM2 = wall + ceiling - doorWin
 * paintL = Math.round(totalM2 * paintPerM2 * 10) / 10
 * totalCost = Math.round(paintL * pricePerL * 100) / 100
 */
function generateRenovation() {
  const length = randomInt(5, 8);
  const width = randomInt(4, 6);
  const height = 3;
  const doorWin = pick([6, 8, 10, 12]);
  const paintPerM2 = pick([0.2, 0.25, 0.3]);
  const pricePerL = pick([50, 60, 80]);
  const wall = 2 * (length + width) * height;
  const ceiling = length * width;
  const totalM2 = wall + ceiling - doorWin;
  const paintL = Math.round(totalM2 * paintPerM2 * 10) / 10;
  const totalCost = Math.round(paintL * pricePerL * 100) / 100;
  const question = `客厅长${length}米宽${width}米高${height}米，四壁和天花板刷漆，门窗面积${doorWin}平方米，每平方米用漆${paintPerM2}升，每升漆${pricePerL}元。共需多少元？`;
  return {
    knowledgeId: 'composite_building',
    question,
    parts: [
      { type: 'number', answer: totalCost, label: '元' }
    ]
  };
}

/**
 * C3: shopping_combo — 购物组合折扣 → composite_shopping
 * 两个变体：
 *   变体A（buy2free1）：买二送一 + 折扣
 *   变体B（discount_combo）：两件商品不同折扣
 *
 * 变体A：
 *   shirtPrice ∈ {60,80,100}
 *   pantsPrice ∈ {100,150,200}
 *   pantsDisc ∈ {7,7.5,8}
 *   shirtTotal = shirtPrice * 2
 *   pantsTotal = Math.floor(pantsPrice * pantsDisc / 10)
 *   grandTotal = shirtTotal + pantsTotal
 *
 * 变体B：
 *   priceA ∈ {100,200,300}
 *   discA ∈ {8,8.5,9}
 *   priceB ∈ {50,80,100,150}
 *   discB ∈ {7,7.5,8}
 *   totalA = Math.floor(priceA * discA / 10)
 *   totalB = Math.floor(priceB * discB / 10)
 *   grandTotal = totalA + totalB
 */
function generateShoppingCombo() {
  const scenario = pick(['buy2free1', 'discount_combo']);
  let question;
  let grandTotal;

  if (scenario === 'buy2free1') {
    const shirtPrice = pick([60, 80, 100]);
    const pantsPrice = pick([100, 150, 200]);
    const pantsDisc = pick([7, 7.5, 8]);
    const shirtTotal = shirtPrice * 2;
    const pantsTotal = Math.floor(pantsPrice * pantsDisc / 10);
    grandTotal = shirtTotal + pantsTotal;
    question = `T恤每件${shirtPrice}元买二送一，裤子原价${pantsPrice}元打${pantsDisc}折。买3件T恤和1条裤子共需多少元？`;
  } else {
    const priceA = pick([100, 200, 300]);
    const discA = pick([8, 8.5, 9]);
    const priceB = pick([50, 80, 100, 150]);
    const discB = pick([7, 7.5, 8]);
    const totalA = Math.floor(priceA * discA / 10);
    const totalB = Math.floor(priceB * discB / 10);
    grandTotal = totalA + totalB;
    const itemsA = ['衣服', '外套', '卫衣', '毛衣'];
    const itemsB = ['鞋子', '帽子', '围巾', '背包'];
    const itemA = pick(itemsA);
    const itemB = pick(itemsB);
    question = `一件${priceA}元的${itemA}打${discA}折，一双${priceB}元的${itemB}打${discB}折，各买一件共需多少元？`;
  }

  return {
    knowledgeId: 'composite_shopping',
    question,
    parts: [
      { type: 'number', answer: grandTotal, label: '元' }
    ]
  };
}

/**
 * C4: road_work — 工程综合 → composite_work
 * 例：铺一条720米的路，甲队每天铺40米（每天2000元），乙队每天铺35米（每天1600元）。
 *     两队合铺需要几天？总费用多少元？
 *
 * 思路：直接生成 days（确保整数），roadLen = daily * days
 * teamA_Speed ∈ {30,40,50,60}
 * teamB_Speed ∈ {25,30,35,40}
 * days ∈ [5, 15]
 * daily = teamA_Speed + teamB_Speed
 * roadLen = daily * days
 * dayRateA = randomInt(1500, 2500)（取整到百）
 * dayRateB = randomInt(1200, 2000)（取整到百）
 * costA = days * dayRateA
 * costB = days * dayRateB
 * total = costA + costB
 */
function generateRoadWork() {
  const teamA_Speed = pick([30, 40, 50, 60]);
  const teamB_Speed = pick([25, 30, 35, 40]);
  const daily = teamA_Speed + teamB_Speed;
  // 生成 5-15 天的工期，确保道路长度为整数
  const days = randomInt(5, 15);
  const roadLen = daily * days;
  // 日薪取整到百
  const dayRateA = randomRange(1500, 2500, 100);
  const dayRateB = randomRange(1200, 2000, 100);
  const total = days * (dayRateA + dayRateB);
  const question = `铺一条${roadLen}米的路，甲队每天铺${teamA_Speed}米（每天${dayRateA}元），乙队每天铺${teamB_Speed}米（每天${dayRateB}元）。两队合铺需要几天？总费用多少元？`;
  return {
    knowledgeId: 'composite_work',
    question,
    parts: [
      { type: 'number', answer: days, label: '天' },
      { type: 'number', answer: total, label: '总费用（元）' }
    ]
  };
}

// ============================================================
//  模板注册
// ============================================================
const g6Templates = [
  { fn: generateRoadTrip, weight: 3 },
  { fn: generateRenovation, weight: 2 },
  { fn: generateShoppingCombo, weight: 2 },
  { fn: generateRoadWork, weight: 2 }
];

// ============================================================
//  场景模块默认导出
// ============================================================
export default {
  id: 'composite',
  gradeMin: 6,
  gradeMax: 6,
  weight: 5,

  /**
   * 生成综合实践应用题
   * @param {number} grade - 当前年级（6）
   * @param {object} _range - 数字范围（本场景未使用）
   * @returns {object} 题目对象
   */
  generate(_grade, _range) {
    const result = weightedPick(g6Templates).fn();
    return toResult(result);
  }
};
