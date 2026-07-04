/**
 * 生活度量场景模板（G2-G5）
 * 知识点：measure_length / measure_mass / measure_volume / measure_area
 *
 * 模板 ME1-ME4: G2（track_run, fruit_weight, height_compare, daily_water）
 * 模板 ME5-ME7: G3（garden_area, weight_change, water_bucket）
 * 模板 ME8-ME9: G4（pool_volume, height_complex）
 * 模板 ME10:    G5（drink_divide）
 *
 * 统一接口：export default { id, gradeMin, gradeMax, weight, generate }
 */
import { randomInt, pick } from '../_helpers.js';

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
//  G2 模板（ME1-ME4）— measure_length / measure_mass / measure_volume
// ============================================================

/**
 * ME1: track_run — 操场跑圈 → measure_length
 * 例：操场一圈400米，跑了3圈一共跑了多少米？合多少千米？
 *
 * track = 400, laps ∈ {2,3,4}
 * meters = track * laps, km = meters / 1000
 */
function generateTrackRun() {
  const track = 400;
  const laps = pick([2, 3, 4]);
  const meters = track * laps;
  const km = meters / 1000;
  const question = `操场一圈${track}米，跑了${laps}圈一共跑了多少米？合多少千米？`;
  return {
    knowledgeId: 'measure_length',
    question,
    parts: [
      { type: 'number', answer: meters, label: '米' },
      { type: 'number', answer: km, label: '千米' }
    ]
  };
}

/**
 * ME2: fruit_weight — 水果/大米重量 → measure_mass
 * 例：一箱苹果5千克，买了3箱，一共重多少千克？
 *
 * items = [('一箱苹果',5,10), ('一袋大米',5,25), ('一桶油',2,5)]
 * kg = randomInt(minKg, maxKg)
 * boxes = randomInt(2, 4)
 * total = kg * boxes
 */
function generateFruitWeight() {
  const items = [
    { name: '一箱苹果', min: 5, max: 10 },
    { name: '一袋大米', min: 5, max: 25 },
    { name: '一桶油', min: 2, max: 5 }
  ];
  const item = pick(items);
  const kg = randomInt(item.min, item.max);
  const boxes = randomInt(2, 4);
  const total = kg * boxes;
  const question = `${item.name}${kg}千克，买了${boxes}箱，一共重多少千克？`;
  return {
    knowledgeId: 'measure_mass',
    question,
    parts: [
      { type: 'number', answer: total, label: '千克' }
    ]
  };
}

/**
 * ME3: height_compare — 身高差 → measure_length
 * 例：小红身高120厘米，小明比小红高15厘米，小明多高？合多少米多少厘米？
 *
 * base = randomInt(110, 140), diff = randomInt(5, 20)
 * taller = base + diff
 * meter = Math.floor(taller / 100), cm = taller % 100
 */
function generateHeightCompare() {
  const base = randomInt(110, 140);
  const diff = randomInt(5, 20);
  const taller = base + diff;
  const meter = Math.floor(taller / 100);
  const cm = taller % 100;
  const names = ['小红', '小明', '小华', '小丽'];
  const name = pick(names);
  const question = `${name}身高${base}厘米，小明比${name}高${diff}厘米，小明多高？合多少米多少厘米？`;
  return {
    knowledgeId: 'measure_length',
    question,
    parts: [
      { type: 'number', answer: meter, label: '米' },
      { type: 'number', answer: cm, label: '厘米' }
    ]
  };
}

/**
 * ME4: daily_water — 日饮水量 → measure_volume
 * 例：一杯水200毫升，一天喝了5杯，一共喝了多少毫升？合多少升？
 *
 * cup ∈ {150,200,250}, glasses = randomInt(3, 6)
 * total = cup * glasses, liter = total / 1000
 */
