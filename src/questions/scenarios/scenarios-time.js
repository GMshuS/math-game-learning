/**
 * 时间管理场景模板（G1-G4）
 * 知识点：time_add / time_sub / time_diff / time_24hr / time_plan / time_optimize
 *
 * 模板 T1-T4:  G1（wakeup, afterschool, school_leave, cartoon）
 * 模板 T5-T8:  G2（school_duration, nap, homework_duration, bus_wait）
 * 模板 T9-T12: G3（movie_end, train_duration, sleep_overnight, time_convert）
 * 模板 T13-T16: G4（catch_plane, homework_plan, weekend_plan, shortest_path）
 *
 * 统一接口：export default { id, gradeMin, gradeMax, weight, generate }
 */
import { randomInt, randomRange, zeroPad, pick } from '../_helpers.js';

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
//  G1 模板（T1-T4）
// ============================================================

/**
 * T1: wakeup — 起床活动计时 → time_add
 * 例：小明7点起床，刷牙用了15分钟，小明几点刷完牙？
 */
function generateWakeup() {
  const names = ['小明', '小红', '小华', '小丽'];
  const name = pick(names);
  const hour = randomInt(6, 8);
  const minutes = pick([5, 10, 15, 20]);
  const activities = [
    { doing: '刷牙', done: '刷完牙' },
    { doing: '吃早餐', done: '吃完早餐' },
    { doing: '穿衣服', done: '穿好衣服' },
    { doing: '收拾书包', done: '收拾好书包' },
    { doing: '喂小狗', done: '喂完小狗' }
  ];
  const activity = pick(activities);
  const question = `${name}${hour}点起床，${activity.doing}用了${minutes}分钟，${name}几点${activity.done}？`;
  return {
    knowledgeId: 'time_add',
    question,
    parts: [
      { type: 'number', answer: hour, label: '时' },
      { type: 'number', answer: minutes, label: '分' }
    ]
  };
}

/**
 * T2: afterschool — 放学回家 → time_add
 * 例：学校3点放学，走路回家用了20分钟，几点到家？
 */
function generateAfterschool() {
  const hour = randomInt(2, 4);
  const minutes = pick([10, 15, 20, 25]);
  const question = `学校${hour}点放学，走路回家用了${minutes}分钟，几点到家？`;
  return {
    knowledgeId: 'time_add',
    question,
    parts: [
      { type: 'number', answer: hour, label: '时' },
      { type: 'number', answer: minutes, label: '分' }
    ]
  };
}

/**
 * T3: school_leave — 最晚出发时间 → time_sub
 * 例：学校8点上课，从家到学校要走20分钟，最晚几点从家出发？
 *
 * 思路：提前 walkMin 分钟出发，即 schoolHour:00 - walkMin = (schoolHour-1):(60-walkMin)
 */
function generateSchoolLeave() {
  const schoolHour = pick([8, 9]);
  const walkMin = pick([10, 15, 20, 25, 30]);
  const leaveHour = schoolHour - 1;
  const leaveMin = 60 - walkMin;
  const variants = ['赶校车', '赶升旗', '赶上早读'];
  const variant = pick(variants);
  const question = `学校${schoolHour}点上课，从家到学校要走${walkMin}分钟，最晚几点从家出发？（${variant}）`;
  return {
    knowledgeId: 'time_sub',
    question,
    parts: [
      { type: 'number', answer: leaveHour, label: '时' },
      { type: 'number', answer: leaveMin, label: '分' }
    ]
  };
}

/**
 * T4: cartoon — 动画片时长 → time_diff
 * 例：动画片6点10分开始，6点40分结束，动画片放了多长时间？
 *
 * 约束：startMin + duration ≤ 55（不跨小时）
 */
function generateCartoon() {
  const hour = randomInt(6, 8);
  const startMinOptions = [0, 5, 10, 15, 20, 25, 30];
  const durationOptions = [15, 20, 25, 30, 35, 40];
  const startMin = pick(startMinOptions);
  const validDurations = durationOptions.filter(d => startMin + d <= 55);
  const duration = pick(validDurations);
  const endMin = startMin + duration;
  const question = `动画片${hour}点${startMin}分开始，${hour}点${endMin}分结束，动画片放了多长时间？`;
  return {
    knowledgeId: 'time_diff',
    question,
    parts: [
      { type: 'number', answer: duration, label: '分钟' }
    ]
  };
}

