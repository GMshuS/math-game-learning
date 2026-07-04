/**
 * 几何王国 — 题目生成器
 * 用于 GeometryScene 各模式的题目生成
 */
import { solidFigures, getPlaneFiguresForGrade } from './geometry';

/**
 * 获取随机整数 [min, max]
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 随机打乱数组
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 图形识别题 — 根据描述选择图形
 * 显示图形名，选匹配的图形属性（或反之）
 * @param {number} grade - 年级 (1-6)
 * @returns {object} 题目对象
 */
export function generateIdentifyQuestion(grade) {
  const figures = getPlaneFiguresForGrade(grade);
  const figure = figures[Math.floor(Math.random() * figures.length)];

  const questionType = Math.random() < 0.5 ? 'nameToSides' : 'nameToProperty';

  if (questionType === 'nameToSides') {
    // 给出图形名，问边数
    const answer = figure.sides;
    const wrongOptions = generateWrongSideOptions(answer);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `"${figure.name}" 有几条边？`,
      answer,
      type: 'geometry_identify',
      subType: 'sides',
      figureId: figure.id,
      choices,
      inputType: 'choice'
    };
  } else {
    // 给出图形名，选一个正确属性
    const correctProperty = figure.properties
      ? figure.properties[Math.floor(Math.random() * figure.properties.length)]
      : null;

    if (!correctProperty) {
      console.warn(`[Geometry] Figure "${figure.name}" has no properties, degrading to side-count question`);
      // 降级到边数题
      const answer = figure.sides;
      const wrongOptions = generateWrongSideOptions(answer);
      const choices = shuffle([answer, ...wrongOptions]);
      return {
        question: `"${figure.name}" 有几条边？`,
        answer,
        type: 'geometry_identify',
        subType: 'sides',
        figureId: figure.id,
        choices,
        inputType: 'choice'
      };
    }

    const wrongProperties = generateWrongProperties(correctProperty);
    const choices = shuffle([correctProperty, ...wrongProperties]);

    return {
      question: `关于 "${figure.name}"，以下哪个说法正确？`,
      answer: correctProperty,
      type: 'geometry_identify',
      subType: 'property',
      figureId: figure.id,
      choices,
      inputType: 'choice'
    };
  }
}

/**
 * 生成错误的边数选项
 */
function generateWrongSideOptions(correct) {
  const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12].filter(n => n !== correct);
  return pool.slice(0, 3);
}

/**
 * 生成错误的属性选项
 */
function generateWrongProperties(correct) {
  const allProperties = [
    '等边', '等角', '平行', '对边相等', '对边平行',
    '对角相等', '无角', '一个直角', '两边相等',
    '四边相等', '一组对边平行', '对角线垂直'
  ];
  return shuffle(allProperties.filter(p => p !== correct)).slice(0, 3);
}

/**
 * 基础属性题 — 角数/对称轴/顶点等
 * @param {number} grade - 年级 (1-6)
 * @returns {object} 题目对象
 */