function generateDailyWater() {
  const cup = pick([150, 200, 250]);
  const glasses = randomInt(3, 6);
  const total = cup * glasses;
  const liter = total / 1000;
  const question = `一杯水${cup}毫升，一天喝了${glasses}杯，一共喝了多少毫升？合多少升？`;
  return {
    knowledgeId: 'measure_volume',
    question,
    parts: [
      { type: 'number', answer: total, label: '毫升' },
      { type: 'number', answer: liter, label: '升' }
    ]
  };
}

// ============================================================
//  G3 模板（ME5-ME7）— measure_area / measure_mass / measure_volume
// ============================================================

/**
 * ME5: garden_area — 花坛面积 → measure_area
 * 例：一个花坛长3米宽2米，它的面积是多少平方分米？
 *
 * length ∈ [2, 5], width ∈ [1, 4]
 * areaM2 = length * width, areaDm2 = areaM2 * 100
 */
function generateGardenArea() {
  const length = randomInt(2, 5);
  const width = randomInt(1, 4);
  const areaM2 = length * width;
  const areaDm2 = areaM2 * 100;
  const question = `一个花坛长${length}米宽${width}米，它的面积是多少平方分米？`;
  return {
    knowledgeId: 'measure_area',
    question,
    parts: [
      { type: 'number', answer: areaDm2, label: '平方分米' }
    ]
  };
}

/**
 * ME6: weight_change — 体重变化 → measure_mass
 * 例：小红上个月20千克，这个月长了300克，现在体重多少千克？
 *
 * month1 ∈ {20,22,25,28,30}
 * gain ∈ {300,500,600,800,1000}
 * month2 = month1 + gain/1000
 */
function generateWeightChange() {
  const month1 = pick([20, 22, 25, 28, 30]);
  const gain = pick([300, 500, 600, 800, 1000]);
  const month2 = month1 + gain / 1000;
  const names = ['小红', '小明', '小华', '小丽'];
  const name = pick(names);
  const question = `${name}上个月体重${month1}千克，这个月长了${gain}克，现在体重多少千克？`;
  return {
    knowledgeId: 'measure_mass',
    question,
    parts: [
      { type: 'number', answer: month2, label: '千克' }
    ]
  };
}

/**
 * ME7: water_bucket — 水桶倒水（整除+余数）→ measure_volume
 * 例：一桶水有5升，倒满200毫升的杯子，能倒几杯？还剩多少毫升？
 *
 * bucketL ∈ {4,5,8,10}, cupMl ∈ {200,250,500}
 * cups = Math.floor(bucketL * 1000 / cupMl)
 * remainder = (bucketL * 1000) % cupMl
 */
function generateWaterBucket() {
  const bucketL = pick([4, 5, 8, 10]);
  const cupMl = pick([200, 250, 500]);
  const totalMl = bucketL * 1000;
  const cups = Math.floor(totalMl / cupMl);
  const remainder = totalMl % cupMl;
  const question = `一桶水有${bucketL}升，倒满${cupMl}毫升的杯子，能倒几杯？还剩多少毫升？`;
  return {
    knowledgeId: 'measure_volume',
    question,
    parts: [
      { type: 'number', answer: cups, label: '杯' },
      { type: 'number', answer: remainder, label: '毫升' }
    ]
  };
}

// ============================================================
//  G4 模板（ME8-ME9）— measure_volume / measure_length
// ============================================================

/**
 * ME8: pool_volume — 游泳池水体积 → measure_volume
 * 例：游泳池长25米宽15米深2米，注满水需要多少吨水？（1立方米水=1吨）
 *
 * length ∈ {25,50}, width ∈ {15,20,25}, depth ∈ {1.5,2,2.5}
 * volume = length * width * depth, ton = volume
 */
function generatePoolVolume() {
  const length = pick([25, 50]);
  const width = pick([15, 20, 25]);
  const depth = pick([1.5, 2, 2.5]);
  const volume = length * width * depth;
  const ton = volume;
  const question = `游泳池长${length}米宽${width}米深${depth}米，注满水需要多少吨水？（1立方米水=1吨）`;
  return {
    knowledgeId: 'measure_volume',
    question,
    parts: [
      { type: 'number', answer: ton, label: '吨' }
    ]
  };
}

