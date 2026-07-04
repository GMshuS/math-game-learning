/**
 * 挑战模式基类工厂
 * 提取 speedChallengeStore 和 englishSpeedSpellStore 的公共逻辑
 * 减少代码重复，统一维护入口
 */

/**
 * 创建挑战模式 Store 的公共 state 定义
 */
export function createChallengeState() {
  return {
    currentMode: null, // 'base' | 'blitz' | 'survival'
    isPlaying: false,
    timeLeft: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    wrongCount: 0,
    lives: 3,
    maxLives: 3,
    aiProgress: 0,
    currentQuestion: null,
    gameResult: null
  };
}

/**
 * 创建 getters（需要传入 config 引用）
 * @param {Function} configRef - () => config 对象的函数引用
 */
export function createChallengeGetters(configRef) {
  return {
    comboMultiplier: (state) => 1 + state.combo * (configRef().modes[state.currentMode]?.comboBonus ?? 0),
    modeConfig: (state) => configRef().modes[state.currentMode] || null
  };
}

/**
 * 创建 startGame 公共逻辑
 * @param {object} ctx - store 实例 (this)
 * @param {object} config - 模式配置对象
 * @param {string} mode - 模式名
 * @param {Function} generateFn - 题目生成函数
 * @returns {boolean} 是否成功启动
 */
export function baseStartGame(ctx, config, mode, generateFn) {
  if (!config) return false;

  ctx.currentMode = mode;
  ctx.isPlaying = true;
  ctx.score = 0;
  ctx.combo = 0;
  ctx.maxCombo = 0;
  ctx.correctCount = 0;
  ctx.wrongCount = 0;
  ctx.aiProgress = 0;
  ctx.gameResult = null;

  if (mode === 'base') {
    ctx.timeLeft = config.duration;
  } else if (mode === 'blitz') {
    ctx.timeLeft = config.duration;
    ctx.aiProgress = 0;
  } else if (mode === 'survival') {
    ctx.lives = config.lives;
    ctx.maxLives = ctx.lives;
    ctx.timeLeft = 0;
  }

  if (generateFn) generateFn();
  return true;
}

/**
 * 创建 answer 公共逻辑
 * @param {object} ctx - store 实例 (this)
 * @param {boolean} isCorrect - 答案是否正确
 * @param {Function} onCorrect - 正确时的额外回调（blitz 模式调用）
 * @param {Function} onWrong - 错误时的额外回调（仅在 survival 模式 lives<=0 时调用）
 * @param {Function} generateFn - 题目生成函数
 * @returns {boolean} 是否正确
 */
export function baseAnswer(ctx, isCorrect, { onCorrect, onWrong, generateFn } = {}) {
  if (!ctx.isPlaying || !ctx.currentQuestion) return false;

  if (isCorrect) {
    ctx.correctCount++;
    ctx.combo++;
    if (ctx.combo > ctx.maxCombo) ctx.maxCombo = ctx.combo;

    const basePoints = (ctx.modeConfig || {}).pointsPerCorrect || 10;
    const points = Math.floor(basePoints * ctx.comboMultiplier);
    ctx.score += points;

    if (ctx.currentMode === 'blitz' && onCorrect) onCorrect();
  } else {
    ctx.wrongCount++;
    ctx.combo = 0;

    if (ctx.currentMode === 'survival') {
      ctx.lives--;
      if (ctx.lives <= 0) {
        if (onWrong) onWrong();
        return true;
      }
    }
  }

  if (generateFn) generateFn();
  return isCorrect;
}

/**
 * 创建 tick 公共逻辑
 * @param {object} ctx - store 实例 (this)
 * @param {Function} onEndGame - 游戏结束回调
 * @param {number} aiTickRate - AI 滴答速率
 */
export function baseTick(ctx, onEndGame, aiTickRate = 0.3) {
  if (!ctx.isPlaying) return;

  if (ctx.currentMode === 'base' || ctx.currentMode === 'blitz') {
    ctx.timeLeft--;
    if (ctx.timeLeft <= 0) {
      if (onEndGame) onEndGame();
    }

    if (ctx.currentMode === 'blitz') {
      ctx.aiProgress += aiTickRate;
      if (ctx.aiProgress >= 100) {
        if (onEndGame) onEndGame();
      }
    }
  }
}

/**
 * 创建 endGame 公共结算计算
 * @param {object} ctx - store 实例 (this)
 * @param {object} config - 模式配置对象
 * @returns {object} gameResult
 */
export function baseEndGame(ctx, config) {
  ctx.isPlaying = false;

  let coins = Math.floor(ctx.score * (config.rewards?.coinsPerPoint || 0));
  let gems = 0;
  for (const threshold of (config.rewards?.gemThresholds || [])) {
    if (ctx.score >= threshold.score) gems = threshold.gems;
  }

  let rating = 'D';
  for (const r of (config.ratings || [])) {
    if (ctx.score >= r.minScore) rating = r.rating;
  }

  ctx.gameResult = {
    score: ctx.score,
    rating,
    coins,
    gems,
    correct: ctx.correctCount,
    wrong: ctx.wrongCount,
    maxCombo: ctx.maxCombo,
    aiWon: ctx.currentMode === 'blitz' && ctx.aiProgress >= 100
  };

  return ctx.gameResult;
}