export function generatePropertyQuestion(grade) {
  const usePlane = grade <= 4 || Math.random() < 0.6;
  const figures = usePlane
    ? getPlaneFiguresForGrade(grade)
    : solidFigures;

  const figure = figures[Math.floor(Math.random() * figures.length)];

  const subTypes = usePlane
    ? ['angles', 'sides', 'symmetric']
    : ['faces', 'vertices', 'edges'];

  const subType = subTypes[Math.floor(Math.random() * subTypes.length)];

  let question, answer;

  if (usePlane) {
    if (subType === 'angles') {
      answer = figure.angles;
      question = `"${figure.name}" 有几个角？`;
    } else if (subType === 'sides') {
      answer = figure.sides;
      question = `"${figure.name}" 有几条边？`;
    } else {
      // 对称轴数量（简化：只有部分图形有准确值）
      const symmetricMap = {
        square: 4, rectangle: 2, circle: 999,
        triangle: 0, parallelogram: 0, trapezoid: 0,
        rhombus: 2, pentagon: 5, hexagon: 6,
        ellipse: 2, rightTriangle: 0, isoscelesTriangle: 1
      };
      answer = symmetricMap[figure.id] || 0;
      if (answer === 999) {
        question = `"${figure.name}" 有多少条对称轴？`;
        answer = '无数条';
      } else {
        question = `"${figure.name}" 有多少条对称轴？`;
      }
    }
  } else {
    if (subType === 'faces') {
      answer = figure.faces;
      question = `"${figure.name}" 有几个面？`;
    } else if (subType === 'vertices') {
      answer = figure.vertices;
      question = `"${figure.name}" 有几个顶点？`;
    } else {
      answer = figure.edges;
      question = `"${figure.name}" 有几条棱？`;
    }
  }

  const wrongOptions = generateWrongNumericOptions(answer, 3);
  const choices = shuffle([answer, ...wrongOptions]);

  return {
    question,
    answer,
    type: 'geometry_property',
    subType,
    figureId: figure.id,
    choices,
    inputType: 'choice'
  };
}

/**
 * 生成错误的数字选项
 * @param {number|string} correct
 * @param {number} count
 * @returns {Array}
 */
function generateWrongNumericOptions(correct, count) {
  if (typeof correct === 'string') {
    // 非数字答案（如"无数条"）
    const pool = ['0', '1', '2', '3', '4', '5', '6', '8', '12', '无数条'];
    return shuffle(pool.filter(p => p !== correct)).slice(0, count);
  }
  const pool = [0, 1, 2, 3, 4, 5, 6, 8, 12, 999].filter(n => n !== correct);
  return shuffle(pool).slice(0, count);
}

/**
 * 三角形分类题
 * @param {number} grade - 年级
 * @returns {object} 题目对象
 */
export function generateTriangleQuestion(_grade) {
  const subTypes = ['classify', 'sumAngle', 'sideRelation'];
  const subType = subTypes[Math.floor(Math.random() * subTypes.length)];

  if (subType === 'classify') {
    // 三角形分类
    const triangleTypes = [
      { name: '锐角三角形', desc: '三个角都小于90°' },
      { name: '直角三角形', desc: '有一个角等于90°' },
      { name: '钝角三角形', desc: '有一个角大于90°' },
      { name: '等边三角形', desc: '三条边相等' },
      { name: '等腰三角形', desc: '两条边相等' }
    ];
    const t = triangleTypes[Math.floor(Math.random() * triangleTypes.length)];

    // 生成干扰描述
    const wrongDescs = triangleTypes
      .filter(tt => tt.name !== t.name)
      .map(tt => tt.desc);
    const wrongOptions = shuffle(wrongDescs).slice(0, 3);
    const choices = shuffle([t.desc, ...wrongOptions]);

    return {
      question: `以下哪个描述符合 ${t.name}？`,
      answer: t.desc,
      type: 'geometry_triangle',
      subType: 'classify',
      choices,
      inputType: 'choice'
    };
  } else if (subType === 'sumAngle') {
    // 三角形内角和
    const angle1 = randomInt(30, 80);
    const angle2 = randomInt(30, 80);
    const knownSum = angle1 + angle2;
    const answer = 180 - knownSum;

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `三角形中，已知两个角分别是 ${angle1}° 和 ${angle2}°，第三个角是多少度？`,
      answer,
      type: 'geometry_triangle',
      subType: 'sumAngle',
      choices,
      inputType: 'choice'
    };
  } else {
    // 三边关系
    const sides = [
      [3, 4, 5], [5, 12, 13], [6, 8, 10],
      [7, 8, 9], [5, 6, 7], [8, 15, 17]
    ];
    const valid = sides[Math.floor(Math.random() * sides.length)];
    const show = shuffle(valid).slice(0, 2);
    const answer = valid.find(s => !show.includes(s));

    const wrongOptions = [
      answer + randomInt(1, 3),
      Math.max(1, answer - randomInt(1, 3)),
      answer + randomInt(4, 7)
    ].filter(n => n > 0 && !valid.includes(n));
    while (wrongOptions.length < 3) {
      const fill = randomInt(1, 20);
      if (!valid.includes(fill) && !wrongOptions.includes(fill)) {
        wrongOptions.push(fill);
      }
    }
    const choices = shuffle([answer, ...wrongOptions.slice(0, 3)]);

    return {
      question: `三角形两条边分别是 ${show[0]} 和 ${show[1]}，第三条边可能是多少？`,
      answer,
      type: 'geometry_triangle',
      subType: 'sideRelation',
      choices,
      inputType: 'choice'
    };
  }
}