// ============================================================
//  G2 模板（T5-T8）
// ============================================================

/**
 * T5: school_duration — 在校时长 → time_diff
 * 例：小红7:30到校，11:30放学，上午在学校待了多长时间？
 *
 * 计算时长 = (leaveHour*60+leaveMin) - (arriveHour*60+arriveMin)
 * 结果范围：180~300 分钟
 */
function generateSchoolDuration() {
  let arriveHour, arriveMin, leaveHour, leaveMin, duration;
  // 迭代重试，避免递归栈溢出风险
  for (let attempt = 0; attempt < 100; attempt++) {
    arriveHour = pick([7, 8]);
    arriveMin = pick([0, 30]);
    leaveHour = pick([11, 12]);
    leaveMin = pick([0, 30]);
    const arriveTotal = arriveHour * 60 + arriveMin;
    const leaveTotal = leaveHour * 60 + leaveMin;
    if (leaveTotal > arriveTotal) {
      duration = leaveTotal - arriveTotal;
      break;
    }
  }
  const question = `小红${arriveHour}:${zeroPad(arriveMin)}到校，${leaveHour}:${zeroPad(leaveMin)}放学，上午在学校待了多长时间？`;
  return {
    knowledgeId: 'time_diff',
    question,
    parts: [
      { type: 'number', answer: duration, label: '分钟' }
    ]
  };
}

/**
 * T6: nap — 午睡时长 → time_diff
 * 例：小明12:30开始午睡，13:15醒来，睡了多长时间？
 *
 * startHour ∈ {12,13}, startMin ∈ {0,15,30,45}
 * 结束时间：同小时或下一小时，确保 duration > 0 且 ≤ 120
 */
function generateNap() {
  let startHour, startMin, endHour, endMin, duration;
  // 迭代重试，避免递归栈溢出风险
  for (let attempt = 0; attempt < 100; attempt++) {
    startHour = pick([12, 13]);
    startMin = pick([0, 15, 30, 45]);
    const useNextHour = Math.random() > 0.5;
    if (useNextHour) {
      endHour = startHour + 1;
      endMin = pick([0, 15, 30, 45]);
    } else {
      const validEndMins = [0, 15, 30, 45].filter(m => m > startMin);
      if (validEndMins.length === 0) {
        endHour = startHour + 1;
        endMin = pick([0, 15, 30, 45]);
      } else {
        endHour = startHour;
        endMin = pick(validEndMins);
      }
    }
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    duration = endTotal - startTotal;
    if (duration > 0 && duration <= 120) break;
  }
  const question = `小明${startHour}:${zeroPad(startMin)}开始午睡，${endHour}:${zeroPad(endMin)}醒来，睡了多长时间？`;
  return {
    knowledgeId: 'time_diff',
    question,
    parts: [
      { type: 'number', answer: duration, label: '分钟' }
    ]
  };
}

/**
 * T7: homework_duration — 做作业时长 → time_diff
 * 例：小华15:00开始做作业，15:20做完，做作业花了多长时间？
 *
 * 约束：startMin + duration < 60（不跨小时）
 */
function generateHomeworkDuration() {
  const startHour = pick([15, 16, 17]);
  const startMin = pick([0, 15, 30]);
  const durationOptions = [20, 25, 30, 35, 40, 45, 50, 55, 60];
  const validDurations = durationOptions.filter(d => startMin + d < 60);
  const duration = pick(validDurations);
  const endMin = startMin + duration;
  const question = `小华${startHour}:${zeroPad(startMin)}开始做作业，${startHour}:${zeroPad(endMin)}做完，做作业花了多长时间？`;
  return {
    knowledgeId: 'time_diff',
    question,
    parts: [
      { type: 'number', answer: duration, label: '分钟' }
    ]
  };
}

/**
 * T8: bus_wait — 等公交车时长 → time_diff
 * 例：公交车每15分钟一班，小明8:07到站，上一班8:00刚走，他要等多长时间？
 *
 * waitTime = interval - arriveMin
 */
