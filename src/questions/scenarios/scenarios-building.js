/**
 * 家装建造场景模板（G3-G6）
 * 知识点：building_area / building_perimeter / building_surface / building_tile / building_volume
 *
 * 模板 B1-B3: G3（desk_glass, fence_garden, lawn_cost）
 * 模板 B4-B5: G4（floor_cost, paint_wall）
 * 模板 B6-B8: G5（floor_tile, tank_volume, gift_wrap）
 * 模板 B9-B10: G6（cylinder_water, pool_tile_cost）
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
//  G3 模板（B1-B3）— building_area / building_perimeter
// ============================================================

/**
 * B1: desk_glass — 书桌配玻璃面积 → building_area
 * 例：给一张长12分米宽6分米的书桌配玻璃，需要多大面积的玻璃？
 *
 * lengthDm ∈ {8,10,12,14,15}, widthDm ∈ {5,6,7,8}
 * areaDm2 = lengthDm * widthDm
 */
function generateDeskGlass() {
  const lengthDm = pick([8, 10, 12, 14, 15]);
  const widthDm = pick([5, 6, 7, 8]);
  const areaDm2 = lengthDm * widthDm;
  const question = `给一张长${lengthDm}分米宽${widthDm}分米的书桌配玻璃，需要多大面积的玻璃？`;
  return {
    knowledgeId: 'building_area',
    question,
    parts: [
      { type: 'number', answer: areaDm2, label: '平方分米' }
    ]
  };
}

/**
 * B2: fence_garden — 篱笆围菜地求宽 → building_perimeter
 * 例：用20米长的篱笆围长方形菜地，长7米，宽是多少米？
 *
 * fenceTotal ∈ {16,18,20,22,24,26,28,30}
 * length ∈ [5, fenceTotal/2 - 2]
 * width = fenceTotal/2 - length（整数）
 */
function generateFenceGarden() {
  const fenceTotal = pick([16, 18, 20, 22, 24, 26, 28, 30]);
  const half = fenceTotal / 2;
  const maxLength = half - 2;
  const length = randomInt(5, maxLength);
  const width = half - length;
  const question = `用${fenceTotal}米长的篱笆围长方形菜地，长${length}米，宽是多少米？`;
  return {
    knowledgeId: 'building_perimeter',
    question,
    parts: [
      { type: 'number', answer: width, label: '米' }
    ]
  };
}

/**
 * B3: lawn_cost — 草坪铺装费用 → building_area
 * 例：一块长方形草坪长15米宽10米，每平方米草坪12元，铺满需要多少钱？
 *
 * length ∈ {10,12,15,18,20,25}, width ∈ {8,10,12,15}
 * unitPrice ∈ {8,10,12,15,18,20}
 * total = length * width * unitPrice
 */
function generateLawnCost() {
  const length = pick([10, 12, 15, 18, 20, 25]);
  const width = pick([8, 10, 12, 15]);
  const unitPrice = pick([8, 10, 12, 15, 18, 20]);
  const area = length * width;
  const total = area * unitPrice;
  const question = `一块长方形草坪长${length}米宽${width}米，每平方米草坪${unitPrice}元，铺满需要多少钱？`;
  return {
    knowledgeId: 'building_area',
    question,
    parts: [
      { type: 'number', answer: total, label: '元' }
    ]
  };
}

// ============================================================
//  G4 模板（B4-B5）— building_area / building_surface
// ============================================================

/**
 * B4: floor_cost — 卧室铺地板费用 → building_area
 * 例：给长6米宽5米的卧室铺木地板，每平方米120元，一共需要多少钱？
 *
 * length ∈ {5,6,7,8}, width ∈ {4,5,6}
 * unitPrice ∈ {80,100,120,150,180}
 * total = length * width * unitPrice
 */
function generateFloorCost() {
  const length = pick([5, 6, 7, 8]);
  const width = pick([4, 5, 6]);
  const unitPrice = pick([80, 100, 120, 150, 180]);
  const area = length * width;
  const total = area * unitPrice;
  const question = `给长${length}米宽${width}米的卧室铺木地板，每平方米${unitPrice}元，一共需要多少钱？`;
  return {
    knowledgeId: 'building_area',
    question,
    parts: [
      { type: 'number', answer: total, label: '元' }
    ]
  };
}

