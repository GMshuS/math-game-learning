/**
 * 钟表学院 — 配置与题目生成
 * 包含年级难度配置和钟表相关题目生成
 */

/**
 * 各年级难度配置
 */
export const gradeConfig = {
  1: {
    label: '一年级',
    timeTypes: ['whole'],           // 整时
    description: '整时认读（如 3:00、7:00）',
    step: 60,                       // 分钟步长
    optionsCount: 4,
    intervalRange: null             // 不涉及时间间隔
  },
  2: {
    label: '二年级',
    timeTypes: ['whole', 'half'],   // 整时 + 半时
    description: '整时和半时认读',
    step: 30,
    optionsCount: 4,
    intervalRange: null
  },
  3: {
    label: '三年级',
    timeTypes: ['whole', 'half', 'quarter'],
    description: '整时、半时、刻钟认读',
    step: 15,
    optionsCount: 4,
    intervalRange: null
  },
  4: {
    label: '四年级',
    timeTypes: ['whole', 'half', 'quarter', 'any'],
    description: '任意时间认读',
    step: 5,
    optionsCount: 4,
    intervalRange: null
  },
  5: {
    label: '五年级',
    timeTypes: ['whole', 'half', 'quarter', 'any'],
    description: '任意时间认读 + 时间间隔计算',
    step: 5,
    optionsCount: 4,
    intervalRange: [5, 120]         // 5分钟到2小时的间隔
  },
  6: {
    label: '六年级',
    timeTypes: ['whole', 'half', 'quarter', 'any'],
    description: '任意时间认读 + 时间间隔计算',
    step: 1,
    optionsCount: 4,
    intervalRange: [5, 240]         // 5分钟到4小时的间隔
  }
};

/**
 * 获取指定年级的配置
 * @param {number} grade - 年级 (1-6)
 * @returns {object}
 */
export function getConfigForGrade(grade) {
  const clampedGrade = Math.min(6, Math.max(1, grade));
  return gradeConfig[clampedGrade] || gradeConfig[1];
}

/**
 * 随机整数 [min, max]
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
 * 生成一个随机时间
 * @param {number} grade - 年级
 * @returns {{ hour: number, minute: number, display: string }}
 */
export function generateRandomTime(grade) {
  const config = getConfigForGrade(grade);
  const type = config.timeTypes[Math.floor(Math.random() * config.timeTypes.length)];

  let hour, minute;

  switch (type) {
    case 'whole':
      hour = randomInt(1, 12);
      minute = 0;
      break;
    case 'half':
      hour = randomInt(1, 12);
      minute = 30;
      break;
    case 'quarter':
      hour = randomInt(1, 12);
      minute = Math.random() < 0.5 ? 15 : 45;
      break;
    case 'any':
    default:
      hour = randomInt(1, 12);
      minute = randomInt(0, 59);
      // 按年级步长取整
      if (config.step > 1) {
        minute = Math.round(minute / config.step) * config.step;
        if (minute >= 60) {
          minute = 0;
          hour = hour % 12 + 1;
        }
      }
      break;
  }

  const display = `${hour}:${String(minute).padStart(2, '0')}`;
  return { hour, minute, display };
}

/**
 * 生成钟表认读题目
 * @param {number} grade - 年级
 * @param {object} options - 可选参数
 * @param {number} options.timeHour - 指定小时（可选）
 * @param {number} options.timeMinute - 指定分钟（可选）
 * @returns {object} 题目对象
 */
export function generateClockQuestion(grade, options = {}) {
  const config = getConfigForGrade(grade);
  const time = options.timeHour !== undefined
    ? { hour: options.timeHour, minute: options.timeMinute || 0, display: `${options.timeHour}:${String(options.timeMinute || 0).padStart(2, '0')}` }
    : generateRandomTime(grade);

  const answer = time.display;

  // 生成干扰选项
  const wrongOptions = generateWrongTimes(time, grade, config.optionsCount - 1);
  const choices = shuffle([answer, ...wrongOptions]);

  return {
    question: `钟面上显示的是几点？`,
    answer,
    type: 'clock_read',
    grade,
    time,
    choices,
    inputType: 'choice'
  };
}