/**
 * 角度识别题 — 角的世界
 * @param {number} grade - 年级
 * @returns {object} 题目对象
 */
export function generateAngleQuestion(grade) {
  // 高年级加入周角
  const angleTypes = [
    { name: '锐角', range: [1, 89], desc: '大于0°小于90°的角' },
    { name: '直角', range: [90, 90], desc: '等于90°的角' },
    { name: '钝角', range: [91, 179], desc: '大于90°小于180°的角' },
    { name: '平角', range: [180, 180], desc: '等于180°的角' }
  ];

  // 5年级以上加入周角
  if (grade >= 5) {
    angleTypes.push({ name: '周角', range: [360, 360], desc: '等于360°的角' });
  }

  // 子题型分发
  const availableSubTypes = ['identify'];
  if (grade >= 5) availableSubTypes.push('complement');
  const subType = availableSubTypes[Math.floor(Math.random() * availableSubTypes.length)];

  if (subType === 'complement' && grade >= 5) {
    // 余角/补角题
    const isComplement = Math.random() < 0.5;
    const given = randomInt(20, 80);
    const answer = isComplement ? 90 - given : 180 - given;
    const label = isComplement ? '余角' : '补角';

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `${given}° 的${label}是多少度？`,
      answer,
      type: 'geometry_angle',
      subType: 'complement',
      degree: given,
      choices,
      inputType: 'choice'
    };
  }

  const t = angleTypes[Math.floor(Math.random() * angleTypes.length)];
  const degree = t.range[0] === t.range[1]
    ? t.range[0]
    : randomInt(t.range[0], t.range[1]);

  const wrongNames = angleTypes
    .filter(at => at.name !== t.name)
    .map(at => at.name);
  const wrongOptions = shuffle(wrongNames).slice(0, 3);
  const choices = shuffle([t.name, ...wrongOptions]);

  return {
    question: `${degree}° 的角属于什么角？`,
    answer: t.name,
    degree,
    type: 'geometry_angle',
    subType: 'identify',
    choices,
    inputType: 'choice'
  };
}

/**
 * 面积/周长题 — 面积挑战（扩展版）
 * 支持正方形、长方形、三角形、平行四边形、梯形
 * @param {number} grade - 年级
 * @returns {object} 题目对象
 */