/**
 * B5: paint_wall — 粉刷教室墙壁 → building_surface
 * 例：教室长9米宽6米高3米，门窗面积12平方米，要粉刷四壁需要粉刷多少平方米？
 *
 * length ∈ {7,8,9,10}, width ∈ {5,6,7}, height = 3
 * doorWin ∈ {8,10,12,14}
 * wallArea = 2*(length+width)*height - doorWin
 */
function generatePaintWall() {
  const length = pick([7, 8, 9, 10]);
  const width = pick([5, 6, 7]);
  const height = 3;
  const doorWin = pick([8, 10, 12, 14]);
  const wallArea = 2 * (length + width) * height - doorWin;
  const question = `教室长${length}米宽${width}米高${height}米，门窗面积${doorWin}平方米，要粉刷四壁需要粉刷多少平方米？`;
  return {
    knowledgeId: 'building_surface',
    question,
    parts: [
      { type: 'number', answer: wallArea, label: '平方米' }
    ]
  };
}

// ============================================================
//  G5 模板（B6-B8）— building_tile / building_volume / building_surface
// ============================================================

/**
 * B6: floor_tile — 地砖数量（取整）→ building_tile
 * 例：客厅长6米宽5米，铺边长50厘米的正方形地砖，至少需要多少块？
 *
 * roomLen ∈ {5,6,7,8}, roomWid ∈ {4,5,6}
 * tileSideCm ∈ {40,50,60,80}
 * areaM2 = roomLen * roomWid
 * areaCm2 = areaM2 * 10000
 * tileArea = tileSideCm * tileSideCm
 * tiles = Math.ceil(areaCm2 / tileArea)
 */
function generateFloorTile() {
  const roomLen = pick([5, 6, 7, 8]);
  const roomWid = pick([4, 5, 6]);
  const tileSideCm = pick([40, 50, 60, 80]);
  const areaM2 = roomLen * roomWid;
  const areaCm2 = areaM2 * 10000;
  const tileArea = tileSideCm * tileSideCm;
  const tiles = Math.ceil(areaCm2 / tileArea);
  const question = `客厅长${roomLen}米宽${roomWid}米，铺边长${tileSideCm}厘米的正方形地砖，至少需要多少块？`;
  return {
    knowledgeId: 'building_tile',
    question,
    parts: [
      { type: 'number', answer: tiles, label: '块' }
    ]
  };
}

/**
 * B7: tank_volume — 鱼缸水体积 → building_volume
 * 例：一个长方体鱼缸长80厘米宽50厘米高40厘米，最多能装多少升水？
 *
 * lengthCm ∈ {60,80,100,120}, widthCm ∈ {40,50,60}, heightCm ∈ {40,50,60}
 * volumeCm3 = lengthCm * widthCm * heightCm
 * volumeL = volumeCm3 / 1000
 */
function generateTankVolume() {
  const lengthCm = pick([60, 80, 100, 120]);
  const widthCm = pick([40, 50, 60]);
  const heightCm = pick([40, 50, 60]);
  const volumeCm3 = lengthCm * widthCm * heightCm;
  const volumeL = volumeCm3 / 1000;
  const question = `一个长方体鱼缸长${lengthCm}厘米宽${widthCm}厘米高${heightCm}厘米，最多能装多少升水？`;
  return {
    knowledgeId: 'building_volume',
    question,
    parts: [
      { type: 'number', answer: volumeL, label: '升' }
    ]
  };
}

/**
 * B8: gift_wrap — 礼盒包装纸表面积 → building_surface
 * 例：长方体礼盒长25厘米宽20厘米高15厘米，包装这个礼盒至少需要多少平方厘米包装纸？
 *
 * l ∈ {20,25,30,35}, w ∈ {15,20,25}, h ∈ {10,12,15,18}
 * surface = 2*(l*w + l*h + w*h)
 */