function generateBusWait() {
  const interval = pick([10, 15, 20, 30]);
  const arriveMin = randomInt(1, interval - 1);
  const waitTime = interval - arriveMin;
  const question = `公交车每${interval}分钟一班，小明8:${zeroPad(arriveMin)}到站，上一班8:00刚走，他要等多长时间？`;
  return {
    knowledgeId: 'time_diff',
    question,
    parts: [
      { type: 'number', answer: waitTime, label: '分钟' }
    ]
  };
}

// ============================================================
//  G3 模板（T9-T12）
// ============================================================

/**
 * T9: movie_end — 电影/活动结束时间 → time_24hr
 * 例：电影14:30开始，片长120分钟，16:30结束
 *
 * startHour ∈ [13, 20], startMin ∈ {0,15,30,45}
 * durationMin ∈ [90, 150], 结束时间可能跨小时
 * 变体：电影、音乐会、球赛、话剧
 */
function generateMovieEnd() {
  const startHour = randomInt(13, 20);
  const startMin = pick([0, 15, 30, 45]);
  const durationMin = randomInt(90, 150);
  const startTotal = startHour * 60 + startMin;
  const endTotal = startTotal + durationMin;
  const endHour = Math.floor(endTotal / 60);
  const endMin = endTotal % 60;
  const variants = ['电影', '音乐会', '球赛', '话剧'];
  const variant = pick(variants);
  const question = `${variant}${startHour}:${zeroPad(startMin)}开始，片长${durationMin}分钟，几点结束？`;
  return {
    knowledgeId: 'time_24hr',
    question,
    parts: [
      { type: 'number', answer: endHour, label: '时' },
      { type: 'number', answer: endMin, label: '分' }
    ]
  };
}

/**
 * T10: train_duration — 火车行驶时长 → time_diff
 * 例：火车8:30从A站出发，12:30到达B站，行驶了240分钟
 *
 * depHour ∈ [8, 10], depMin ∈ {0,15,30,45}
 * arrHour = depHour + randomInt(2, 5)
 * arrMin = depMin（简化，出发和到达分钟相同）
 */
function generateTrainDuration() {
  const depHour = randomInt(8, 10);
  const depMin = pick([0, 15, 30, 45]);
  const arrHour = depHour + randomInt(2, 5);
  const arrMin = depMin;
  const durationMinutes = (arrHour - depHour) * 60;
  const question = `火车${depHour}:${zeroPad(depMin)}从A站出发，${arrHour}:${zeroPad(arrMin)}到达B站，行驶了多长时间？`;
  return {
    knowledgeId: 'time_diff',
    question,
    parts: [
      { type: 'number', answer: durationMinutes, label: '分钟' }
    ]
  };
}

/**
 * T11: sleep_overnight — 跨日睡眠时长 → time_diff
 * 例：小华22:30睡觉，第二天6:15起床，睡了465分钟
 *
 * 跨日处理：nightMin = (24*60 - bedTotal) + wakeTotal
 * bedHour ∈ {21,22,23}, bedMin ∈ {0,15,30}
 * wakeHour ∈ {5,6,7,8}, wakeMin ∈ {0,15,30}
 */
function generateSleepOvernight() {
  const bedHour = pick([21, 22, 23]);
  const bedMin = pick([0, 15, 30]);
  const wakeHour = pick([5, 6, 7, 8]);
  const wakeMin = pick([0, 15, 30]);
  const bedTotal = bedHour * 60 + bedMin;
  const wakeTotal = wakeHour * 60 + wakeMin;
  const nightMin = (24 * 60 - bedTotal) + wakeTotal;
  const question = `小华${bedHour}:${zeroPad(bedMin)}睡觉，第二天${wakeHour}:${zeroPad(wakeMin)}起床，睡了多长时间？`;
  return {
    knowledgeId: 'time_diff',
    question,
    parts: [
      { type: 'number', answer: nightMin, label: '分钟' }
    ]
  };
}

/**
 * T12: time_convert — 12时制转24时制 → time_24hr
 * 例：下午3点15分用24时计时法怎样表示？→ 15时15分
 *
 * hour12 ∈ [1, 11], minute ∈ {0,15,30,45}
 * hour24 = hour12 + 12
 */
function generateTimeConvert() {
  const hour12 = randomInt(1, 11);
  const minute = pick([0, 15, 30, 45]);
  const hour24 = hour12 + 12;
  const question = `下午${hour12}点${minute}分用24时计时法怎样表示？`;
  return {
    knowledgeId: 'time_24hr',
    question,
    parts: [
      { type: 'number', answer: hour24, label: '时' },
      { type: 'number', answer: minute, label: '分' }
    ]
  };
}

