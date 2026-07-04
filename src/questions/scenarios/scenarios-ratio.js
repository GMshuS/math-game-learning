/**
 * 比例关系场景模板（G6）
 * 知识点：ratio_scale / ratio_distribute / ratio_proportion
 *
 * 模板 R1-R2: 比例尺（R1 map_scale, R5 map_area_scale）
 * 模板 R3-R4: 按比分配（R2 concrete_mix, R6 triangle_ratio）
 * 模板 R5-R6: 正/反比例（R3 proportion_tiles, R4 speed_proportion）
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
//  G6 模板（R1-R6）
// ============================================================

/**
 * R1: map_scale — 比例尺求实际距离 → ratio_scale
 * 例：地图比例尺1:200000，两地在地图上的距离是5厘米，实际距离是多少千米？
 *
 * scale ∈ {200000,500000,1000000,2000000,5000000}
 * mapCm ∈ {3,4,5,6,7,8,10}
 * actualCm = mapCm * scale
 * actualKm = actualCm / 100000
 */
function generateMapScale() {
  const scale = pick([200000, 500000, 1000000, 2000000, 5000000]);
  const mapCm = pick([3, 4, 5, 6, 7, 8, 10]);
  const actualCm = mapCm * scale;
  const actualKm = actualCm / 100000;
  const question = `地图比例尺1:${scale.toLocaleString()}，两地在地图上的距离是${mapCm}厘米，实际距离是多少千米？`;
  return {
    knowledgeId: 'ratio_scale',
    question,
    parts: [
      { type: 'number', answer: actualKm, label: '千米' }
    ]
  };
}

/**
 * R2: concrete_mix — 混凝土按比分配 → ratio_distribute
 * 例：混凝土按水泥:砂:石=1:2:3配制，需要12吨石子，需要水泥和砂各多少吨？
 *
 * cement:sand:stone = 1:2:3 固定
 * stone ∈ {6,9,12,15,18}
 * unit = stone / 3
 * cement = unit * 1
 * sand = unit * 2
 */
function generateConcreteMix() {
  const stone = pick([6, 9, 12, 15, 18]);
  const unit = stone / 3;
  const cement = unit * 1;
  const sand = unit * 2;
  const question = `混凝土按水泥:砂:石=1:2:3配制，需要${stone}吨石子，需要水泥和砂各多少吨？`;
  return {
    knowledgeId: 'ratio_distribute',
    question,
    parts: [
      { type: 'number', answer: cement, label: '水泥（吨）' },
      { type: 'number', answer: sand, label: '砂（吨）' }
    ]
  };
}

/**
 * R3: proportion_tiles — 正比例方砖 → ratio_proportion
 * 例：用同样的方砖铺地，铺12平方米用了120块砖，铺18平方米需要多少块？
 *
 * area1 ∈ {10,12,15,18}
 * tiles1 = area1 * randomInt(10, 15)
 * area2 = area1 + randomInt(3, 10)
 * tiles2 = Math.round(tiles1 / area1 * area2)
 */
function generateProportionTiles() {
  const area1 = pick([10, 12, 15, 18]);
  const tiles1 = area1 * randomInt(10, 15);
  const area2 = area1 + randomInt(3, 10);
  const tiles2 = Math.round(tiles1 / area1 * area2);
  const question = `用同样的方砖铺地，铺${area1}平方米用了${tiles1}块砖，铺${area2}平方米需要多少块？`;
  return {
    knowledgeId: 'ratio_proportion',
    question,
    parts: [
      { type: 'number', answer: tiles2, label: '块' }
    ]
  };
}

/**
 * R4: speed_proportion — 反比例速度时间 → ratio_proportion
 * 例：从A到B，每小时60公里需要5小时，每小时80公里需要多少小时？
 *
 * speedA ∈ {50,60,70,80}
 * hoursA ∈ {4,5,6}
 * dist = speedA * hoursA
 * speedB = speedA + randomInt(10, 30)
 * hoursB = Math.round(dist / speedB * 10) / 10
 */
