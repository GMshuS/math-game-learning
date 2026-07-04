/**
 * 几何组合生成器
 * 导出 6 个子生成器：
 *   - geometry_perimeter  — 周长计算
 *   - geometry_area       — 面积计算
 *   - geometry_volume     — 体积计算
 *   - geometry_surface    — 表面积计算
 *   - geometry_angle      — 角度计算
 *   - geometry_shape      — 图形认知/圆的认识/图形变换（三合一，随机选题型）
 *
 * 复用 src/config/geometry.js 的平面/立体图形数据。
 * 函数签名：(grade, range) → { question, answer, options, type, knowledgeId }
 * 模块导入时自动注册到题型注册表。
 */
import { register } from './registry';
import { randomInt, pick } from './_helpers';
import {
  getPlaneFiguresForGrade, getSolidFiguresForGrade
} from '../config/geometry';

// ────────────────────────────── 工具函数 ──────────────────────────────

/**
 * 生成选择题干扰选项（正确值 ± 偏移，保证无重复且不含正确答案）
 * @param {number} correct - 正确答案
 * @param {number} count - 需要生成的干扰项数量
 * @param {number} [offsetRange=3] - 偏移幅度范围
 * @returns {number[]}
 */
function generateDistractors(correct, count, offsetRange = 3) {
  const distractors = new Set();
  let attempts = 0;
  while (distractors.size < count && attempts < 50) {
    attempts++;
    const offset = randomInt(1, offsetRange);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const distractor = correct + sign * offset;
    if (distractor !== correct && distractor > 0) {
      distractors.add(distractor);
    }
  }
  // 如果生成的干扰项不够，补充差值
  while (distractors.size < count) {
    distractors.add(correct + distractors.size + 1);
  }
  return [...distractors];
}

/**
 * 从正确值和干扰项构建打乱顺序的选项数组
 * @param {number} correct - 正确答案
 * @param {number} distractorCount - 干扰项数量
 * @param {number} [offsetRange] - 偏移幅度
 * @returns {number[]}
 */