// ============================================================
//  G4 模板（T13-T16）
// ============================================================

/**
 * T13: catch_plane — 赶飞机/火车/考试 → time_plan
 * 例：小明要赶10:30的飞机，提前60分钟到达机场，坐车要30分钟，最晚几点从家出发？
 *
 * flightHour ∈ [8, 12], flightMin ∈ {0,15,30}
 * advanceMin ∈ {30,45,60}, driveMin ∈ [15, 45]（5的倍数）
 * leaveTotal = flightTotal - (advanceMin + driveMin)
 * 变体：赶火车、赶高铁、赶考试
 */
function generateCatchPlane() {
  const flightHour = randomInt(8, 12);
  const flightMin = pick([0, 15, 30]);
  const advanceMin = pick([30, 45, 60]);
  const driveMin = randomRange(15, 45, 5);
  const totalBefore = advanceMin + driveMin;
  const flightTotal = flightHour * 60 + flightMin;
  const leaveTotal = flightTotal - totalBefore;
  const leaveHour = Math.floor(leaveTotal / 60);
  const leaveMin = leaveTotal % 60;
  const variants = ['赶火车(需要提前15分钟检票)', '赶高铁', '赶考试'];
  const variant = pick(variants);
  const question = `小明要赶${flightHour}:${zeroPad(flightMin)}的飞机，需要提前${advanceMin}分钟到达机场，从家到机场坐车要${driveMin}分钟，最晚几点从家出发？（${variant}）`;
  return {
    knowledgeId: 'time_plan',
    question,
    parts: [
      { type: 'number', answer: leaveHour, label: '时' },
      { type: 'number', answer: leaveMin, label: '分' }
    ]
  };
}

/**
 * T14: homework_plan — 作业时间规划 → time_plan
 * 例：小明16:30到家，18:00要出门上兴趣班，做作业（数学25分+语文15分+英语10分），还能玩多长时间？
 *
 * homeHour ∈ {16,17}, homeMin ∈ {0,15,30}
 * outHour ∈ {18,19,20}, outMin = 0
 * task1 ∈ {15,20,25,30}, task2 ∈ {10,15,20}, task3 ∈ {5,10,15}
 * freeMin = (outTotal - homeTotal) - (task1 + task2 + task3)
 * 确保 freeMin ≥ 0（否则重新生成）
 */
function generateHomeworkPlan() {
  let freeMin;
  let homeHour, homeMin, outHour, outMin, task1, task2, task3;
  // 迭代重试，避免递归栈溢出风险
  for (let attempt = 0; attempt < 100; attempt++) {
    homeHour = pick([16, 17]);
    homeMin = pick([0, 15, 30]);
    outHour = pick([18, 19, 20]);
    outMin = 0;
    task1 = pick([15, 20, 25, 30]);
    task2 = pick([10, 15, 20]);
    task3 = pick([5, 10, 15]);
    const totalTask = task1 + task2 + task3;
    const homeTotal = homeHour * 60 + homeMin;
    const outTotal = outHour * 60 + outMin;
    freeMin = outTotal - homeTotal - totalTask;
    if (freeMin >= 0) break;
  }
  const question = `小明${homeHour}:${zeroPad(homeMin)}到家，${outHour}:${zeroPad(outMin)}要出门上兴趣班。作业：数学${task1}分钟、语文${task2}分钟、英语${task3}分钟。他还能玩多长时间？`;
  return {
    knowledgeId: 'time_plan',
    question,
    parts: [
      { type: 'number', answer: freeMin, label: '分钟' }
    ]
  };
}

/**
 * T15: weekend_plan — 并行任务优化 → time_optimize
 * 例：小明周末要做：整理房间30分钟、做作业20分钟、练琴15分钟。
 * 如果做作业和练琴可以同时进行，最少需要多长时间？
 *
 * taskA ∈ {30,40}（整理房间）
 * taskB ∈ {20,30,40}（做作业）
 * taskC ∈ {15,20}（练琴/听英语）
 * 并行对：{A,C} 或 {B,C}
 * 总时间 = Math.max(并行任务) + 剩余任务
 */