function generateSpeedProportion() {
  const speedA = pick([50, 60, 70, 80]);
  const hoursA = pick([4, 5, 6]);
  const dist = speedA * hoursA;
  const speedB = speedA + randomInt(10, 30);
  const hoursB = Math.round(dist / speedB * 10) / 10;
  const question = `从A到B，每小时${speedA}公里需要${hoursA}小时，每小时${speedB}公里需要多少小时？`;
  return {
    knowledgeId: 'ratio_proportion',
    question,
    parts: [
      { type: 'number', answer: hoursB, label: '小时' }
    ]
  };
}

/**
 * R5: map_area_scale — 比例尺求实际面积 → ratio_scale
 * 例：一块长方形地在比例尺1:2000的地图上长5厘米宽4厘米，实际面积是多少平方米？
 *
 * scale ∈ {1000,2000,2500}
 * mapLenCm ∈ {4,5,6,8}
 * mapWidCm ∈ {3,4,5}
 * actualLenM = (mapLenCm * scale) / 100
 * actualWidM = (mapWidCm * scale) / 100
 * areaM2 = actualLenM * actualWidM
 */
function generateMapAreaScale() {
  const scale = pick([1000, 2000, 2500]);
  const mapLenCm = pick([4, 5, 6, 8]);
  const mapWidCm = pick([3, 4, 5]);
  const actualLenM = (mapLenCm * scale) / 100;
  const actualWidM = (mapWidCm * scale) / 100;
  const areaM2 = actualLenM * actualWidM;
  const question = `一块长方形地在比例尺1:${scale.toLocaleString()}的地图上长${mapLenCm}厘米宽${mapWidCm}厘米，实际面积是多少平方米？`;
  return {
    knowledgeId: 'ratio_scale',
    question,
    parts: [
      { type: 'number', answer: areaM2, label: '平方米' }
    ]
  };
}

/**
 * R6: triangle_ratio — 三角形角度比 → ratio_distribute
 * 例：三角形三个角的度数比是2:3:4，最大的角是多少度？
 *
 * ratios = [[2,3,4], [1,2,3], [3,4,5], [1,3,5]]
 * sum = r[0]+r[1]+r[2]
 * maxAngle = Math.round(180 * Math.max(...r) / sum)
 */
function generateTriangleRatio() {
  const ratios = [
    [2, 3, 4],
    [1, 2, 3],
    [3, 4, 5],
    [1, 3, 5]
  ];
  const r = pick(ratios);
  const sum = r[0] + r[1] + r[2];
  const maxAngle = Math.round(180 * Math.max(...r) / sum);
  const question = `三角形三个角的度数比是${r[0]}:${r[1]}:${r[2]}，最大的角是多少度？`;
  return {
    knowledgeId: 'ratio_distribute',
    question,
    parts: [
      { type: 'number', answer: maxAngle, label: '度' }
    ]
  };
}

// ============================================================
//  模板注册
// ============================================================
const g6Templates = [
  { fn: generateMapScale, weight: 3 },
  { fn: generateConcreteMix, weight: 3 },
  { fn: generateProportionTiles, weight: 3 },
  { fn: generateSpeedProportion, weight: 2 },
  { fn: generateMapAreaScale, weight: 2 },
  { fn: generateTriangleRatio, weight: 2 }
];

// ============================================================
//  场景模块默认导出
// ============================================================
export default {
  id: 'ratio',
  gradeMin: 6,
  gradeMax: 6,
  weight: 5,

  /**
   * 生成比例关系应用题
   * @param {number} grade - 当前年级（6）
   * @param {object} _range - 数字范围（本场景未使用）
   * @returns {object} 题目对象
   */
  generate(_grade, _range) {
    const result = weightedPick(g6Templates).fn();
    return toResult(result);
  }
};
