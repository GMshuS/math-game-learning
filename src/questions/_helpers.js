/**
 * 题型共享工具函数
 */

/**
 * 生成随机整数 [min, max]
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成随机范围数 [min, max]，按步长 step 递增
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {number} [step=1] - 步长
 * @returns {number} 随机数
 */
export function randomRange(min, max, step = 1) {
  if (step <= 0) step = 1;
  const count = Math.floor((max - min) / step) + 1;
  return min + Math.floor(Math.random() * count) * step;
}

/**
 * 数字补零，至少两位
 * @param {number} n - 数字
 * @returns {string} 补零后的字符串
 */
export function zeroPad(n) {
  return String(n).padStart(2, '0');
}

/**
 * 从数组中随机选一个元素
 * @param {T[]} arr - 源数组
 * @returns {T} 随机选中的元素
 */
export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 从数组中随机选 n 个不同元素
 * @param {T[]} arr - 源数组
 * @param {number} n - 选取数量
 * @returns {T[]} 随机选中的元素数组
 */
export function pickN(arr, n) {
  if (n >= arr.length) return [...arr];
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

/**
 * 最大公因数（欧几里得算法）
 * @param {number} a
 * @param {number} b
 * @returns {number} gcd
 */
export function GCD(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * 最小公倍数
 * @param {number} a
 * @param {number} b
 * @returns {number} lcm
 */
export function LCM(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / GCD(a, b);
}