function generateWeekendPlan() {
  const taskA = pick([30, 40]);
  const taskB = pick([20, 30, 40]);
  const taskC = pick([15, 20]);
  // 固定使用"做作业和练琴同时进行"（与题目文字一致）
  const total = Math.max(taskB, taskC) + taskA;
  const question = `小明周末要做：整理房间${taskA}分钟、做作业${taskB}分钟、练琴${taskC}分钟。如果做作业和练琴可以同时进行，最少需要多长时间？`;
  return {
    knowledgeId: 'time_optimize',
    question,
    parts: [
      { type: 'number', answer: total, label: '分钟' }
    ]
  };
}

/**
 * T16: shortest_path — 路径比较 → time_optimize
 * 例：从家到学校：路线A全程走路30分钟；路线B骑车12分钟再步行8分钟。
 * 哪种方式更快？快多少分钟？
 *
 * 含 choice + number 组合 parts
 * walkOnly ∈ [20, 40]（5的倍数）
 * bikePart ∈ [8, 15], walkPart ∈ [5, 12]
 * 确保两种方式时间差异 ≥ 5分钟
 */
function generateShortestPath() {
  let walkOnly, bikePart, walkPart, bikeTotal;
  // 迭代重试，避免递归栈溢出风险
  for (let attempt = 0; attempt < 100; attempt++) {
    walkOnly = randomRange(20, 40, 5);
    bikePart = randomInt(8, 15);
    walkPart = randomInt(5, 12);
    bikeTotal = bikePart + walkPart;
    if (Math.abs(walkOnly - bikeTotal) >= 5) break;
  }
  const walkOnlyLabel = '全程走路';
  const bikeLabel = '骑车+步行';
  let faster, diff;
  if (walkOnly < bikeTotal) {
    faster = walkOnlyLabel;
    diff = bikeTotal - walkOnly;
  } else {
    faster = bikeLabel;
    diff = walkOnly - bikeTotal;
  }
  const question = `从家到学校：路线A${walkOnlyLabel}${walkOnly}分钟；路线B骑车${bikePart}分钟再步行${walkPart}分钟。哪种方式更快？快多少分钟？`;
  return {
    knowledgeId: 'time_optimize',
    question,
    parts: [
      { type: 'choice', answer: faster, options: ['全程走路', '骑车+步行'], label: '哪种方式更快？' },
      { type: 'number', answer: diff, label: '快多少分钟？' }
    ]
  };
}

// ============================================================
//  模板注册
// ============================================================
const g1Templates = [
  { fn: generateWakeup, weight: 3 },
  { fn: generateAfterschool, weight: 2 },
  { fn: generateSchoolLeave, weight: 3 },
  { fn: generateCartoon, weight: 2 }
];

const g2Templates = [
  { fn: generateSchoolDuration, weight: 3 },
  { fn: generateNap, weight: 2 },
  { fn: generateHomeworkDuration, weight: 3 },
  { fn: generateBusWait, weight: 2 }
];

const g3Templates = [
  { fn: generateMovieEnd, weight: 3 },
  { fn: generateTrainDuration, weight: 2 },
  { fn: generateSleepOvernight, weight: 2 },
  { fn: generateTimeConvert, weight: 2 }
];

const g4Templates = [
  { fn: generateCatchPlane, weight: 3 },
  { fn: generateHomeworkPlan, weight: 3 },
  { fn: generateWeekendPlan, weight: 2 },
  { fn: generateShortestPath, weight: 2 }
];

// ============================================================
//  场景模块默认导出
// ============================================================
export default {
  id: 'time',
  gradeMin: 1,
  gradeMax: 4,
  weight: 5,

  /**
   * 按年级生成时间管理应用题
   * @param {number} grade - 当前年级（1-4）
   * @param {object} _range - 数字范围（本场景未使用）
   * @returns {object} 题目对象
   */
  generate(grade, _range) {
    let result;
    if (grade === 1) {
      result = weightedPick(g1Templates).fn();
    } else if (grade === 2) {
      result = weightedPick(g2Templates).fn();
    } else if (grade === 3) {
      result = weightedPick(g3Templates).fn();
    } else {
      // G4 及以上使用 G4 模板
      result = weightedPick(g4Templates).fn();
    }
    return toResult(result);
  }
};