/**
 * 生成时间间隔计算题
 * @param {number} grade - 年级
 * @returns {object} 题目对象
 */
export function generateIntervalQuestion(grade) {
  const config = getConfigForGrade(grade);
  if (!config.intervalRange) {
    // 低年级降级为认读题
    return generateClockQuestion(grade);
  }

  const [minInterval, maxInterval] = config.intervalRange;
  const minutesOffset = randomInt(minInterval, maxInterval);

  // 生成起始时间
  const startHour = randomInt(1, 11);
  const startMinute = randomInt(0, 59);

  // 计算结束时间
  let totalMinutes = startHour * 60 + startMinute + minutesOffset;
  let endHour = Math.floor(totalMinutes / 60) % 12;
  if (endHour === 0) endHour = 12;
  const endMinute = totalMinutes % 60;

  const startDisplay = `${startHour}:${String(startMinute).padStart(2, '0')}`;
  const endDisplay = `${endHour}:${String(endMinute).padStart(2, '0')}`;

  const answer = minutesOffset;

  // 生成干扰选项
  const wrongPool = [
    minutesOffset + randomInt(1, 5),
    Math.max(1, minutesOffset - randomInt(1, 5)),
    minutesOffset + randomInt(10, 30),
    Math.max(1, minutesOffset - randomInt(10, 30)),
    minutesOffset * 2,
    Math.round(minutesOffset / 2)
  ];
  const wrongOptions = shuffle(wrongPool.filter(n => n !== minutesOffset && n > 0)).slice(0, 3);
  const choices = shuffle([answer, ...wrongOptions]);

  return {
    question: `从 ${startDisplay} 到 ${endDisplay} 经过了多长时间？`,
    answer,
    type: 'clock_interval',
    grade,
    startTime: { hour: startHour, minute: startMinute },
    endTime: { hour: endHour, minute: endMinute },
    choices,
    inputType: 'choice'
  };
}

/**
 * 生成错误的钟表时间选项
 * @param {{ hour: number, minute: number, display: string }} correctTime
 * @param {number} grade
 * @param {number} count
 * @returns {string[]}
 */
export function generateWrongTimes(correctTime, grade, count) {
  const wrongTimes = new Set();
  const config = getConfigForGrade(grade);
  const step = config.step;
  const maxAttempts = 30;

  let attempts = 0;
  while (wrongTimes.size < count && attempts < maxAttempts) {
    attempts++;
    let wrongHour = correctTime.hour + (Math.random() < 0.5 ? 1 : -1) * randomInt(1, 3);
    if (wrongHour < 1) wrongHour += 12;
    if (wrongHour > 12) wrongHour -= 12;

    let wrongMinute;
    if (step >= 60) {
      wrongMinute = 0;
    } else {
      wrongMinute = correctTime.minute + (Math.random() < 0.5 ? 1 : -1) * randomInt(1, 4) * step;
      if (wrongMinute >= 60 || wrongMinute < 0) {
        wrongMinute = correctTime.minute;
      }
    }

    const display = `${wrongHour}:${String(wrongMinute).padStart(2, '0')}`;
    if (display !== correctTime.display) {
      wrongTimes.add(display);
    }
  }

  // 填充剩余
  while (wrongTimes.size < count) {
    const h = randomInt(1, 12);
    const m = randomInt(0, 3) * 15;
    const display = `${h}:${String(m).padStart(2, '0')}`;
    if (display !== correctTime.display) {
      wrongTimes.add(display);
    }
  }

  return [...wrongTimes].slice(0, count);
}

export default {
  gradeConfig,
  getConfigForGrade,
  generateRandomTime,
  generateClockQuestion,
  generateIntervalQuestion,
  generateWrongTimes
};