/**
 * ME9: height_complex — 身高合多少厘米 → measure_length
 * 例：小明身高1米15厘米，合多少厘米？
 *
 * meter ∈ {1,1,1,1,2}（偏向1米多）
 * cm ∈ {5,15,20,35,45,50,55,65,75,85,95}
 * totalCm = meter * 100 + cm
 */
function generateHeightComplex() {
  const meter = pick([1, 1, 1, 1, 2]);
  const cm = pick([5, 15, 20, 35, 45, 50, 55, 65, 75, 85, 95]);
  const totalCm = meter * 100 + cm;
  const names = ['小明', '小红', '小华', '小丽'];
  const name = pick(names);
  const question = `${name}身高${meter}米${cm}厘米，合多少厘米？`;
  return {
    knowledgeId: 'measure_length',
    question,
    parts: [
      { type: 'number', answer: totalCm, label: '厘米' }
    ]
  };
}

// ============================================================
//  G5 模板（ME10）— measure_volume
// ============================================================

/**
 * ME10: drink_divide — 饮料分杯（整除+余数）→ measure_volume
 * 例：一瓶饮料1.5升，倒满200毫升的杯子，能倒几杯？还剩多少毫升？
 *
 * bottleL ∈ {1.5,2,2.5}, cupMl ∈ {150,200,250}
 * totalMl = bottleL * 1000
 * cups = Math.floor(totalMl / cupMl)
 * left = totalMl % cupMl
 */
function generateDrinkDivide() {
  const bottleL = pick([1.5, 2, 2.5]);
  const cupMl = pick([150, 200, 250]);
  const totalMl = bottleL * 1000;
  const cups = Math.floor(totalMl / cupMl);
  const left = totalMl % cupMl;
  const drinks = ['饮料', '果汁', '牛奶', '可乐'];
  const drink = pick(drinks);
  const question = `一瓶${drink}${bottleL}升，倒满${cupMl}毫升的杯子，能倒几杯？还剩多少毫升？`;
  return {
    knowledgeId: 'measure_volume',
    question,
    parts: [
      { type: 'number', answer: cups, label: '杯' },
      { type: 'number', answer: left, label: '毫升' }
    ]
  };
}

// ============================================================
//  模板注册
// ============================================================
const g2Templates = [
  { fn: generateTrackRun, weight: 3 },
  { fn: generateFruitWeight, weight: 3 },
  { fn: generateHeightCompare, weight: 2 },
  { fn: generateDailyWater, weight: 2 }
];

const g3Templates = [
  { fn: generateGardenArea, weight: 3 },
  { fn: generateWeightChange, weight: 2 },
  { fn: generateWaterBucket, weight: 2 }
];

const g4Templates = [
  { fn: generatePoolVolume, weight: 3 },
  { fn: generateHeightComplex, weight: 2 }
];

const g5Templates = [
  { fn: generateDrinkDivide, weight: 2 }
];

// ============================================================
//  场景模块默认导出
// ============================================================
export default {
  id: 'measure',
  gradeMin: 2,
  gradeMax: 5,
  weight: 5,

  /**
   * 按年级生成生活度量应用题
   * @param {number} grade - 当前年级（2-5）
   * @param {object} _range - 数字范围（本场景未使用）
   * @returns {object} 题目对象
   */
  generate(grade, _range) {
    let result;
    if (grade === 2) {
      result = weightedPick(g2Templates).fn();
    } else if (grade === 3) {
      result = weightedPick(g3Templates).fn();
    } else if (grade === 4) {
      result = weightedPick(g4Templates).fn();
    } else {
      // G5 及以上使用 G5 模板
      result = weightedPick(g5Templates).fn();
    }
    return toResult(result);
  }
};