export function generateAreaQuestion(grade) {
  // 年级自适应图形选择
  const availableShapes = ['square', 'rectangle'];
  if (grade >= 3) availableShapes.push('triangle');
  if (grade >= 4) availableShapes.push('parallelogram');
  if (grade >= 5) availableShapes.push('trapezoid');

  const shape = availableShapes[Math.floor(Math.random() * availableShapes.length)];

  const calcPerimeter = Math.random() < 0.3; // 30%概率考周长

  if (shape === 'square') {
    const side = randomInt(2, 12);
    const answer = calcPerimeter ? side * 4 : side * side;
    const unit = calcPerimeter ? '厘米' : '平方厘米';

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `边长为 ${side} 厘米的正方形，${calcPerimeter ? '周长' : '面积'}是多少${unit}？`,
      answer,
      type: 'geometry_area',
      subType: calcPerimeter ? 'perimeter' : 'area',
      shape: 'square',
      dimensions: { side },
      choices,
      inputType: 'choice'
    };
  } else if (shape === 'rectangle') {
    const a = randomInt(2, 12);
    const b = randomInt(2, 12);
    const answer = calcPerimeter ? 2 * (a + b) : a * b;
    const unit = calcPerimeter ? '厘米' : '平方厘米';

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `长 ${a} 厘米、宽 ${b} 厘米的长方形，${calcPerimeter ? '周长' : '面积'}是多少${unit}？`,
      answer,
      type: 'geometry_area',
      subType: calcPerimeter ? 'perimeter' : 'area',
      shape: 'rectangle',
      dimensions: { width: a, height: b },
      choices,
      inputType: 'choice'
    };
  } else if (shape === 'triangle') {
    // 三角形面积 = base * height / 2
    const base = randomInt(4, 12);
    const height = randomInt(4, 12);
    // 确保结果为精确值（不截断小数）
    const product = base * height;
    const answer = product % 2 === 0 ? product / 2 : Math.round(product / 2 * 10) / 10;

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `底为 ${base} 厘米、高为 ${height} 厘米的三角形，面积是多少平方厘米？`,
      answer,
      type: 'geometry_area',
      subType: 'area',
      shape: 'triangle',
      dimensions: { base, height },
      choices,
      inputType: 'choice'
    };
  } else if (shape === 'parallelogram') {
    // 平行四边形面积 = base * height
    const base = randomInt(4, 12);
    const height = randomInt(3, 10);
    const answer = base * height;

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `底为 ${base} 厘米、高为 ${height} 厘米的平行四边形，面积是多少平方厘米？`,
      answer,
      type: 'geometry_area',
      subType: 'area',
      shape: 'parallelogram',
      dimensions: { base, height },
      choices,
      inputType: 'choice'
    };
  } else {
    // 梯形面积 = (a + b) * h / 2
    const a = randomInt(4, 10);
    const b = randomInt(4, 10);
    const h = randomInt(3, 8);
    const sum = a + b;
    const answer = (sum * h) % 2 === 0 ? (sum * h) / 2 : Math.round((sum * h) / 2 * 10) / 10;

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `上底 ${a} 厘米、下底 ${b} 厘米、高 ${h} 厘米的梯形，面积是多少平方厘米？`,
      answer,
      type: 'geometry_area',
      subType: 'area',
      shape: 'trapezoid',
      dimensions: { top: a, bottom: b, height: h },
      choices,
      inputType: 'choice'
    };
  }
}

/**
 * 图形运动题 — 变换
 * @param {number} grade - 年级
 * @returns {object} 题目对象
 */
