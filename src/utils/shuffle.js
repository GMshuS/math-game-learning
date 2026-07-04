/**
 * Fisher-Yates 洗牌算法
 * 从原数组创建副本，返回随机排列的新数组
 * @template T
 * @param {T[]} arr - 待洗牌的数组
 * @returns {T[]} 打乱后的新数组（不修改原数组）
 */
export function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