function generateGiftWrap() {
  const l = pick([20, 25, 30, 35]);
  const w = pick([15, 20, 25]);
  const h = pick([10, 12, 15, 18]);
  const surface = 2 * (l * w + l * h + w * h);
  const question = `长方体礼盒长${l}厘米宽${w}厘米高${h}厘米，包装这个礼盒至少需要多少平方厘米包装纸？`;
  return {
    knowledgeId: 'building_surface',
    question,
    parts: [
      { type: 'number', answer: surface, label: '平方厘米' }
    ]
  };
}

// ============================================================
//  G6 模板（B9-B10）— building_volume / building_surface（π=3.14）
// ============================================================

/**
 * B9: cylinder_water — 圆柱水桶体积（π=3.14）→ building_volume
 * 例：圆柱形水桶底面半径20厘米，高40厘米，能装多少升水？（π取3.14）
 *
 * radiusCm ∈ {15,20,25,30}, heightCm ∈ {30,40,50}
 * pi = 3.14
 * volumeCm3 = pi * radiusCm * radiusCm * heightCm
 * volumeL = Math.round(volumeCm3 / 1000 * 100) / 100
 */
function generateCylinderWater() {
  const radiusCm = pick([15, 20, 25, 30]);
  const heightCm = pick([30, 40, 50]);
  const pi = 3.14;
  const volumeCm3 = pi * radiusCm * radiusCm * heightCm;
  const volumeL = Math.round(volumeCm3 / 1000 * 100) / 100;
  const question = `圆柱形水桶底面半径${radiusCm}厘米，高${heightCm}厘米，能装多少升水？（π取3.14）`;
  return {
    knowledgeId: 'building_volume',
    question,
    parts: [
      { type: 'number', answer: volumeL, label: '升' }
    ]
  };
}

/**
 * B10: pool_tile_cost — 水池贴砖费用（π=3.14）→ building_surface
 * 例：一个圆柱形水池底面直径4米高2.5米，给池底和池壁贴瓷砖，每平方米80元，共需多少钱？（π取3.14）
 *
 * diameter ∈ {3,4,5,6}, height ∈ {2,2.5,3}
 * pi = 3.14, r = diameter / 2
 * side = 2 * pi * r * height（侧面积）
 * bottom = pi * r * r（底面积）
 * total = Math.round((side + bottom) * 100) / 100
 * unitPrice ∈ {50,60,80,100}
 * cost = Math.round(total * unitPrice * 100) / 100
 */
function generatePoolTileCost() {
  const diameter = pick([3, 4, 5, 6]);
  const height = pick([2, 2.5, 3]);
  const pi = 3.14;
  const r = diameter / 2;
  const side = 2 * pi * r * height;
  const bottom = pi * r * r;
  const total = Math.round((side + bottom) * 100) / 100;
  const unitPrice = pick([50, 60, 80, 100]);
  const cost = Math.round(total * unitPrice * 100) / 100;
  const question = `一个圆柱形水池底面直径${diameter}米高${height}米，给池底和池壁贴瓷砖，每平方米${unitPrice}元，共需多少钱？（π取3.14）`;
  return {
    knowledgeId: 'building_surface',
    question,
    parts: [
      { type: 'number', answer: cost, label: '元' }
    ]
  };
}

// ============================================================
//  模板注册
// ============================================================
const g3Templates = [
  { fn: generateDeskGlass, weight: 3 },
  { fn: generateFenceGarden, weight: 3 },
  { fn: generateLawnCost, weight: 2 }
];

const g4Templates = [
  { fn: generateFloorCost, weight: 3 },
  { fn: generatePaintWall, weight: 2 }
];

const g5Templates = [
  { fn: generateFloorTile, weight: 3 },
  { fn: generateTankVolume, weight: 2 },
  { fn: generateGiftWrap, weight: 2 }
];

const g6Templates = [
  { fn: generateCylinderWater, weight: 3 },
  { fn: generatePoolTileCost, weight: 2 }
];

// ============================================================
//  场景模块默认导出
// ============================================================
export default {
  id: 'building',
  gradeMin: 3,
  gradeMax: 6,
  weight: 5,

  /**
   * 按年级生成家装建造应用题
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