export function generateTransformQuestion(_grade) {
  const subTypes = ['translation', 'rotation', 'symmetry'];
  const subType = subTypes[Math.floor(Math.random() * subTypes.length)];

  if (subType === 'translation') {
    // 平移：描述移动方向和距离
    const direction = ['上', '下', '左', '右'][Math.floor(Math.random() * 4)];
    const distance = randomInt(2, 5);

    // 图形平移后的坐标/位置
    const shapes = ['三角形', '正方形', '长方形'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    const answer = `向${direction}平移${distance}格`;
    const wrongDirs = ['上', '下', '左', '右'].filter(d => d !== direction);
    const wrongDir = wrongDirs[Math.floor(Math.random() * wrongDirs.length)];
    const wrongOptions = shuffle([
      `向${direction}平移${distance + randomInt(1, 2)}格`,
      `向${wrongDir}平移${distance}格`,
      `向${wrongDir}平移${distance + randomInt(1, 2)}格`
    ]);

    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `${shape}从A点到B点，发生了怎样的运动？`,
      answer,
      type: 'geometry_transform',
      subType: 'translation',
      transformData: { direction, distance, shape },
      choices,
      inputType: 'choice'
    };
  } else if (subType === 'rotation') {
    // 旋转
    const directions = ['顺时针', '逆时针'];
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const degrees = [90, 180, 270][Math.floor(Math.random() * 3)];

    const answer = `向${dir}旋转${degrees}°`;
    const wrongDegrees = [90, 180, 270].filter(d => d !== degrees);
    const wrongDir = directions.filter(d => d !== dir)[0];
    const wrongOptions = shuffle([
      `向${dir}旋转${wrongDegrees[0]}°`,
      `向${wrongDir}旋转${degrees}°`,
      `向${wrongDir}旋转${wrongDegrees[1]}°`
    ]);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `图形绕O点转动，发生了怎样的旋转？`,
      answer,
      type: 'geometry_transform',
      subType: 'rotation',
      transformData: { direction: dir, degrees },
      choices,
      inputType: 'choice'
    };
  } else {
    // 轴对称/对称
    const symmetricShapes = ['正方形', '长方形', '圆形', '等边三角形', '等腰三角形'];
    const asymmetricShapes = ['任意三角形', '任意四边形', '不规则图形'];
    const isSymmetric = Math.random() < 0.5;
    const shape = isSymmetric
      ? symmetricShapes[Math.floor(Math.random() * symmetricShapes.length)]
      : asymmetricShapes[Math.floor(Math.random() * asymmetricShapes.length)];

    const answer = isSymmetric ? '是' : '不是';
    const wrongOptions = [isSymmetric ? '不是' : '是', '无法判断'];

    // 提干
    const question = `"${shape}" 是轴对称图形吗？`;

    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question,
      answer,
      type: 'geometry_transform',
      subType: 'symmetry',
      transformData: { shape, isSymmetric },
      choices,
      inputType: 'choice'
    };
  }
}

/**
 * 立体图形题 — 立体工坊
 * 表面积、体积计算
 * @param {number} grade - 年级
 * @returns {object} 题目对象
 */
export function generateSolidQuestion(grade) {
  const availableSolids = ['cube', 'cuboid'];
  if (grade >= 5) availableSolids.push('cylinder');
  if (grade >= 6) availableSolids.push('cone');

  const solid = availableSolids[Math.floor(Math.random() * availableSolids.length)];
  const calcVolume = grade <= 4 ? true : Math.random() < 0.6;

  if (solid === 'cube') {
    const side = randomInt(2, 6);
    const answer = calcVolume ? side * side * side : 6 * side * side;
    const unit = calcVolume ? '立方厘米' : '平方厘米';
    const label = calcVolume ? '体积' : '表面积';

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `棱长为 ${side} 厘米的正方体，${label}是多少${unit}？`,
      answer,
      type: 'geometry_solid',
      subType: calcVolume ? 'volume' : 'surfaceArea',
      solid: 'cube',
      dimensions: { side },
      choices,
      inputType: 'choice'
    };
  } else if (solid === 'cuboid') {
    const a = randomInt(2, 5);
    const b = randomInt(2, 5);
    const c = randomInt(2, 5);

    const answer = calcVolume ? a * b * c : 2 * (a * b + a * c + b * c);
    const unit = calcVolume ? '立方厘米' : '平方厘米';
    const label = calcVolume ? '体积' : '表面积';

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `长 ${a} 厘米、宽 ${b} 厘米、高 ${c} 厘米的长方体，${label}是多少${unit}？`,
      answer,
      type: 'geometry_solid',
      subType: calcVolume ? 'volume' : 'surfaceArea',
      solid: 'cuboid',
      dimensions: { width: a, depth: b, height: c },
      choices,
      inputType: 'choice'
    };
  } else if (solid === 'cylinder') {
    // 圆柱体积 = πr²h，表面积 = 2πr² + 2πrh，简化π≈3
    // 确保计算结果为整数
    const r = randomInt(2, 4);
    const h = randomInt(3, 6);
    const pi = 3; // 简化π=3

    if (calcVolume) {
      const answer = pi * r * r * h;
      const wrongOptions = generateWrongNumericOptions(answer, 3);
      const choices = shuffle([answer, ...wrongOptions]);

      return {
        question: `底面半径为 ${r} 厘米、高为 ${h} 厘米的圆柱（π≈3），体积是多少立方厘米？`,
        answer,
        type: 'geometry_solid',
        subType: 'volume',
        solid: 'cylinder',
        dimensions: { radius: r, height: h },
        choices,
        inputType: 'choice'
      };
    } else {
      const answer = 2 * pi * r * r + 2 * pi * r * h;
      const wrongOptions = generateWrongNumericOptions(answer, 3);
      const choices = shuffle([answer, ...wrongOptions]);

      return {
        question: `底面半径为 ${r} 厘米、高为 ${h} 厘米的圆柱（π≈3），表面积是多少平方厘米？`,
        answer,
        type: 'geometry_solid',
        subType: 'surfaceArea',
        solid: 'cylinder',
        dimensions: { radius: r, height: h },
        choices,
        inputType: 'choice'
      };
    }
  } else {
    // 圆锥体积 = 1/3 * πr²h（仅6年级）
    const r = randomInt(2, 4);
    const h = randomInt(3, 6);
    const pi = 3;
    const answer = Math.floor(pi * r * r * h / 3);

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `底面半径为 ${r} 厘米、高为 ${h} 厘米的圆锥（π≈3），体积是多少立方厘米？`,
      answer,
      type: 'geometry_solid',
      subType: 'volume',
      solid: 'cone',
      dimensions: { radius: r, height: h },
      choices,
      inputType: 'choice'
    };
  }
}