function buildOptions(correct, distractorCount = 3, offsetRange = 3) {
  const distractors = generateDistractors(correct, distractorCount, offsetRange);
  const opts = [correct, ...distractors];
  // Fisher-Yates 洗牌
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

/**
 * 从正确值和文本干扰项构建选择题选项
 * @param {*} correct - 正确答案（数字或字符串）
 * @param {Array} distractors - 干扰项数组
 * @returns {Array}
 */
function buildTextOptions(correct, distractors) {
  const opts = [correct, ...distractors];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

// ────────────────────────── 1. 周长生成器 ──────────────────────────

/**
 * @param {number} grade
 * @param {object} _range
 * @returns {{ question, answer, options, type, knowledgeId }}
 */
function generatePerimeter(grade, _range) {
  const shapes = getPlaneFiguresForGrade(grade).filter(s =>
    ['square', 'rectangle', 'triangle', 'rightTriangle', 'isoscelesTriangle',
      'parallelogram', 'trapezoid', 'rhombus', 'pentagon', 'hexagon'].includes(s.id)
  );
  if (shapes.length === 0) {
    return {
      question: '一个正方形的边长是 5 厘米，它的周长是多少厘米？',
      answer: 20,
      type: 'geometry_perimeter',
      knowledgeId: 'geometry_perimeter',
      options: buildOptions(20, 3)
    };
  }

  const shape = pick(shapes);
  let question, answer;

  switch (shape.id) {
    case 'square': {
      const side = grade <= 2 ? randomInt(2, 9) : randomInt(3, 15);
      answer = 4 * side;
      question = `一个正方形的边长是 ${side} 厘米，它的周长是多少厘米？`;
      break;
    }
    case 'rectangle': {
      const len = grade <= 2 ? randomInt(2, 9) : randomInt(3, 20);
      const wid = grade <= 2 ? randomInt(2, 9) : randomInt(3, 15);
      answer = 2 * (len + wid);
      question = `一个长方形的长是 ${len} 厘米，宽是 ${wid} 厘米，它的周长是多少厘米？`;
      break;
    }
    case 'triangle':
    case 'rightTriangle':
    case 'isoscelesTriangle': {
      const a = randomInt(3, 12);
      const b = randomInt(3, 12);
      const c = randomInt(3, 12);
      answer = a + b + c;
      const shapeName = shape.id === 'rightTriangle' ? '直角三角形' :
        shape.id === 'isoscelesTriangle' ? '等腰三角形' : '三角形';
      question = `一个${shapeName}的三条边分别是 ${a} 厘米、${b} 厘米、${c} 厘米，它的周长是多少厘米？`;
      break;
    }
    case 'parallelogram':
    case 'rhombus': {
      const side = randomInt(3, 12);
      const other = shape.id === 'parallelogram' ? randomInt(3, 12) : side;
      answer = 2 * (side + other);
      question = `一个${shape.name}的边长分别是 ${side} 厘米和 ${other} 厘米，它的周长是多少厘米？`;
      break;
    }
    case 'trapezoid': {
      const a = randomInt(3, 10);
      const b = randomInt(3, 10);
      const c = randomInt(3, 10);
      const d = randomInt(3, 10);
      answer = a + b + c + d;
      question = `一个梯形的四条边分别是 ${a} 厘米、${b} 厘米、${c} 厘米、${d} 厘米，它的周长是多少厘米？`;
      break;
    }
    case 'pentagon': {
      const side = randomInt(3, 10);
      answer = 5 * side;
      question = `一个正五边形的边长是 ${side} 厘米，它的周长是多少厘米？`;
      break;
    }
    case 'hexagon': {
      const side = randomInt(3, 10);
      answer = 6 * side;
      question = `一个正六边形的边长是 ${side} 厘米，它的周长是多少厘米？`;
      break;
    }
    default: {
      const side = randomInt(4, 10);
      answer = shape.sides * side;
      question = `一个${shape.name}的边长是 ${side} 厘米，它的周长是多少厘米？`;
    }
  }

  return {
    question,
    answer,
    type: 'geometry_perimeter',
    knowledgeId: 'geometry_perimeter',
    options: buildOptions(answer, 3, Math.max(2, Math.floor(answer * 0.3)))
  };
}

// ────────────────────────── 2. 面积生成器 ──────────────────────────

/**
 * @param {number} grade
 * @param {object} _range
 * @returns {{ question, answer, options, type, knowledgeId }}
 */
function generateArea(grade, _range) {
  // 低年级只算正方形/长方形；中年级加三角形、平行四边形；高年级加圆、梯形
  if (grade <= 2) {
    const side = randomInt(2, 9);
    const answer = side * side;
    return {
      question: `一个正方形的边长是 ${side} 厘米，它的面积是多少平方厘米？`,
      answer,
      type: 'geometry_area',
      knowledgeId: 'geometry_area',
      options: buildOptions(answer, 3, Math.max(1, Math.floor(answer * 0.3)))
    };
  }

  const typePool = grade <= 4
    ? ['square', 'rectangle', 'triangle', 'parallelogram']
    : ['square', 'rectangle', 'triangle', 'parallelogram', 'trapezoid', 'circle'];

  const areaType = pick(typePool);
  let question, answer;

  switch (areaType) {
    case 'square': {
      const side = randomInt(3, 15);
      answer = side * side;
      question = `一个正方形的边长是 ${side} 厘米，它的面积是多少平方厘米？`;
      break;
    }
    case 'rectangle': {
      const len = randomInt(3, 20);
      const wid = randomInt(3, 15);
      answer = len * wid;
      question = `一个长方形的长是 ${len} 厘米，宽是 ${wid} 厘米，它的面积是多少平方厘米？`;
      break;
    }
    case 'triangle': {
      const base = randomInt(4, 16);
      const height = randomInt(3, 14);
      answer = (base * height) / 2;
      question = `一个三角形的底是 ${base} 厘米，高是 ${height} 厘米，它的面积是多少平方厘米？`;
      break;
    }
    case 'parallelogram': {
      const base = randomInt(4, 16);
      const height = randomInt(3, 12);
      answer = base * height;
      question = `一个平行四边形的底是 ${base} 厘米，高是 ${height} 厘米，它的面积是多少平方厘米？`;
      break;
    }
    case 'trapezoid': {
      const top = randomInt(3, 10);
      const bottom = randomInt(5, 15);
      const height = randomInt(3, 10);
      answer = ((top + bottom) * height) / 2;
      question = `一个梯形的上底是 ${top} 厘米，下底是 ${bottom} 厘米，高是 ${height} 厘米，它的面积是多少平方厘米？`;
      break;
    }
    case 'circle': {
      const r = randomInt(2, 8);
      // 小学用 π ≈ 3.14
      answer = Math.round(3.14 * r * r);
      question = `一个圆的半径是 ${r} 厘米，它的面积约是多少平方厘米？（π 取 3.14）`;
      break;
    }
  }

  return {
    question,
    answer,
    type: 'geometry_area',
    knowledgeId: 'geometry_area',
    options: buildOptions(answer, 3, Math.max(1, Math.floor(answer * 0.25)))
  };
}

// ────────────────────────── 3. 体积生成器 ──────────────────────────

/**
 * @param {number} grade
 * @param {object} _range
 * @returns {{ question, answer, options, type, knowledgeId }}
 */
function generateVolume(grade, _range) {
  const solids = getSolidFiguresForGrade(grade).filter(s =>
    ['cube', 'cuboid', 'cylinder'].includes(s.id)
  );
  if (solids.length === 0) {
    return {
      question: '一个正方体的棱长是 3 厘米，它的体积是多少立方厘米？',
      answer: 27,
      type: 'geometry_volume',
      knowledgeId: 'geometry_volume',
      options: buildOptions(27, 3)
    };
  }

  const solid = pick(solids);
  let question, answer;

  switch (solid.id) {
    case 'cube': {
      const side = randomInt(2, 10);
      answer = side * side * side;
      question = `一个正方体的棱长是 ${side} 厘米，它的体积是多少立方厘米？`;
      break;
    }
    case 'cuboid': {
      const l = randomInt(2, 10);
      const w = randomInt(2, 8);
      const h = randomInt(2, 6);
      answer = l * w * h;
      question = `一个长方体的长是 ${l} 厘米，宽是 ${w} 厘米，高是 ${h} 厘米，它的体积是多少立方厘米？`;
      break;
    }
    case 'cylinder': {
      const r = randomInt(2, 6);
      const h = randomInt(3, 10);
      answer = Math.round(3.14 * r * r * h);
      question = `一个圆柱的底面半径是 ${r} 厘米，高是 ${h} 厘米，它的体积约是多少立方厘米？（π 取 3.14）`;
      break;
    }
    default: {
      const side = randomInt(3, 8);
      answer = side * side * side;
      question = `一个正方体的棱长是 ${side} 厘米，它的体积是多少立方厘米？`;
    }
  }

  return {
    question,
    answer,
    type: 'geometry_volume',
    knowledgeId: 'geometry_volume',
    options: buildOptions(answer, 3, Math.max(1, Math.floor(answer * 0.3)))
  };
}

// ────────────────────────── 4. 表面积生成器 ──────────────────────────
// knowledgeId 映射到 geometry_volume（面积/体积同属立体几何）

/**
 * @param {number} grade
 * @param {object} _range
 * @returns {{ question, answer, options, type, knowledgeId }}
 */
function generateSurface(grade, _range) {
  const solids = getSolidFiguresForGrade(grade).filter(s =>
    ['cube', 'cuboid'].includes(s.id)
  );
  if (solids.length === 0) {
    return {
      question: '一个正方体的棱长是 4 厘米，它的表面积是多少平方厘米？',
      answer: 96,
      type: 'geometry_surface',
      knowledgeId: 'geometry_surface',
      options: buildOptions(96, 3)
    };
  }

  const solid = pick(solids);
  let question, answer;

  switch (solid.id) {
    case 'cube': {
      const side = randomInt(2, 10);
      answer = 6 * side * side;
      question = `一个正方体的棱长是 ${side} 厘米，它的表面积是多少平方厘米？`;
      break;
    }
    case 'cuboid': {
      const l = randomInt(2, 10);
      const w = randomInt(2, 8);
      const h = randomInt(2, 6);
      answer = 2 * (l * w + l * h + w * h);
      question = `一个长方体的长是 ${l} 厘米，宽是 ${w} 厘米，高是 ${h} 厘米，它的表面积是多少平方厘米？`;
      break;
    }
    default: {
      const side = randomInt(3, 8);
      answer = 6 * side * side;
      question = `一个正方体的棱长是 ${side} 厘米，它的表面积是多少平方厘米？`;
    }
  }

  return {
    question,
    answer,
    type: 'geometry_surface',
    knowledgeId: 'geometry_surface',
    options: buildOptions(answer, 3, Math.max(1, Math.floor(answer * 0.3)))
  };
}

// ────────────────────────── 5. 角度生成器 ──────────────────────────

/**
 * @param {number} grade
 * @param {object} _range
 * @returns {{ question, answer, options, type, knowledgeId }}
 */
function generateAngle(grade, _range) {
  const angleTypes = ['triangle', 'complementary', 'supplementary', 'rightAngle'];
  // 高年级增加多边形内角和
  if (grade >= 5) {
    angleTypes.push('polygon');
  }
  const angleType = pick(angleTypes);
  let question, answer;

  switch (angleType) {
    case 'triangle': {
      const a = randomInt(30, 80);
      const b = randomInt(30, 80);
      const sum = a + b;
      answer = 180 - sum;
      const triangleType = a === b ? '等腰' : answer < 90 ? '锐角' : answer > 90 ? '钝角' : '直角';
      question = `一个${triangleType}三角形中，一个角是 ${a}°，另一个角是 ${b}°，第三个角是多少度？`;
      break;
    }
    case 'complementary': {
      const a = randomInt(10, 80);
      answer = 90 - a;
      question = `已知一个角是 ${a}°，它的余角是多少度？`;
      break;
    }
    case 'supplementary': {
      const a = randomInt(10, 170);
      answer = 180 - a;
      question = `已知一个角是 ${a}°，它的补角是多少度？`;
      break;
    }
    case 'rightAngle': {
      const a = randomInt(20, 70);
      answer = 90 - a;
      question = `一个直角三角形的一个锐角是 ${a}°，另一个锐角是多少度？`;
      break;
    }
    case 'polygon': {
      const sides = pick([4, 5, 6, 8]);
      answer = 180 * (sides - 2);
      const polygonName = sides === 4 ? '四边' : sides === 5 ? '五边' : sides === 6 ? '六边' : '八边';
      question = `一个${polygonName}形的内角和是多少度？`;
      break;
    }
    default: {
      const a = randomInt(40, 70);
      const b = randomInt(30, 60);
      answer = 180 - a - b;
      question = `三角形中，一个角是 ${a}°，另一个角是 ${b}°，第三个角是多少度？`;
    }
  }

  return {
    question,
    answer,
    type: 'geometry_angle',
    knowledgeId: 'geometry_angle',
    options: buildOptions(answer, 3, Math.max(3, Math.floor(answer * 0.2)))
  };
}

// ────────────────────── 6. 图形认知生成器 ──────────────────────
// 三合一：图形认知 / 圆的认识 / 图形变换（随机选题型）

/**
 * @param {number} grade
 * @param {object} _range
 * @returns {{ question, answer, options, type, knowledgeId }}
 */
function generateShape(grade, _range) {
  const subTypes = [];

  // 图形认知 — 所有年级
  subTypes.push('shape');

  // 圆的认识 — 高年级 (5+)
  if (grade >= 5) {
    subTypes.push('circle');
  }

  // 图形变换 — 中高年级 (4+)
  if (grade >= 4) {
    subTypes.push('transform');
  }

  const subType = pick(subTypes);

  switch (subType) {
    // ── 图形认知 ──
    case 'shape': {
      const shapes = getPlaneFiguresForGrade(grade);
      const shape = pick(shapes);
      const questions = [
        {
          q: `下列哪个图形有 ${shape.sides} 条边？`,
          correct: shape.name,
          distractors: shapes.filter(s => s.id !== shape.id).slice(0, 3).map(s => s.name)
        },
        {
          q: `一个图形有 ${shape.sides} 条边和 ${shape.angles} 个角，它是什么图形？`,
          correct: shape.name,
          distractors: shapes.filter(s => s.id !== shape.id).slice(0, 3).map(s => s.name)
        }
      ];
      // 如果有属性描述，额外增加属性题
      if (shape.properties && shape.properties.length > 0) {
        const prop = pick(shape.properties);
        questions.push({
          q: `"${prop}" 是哪个图形的特征？`,
          correct: shape.name,
          distractors: shapes.filter(s => s.id !== shape.id).slice(0, 3).map(s => s.name)
        });
      }
      const q = pick(questions);
      // 如果干扰项不够，填充其他图形
      const allPlaneNames = shapes.map(s => s.name).filter(n => n !== q.correct);
      while (q.distractors.length < 3) {
        const filler = pick(allPlaneNames);
        if (!q.distractors.includes(filler)) {
          q.distractors.push(filler);
        }
      }
      return {
        question: q.q,
        answer: q.correct,
        type: 'geometry_shape',
        knowledgeId: 'geometry_shape',
        options: buildTextOptions(q.correct, q.distractors.slice(0, 3))
      };
    }

    // ── 圆的认识 ──
    case 'circle': {
      const circleQuestions = [
        {
          q: '从圆心到圆上任意一点的距离叫做什么？',
          correct: '半径',
          distractors: ['直径', '周长', '弧']
        },
        {
          q: '通过圆心且两端都在圆上的线段叫做什么？',
          correct: '直径',
          distractors: ['半径', '弦', '弧']
        },
        {
          q: '圆的周长与直径的比值叫做什么？',
          correct: '圆周率',
          distractors: ['半径', '直径', '弧度']
        },
        {
          q: '一个圆的半径是 3 厘米，它的直径是多少厘米？',
          correct: '6',
          distractors: ['3', '9', '1.5']
        },
        {
          q: '一个圆的直径是 10 厘米，它的半径是多少厘米？',
          correct: '5',
          distractors: ['10', '20', '2.5']
        },
        {
          q: '圆的周长公式是（C 表示周长，r 表示半径）？',
          correct: 'C = 2πr',
          distractors: ['C = πr', 'C = πr²', 'C = 2r']
        }
      ];
      const r = randomInt(2, 7);
      circleQuestions.push({
        q: `一个圆的半径是 ${r} 厘米，它的周长约是多少厘米？（π 取 3.14）`,
        correct: String(Math.round(2 * 3.14 * r)),
        distractors: [String(Math.round(3.14 * r)), String(Math.round(3.14 * r * r)), String(r * 2)]
      });
      const q = pick(circleQuestions);
      return {
        question: q.q,
        answer: q.correct,
        type: 'geometry_shape',
        knowledgeId: 'geometry_circle',
        options: buildTextOptions(q.correct, q.distractors)
      };
    }

    // ── 图形变换 ──
    case 'transform': {
      const transformQuestions = [
        {
          q: '把一个图形沿一条直线对折，两边完全重合，这种变换叫做什么？',
          correct: '轴对称',
          distractors: ['平移', '旋转', '缩放']
        },
        {
          q: '把一个图形沿着某个方向移动一定的距离，这种变换叫做什么？',
          correct: '平移',
          distractors: ['旋转', '轴对称', '缩放']
        },
        {
          q: '把一个图形绕着一个点转动一定的角度，这种变换叫做什么？',
          correct: '旋转',
          distractors: ['平移', '轴对称', '翻折']
        },
        {
          q: '长方形有几条对称轴？',
          correct: '2',
          distractors: ['1', '4', '0']
        },
        {
          q: '正方形有几条对称轴？',
          correct: '4',
          distractors: ['2', '6', '1']
        },
        {
          q: '等边三角形有几条对称轴？',
          correct: '3',
          distractors: ['1', '2', '0']
        },
        {
          q: '一个图形经过平移后，什么不变？',
          correct: '形状和大小',
          distractors: ['位置', '方向', '颜色']
        }
      ];
      const q = pick(transformQuestions);
      return {
        question: q.q,
        answer: q.correct,
        type: 'geometry_shape',
        knowledgeId: 'geometry_transform',
        options: buildTextOptions(q.correct, q.distractors)
      };
    }

    default: {
      return {
        question: '下列哪个是平面图形？',
        answer: '正方形',
        type: 'geometry_shape',
        knowledgeId: 'geometry_shape',
        options: ['正方形', '球体', '圆柱', '圆锥']
      };
    }
  }
}

// ────────────────────────── 注册到题型注册表 ──────────────────────────

register('geometry_perimeter', generatePerimeter);
register('geometry_area', generateArea);
register('geometry_volume', generateVolume);
register('geometry_surface', generateSurface);
register('geometry_angle', generateAngle);
register('geometry_shape', generateShape);

// ────────────────────────── 导出 ──────────────────────────

export {
  generatePerimeter,
  generateArea,
  generateVolume,
  generateSurface,
  generateAngle,
  generateShape
};
