/**
 * 英语题型权重配置
 *
 * 速拼题型权重（方案 C 使用）
 * 语法塔知识点权重（用于大厅推荐、跨塔协调，一期预留）
 */

// 速拼题型的目标正确率配置
export const SPEED_SPELL_TARGET_RATES = {
  en2cn: 0.85, // 英译中目标正确率最高
  cn2en: 0.85,
  listening: 0.80 // 听力相对难，目标略低
};

// 速拼题型的冷启动保护阈值（答题次数低于此值不启用错题 boost）
export const MIN_ATTEMPTS_BOOST = 3;