/**
 * 圆的奥秘题
 * 圆的性质、半径直径、圆周率、扇形
 * @param {number} grade - 年级
 * @returns {object} 题目对象
 */
export function generateCircleQuestion(grade) {
  const subTypes = ['radiusDiameter'];
  if (grade >= 5) subTypes.push('circumference', 'sector');
  if (grade >= 6) subTypes.push('unfold');

  const subType = subTypes[Math.floor(Math.random() * subTypes.length)];

  if (subType === 'radiusDiameter') {
    // 半径直径关系
    const isRadius = Math.random() < 0.5;
    const value = randomInt(2, 10);
    const answer = isRadius ? value * 2 : Math.floor(value / 2);
    const qType = isRadius ? '直径' : '半径';

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `圆的${isRadius ? '半径' : '直径'}是 ${value} 厘米，${qType}是多少厘米？`,
      answer,
      type: 'geometry_circle',
      subType: 'radiusDiameter',
      circleData: { radius: isRadius ? value : answer, diameter: isRadius ? answer : value },
      choices,
      inputType: 'choice'
    };
  } else if (subType === 'circumference') {
    // 周长 = 2πr，用π≈3
    const r = randomInt(2, 6);
    const pi = 3;
    const answer = 2 * pi * r;

    const wrongOptions = generateWrongNumericOptions(answer, 3);
    const choices = shuffle([answer, ...wrongOptions]);

    return {
      question: `半径为 ${r} 厘米的圆（π≈3），周长是多少厘米？`,
      answer,
      type: 'geometry_circle',
      subType: 'circumference',
      circleData: { radius: r, circumference: answer },
      choices,
      inputType: 'choice'
    };
  } else if (subType === 'sector') {
    // 扇形认识
    const questions = [
      { q: '扇形是由几条半径和一段弧围成的？', a: '2条', opts: ['1条', '2条', '3条', '4条'] },
      { q: '圆心角为90°的扇形占圆的几分之几？', a: '1/4', opts: ['1/2', '1/3', '1/4', '1/6'] },
      { q: '圆心角为180°的扇形是圆的几分之几？', a: '1/2', opts: ['1/3', '1/2', '1/4', '2/3'] },
      { q: '扇形是圆的一部分，对吗？', a: '对', opts: ['对', '错'] }
    ];
    const q = questions[Math.floor(Math.random() * questions.length)];

    const wrongOptions = q.opts.filter(o => o !== q.a);
    const choices = shuffle([q.a, ...wrongOptions]);

    return {
      question: q.q,
      answer: q.a,
      type: 'geometry_circle',
      subType: 'sector',
      choices,
      inputType: 'choice'
    };
  } else {
    // 展开图 圆柱/圆锥
    const isCylinder = Math.random() < 0.5;
    if (isCylinder) {
      const question = '圆柱的侧面展开图是什么形状？';
      const answer = '长方形';
      const wrongOptions = shuffle(['正方形', '三角形', '梯形', '圆形']);
      const choices = shuffle([answer, ...wrongOptions.slice(0, 3)]);
      return {
        question,
        answer,
        type: 'geometry_circle',
        subType: 'unfold',
        choices,
        inputType: 'choice'
      };
    } else {
      const question = '圆锥的侧面展开图是什么形状？';
      const answer = '扇形';
      const wrongOptions = shuffle(['长方形', '三角形', '圆形', '梯形']);
      const choices = shuffle([answer, ...wrongOptions.slice(0, 3)]);
      return {
        question,
        answer,
        type: 'geometry_circle',
        subType: 'unfold',
        choices,
        inputType: 'choice'
      };
    }
  }
}

/**
 * 三视图题
 * 从正面/侧面/上面观察立体图形
 * @param {number} grade - 年级
 * @returns {object} 题目对象
 */
export function generateViewQuestion(_grade) {
  const viewDirections = ['正面', '侧面', '上面'];
  const direction = viewDirections[Math.floor(Math.random() * viewDirections.length)];

  // 使用方框搭建的立体组合描述
  const structures = [
    { name: '2个正方体上下叠放', front: '上下2个正方形', top: '1个正方形', side: '上下2个正方形' },
    { name: '2个正方体左右并排', front: '左右2个正方形', top: '左右2个正方形', side: '1个正方形' },
    { name: '3个正方体呈L形', front: '下面2个上面1个靠左', top: 'L形排列', side: '下面2个上面1个靠后' },
    { name: '正方体', front: '1个正方形', top: '1个正方形', side: '1个正方形' },
    { name: '长方体', front: '1个长方形', top: '1个长方形', side: '1个长方形' }
  ];

  const struct = structures[Math.floor(Math.random() * structures.length)];
  const answer = struct[direction];

  // 生成干扰
  const wrongViews = viewDirections
    .filter(d => d !== direction)
    .map(d => struct[d]);
  const structIndex = structures.findIndex(s => s.name === struct.name);
  const otherStruct = structures[(structIndex + 1 + Math.floor(Math.random() * (structures.length - 1))) % structures.length];
  const wrongPool = [...wrongViews, otherStruct[direction]];

  const wrongOptions = shuffle(wrongPool).slice(0, 3);
  const choices = shuffle([answer, ...wrongOptions]);

  return {
    question: `从${direction}看"${struct.name}"，看到的形状是？`,
    answer,
    type: 'geometry_view',
    subType: direction,
    viewData: { structure: struct.name, direction },
    choices,
    inputType: 'choice'
  };
}

/**
 * 根据年级和模式生成题目
 * @param {string} mode - 场景模式
 * @param {number} grade - 年级
 * @returns {object} 题目对象
 */
export function generateQuestion(mode, grade) {
  switch (mode) {
    case 'identify':
      return generateIdentifyQuestion(grade);
    case 'angles':
      return generateAngleQuestion(grade);
    case 'triangle':
      return generateTriangleQuestion(grade);
    case 'area':
      return generateAreaQuestion(grade);
    case 'transform':
      return generateTransformQuestion(grade);
    case 'solid':
      return generateSolidQuestion(grade);
    case 'circle':
      return generateCircleQuestion(grade);
    case 'views':
      return generateViewQuestion(grade);
    default:
      return generateIdentifyQuestion(grade);
  }
}

export default {
  generateQuestion,
  generateIdentifyQuestion,
  generatePropertyQuestion,
  generateTriangleQuestion,
  generateAngleQuestion,
  generateAreaQuestion,
  generateTransformQuestion,
  generateSolidQuestion,
  generateCircleQuestion,
  generateViewQuestion
};
