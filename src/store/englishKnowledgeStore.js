/**
 * 英语错题记录 Store
 *
 * 记录每个知识点（题型）的答题统计，用于后续权重反馈引擎。
 * 遵循 save-on-write 模式：每次 recordResult() 后立即持久化到 localStorage。
 * 结构同 mathKnowledgeStore，但使用独立的 localStorage key。
 */
import { defineStore } from 'pinia';
import storageManager, { STORAGE_KEYS } from '../utils/storage';
import { reviewResult, getInitialSM2Fields } from '../utils/spacedRepetition';

export const useEnglishKnowledgeStore = defineStore('englishKnowledge', {
  state: () => ({
    /**
     * 知识点记录，以知识点 id 为 key
     * @type {Object<string, {totalAttempts: number, wrongCount: number, lastWrongTime: number|null, subtopics: Object, easeFactor?: number, interval?: number, nextReviewTime?: number|null, lastReviewDate?: number|null}>}
     */
    records: {}
  }),

  getters: {
    /**
     * 获取所有到期可复习的知识点
     * 筛选 easeFactor 已设置 且 (nextReviewTime 为空 或 已到期) 的记录
     * @returns {Array<{id: string, totalAttempts: number, wrongCount: number, lastWrongTime: number|null, subtopics: Object, easeFactor: number, interval: number, nextReviewTime: number|null, lastReviewDate: number|null}>}
     */
    dueReviews(state) {
      const now = Date.now();
      const items = [];
      for (const [id, record] of Object.entries(state.records)) {
        if (record.easeFactor !== undefined &&
            (record.nextReviewTime === null || record.nextReviewTime <= now)) {
          items.push({ id, ...record });
        }
      }
      return items;
    }
  },

  actions: {
    /**
     * 从 localStorage 加载知识记录
     * 解析失败时 records 回退为空对象
     */
    init() {
      try {
        const data = storageManager._loadOptionalData(STORAGE_KEYS.ENGLISH_KNOWLEDGE, 'englishKnowledge');
        if (data) {
          this.records = data;
        }
      } catch (e) {
        console.warn('加载英语知识记录失败:', e.message);
        this.records = {};
      }
    },

    /**
     * 记录一次答题结果
     * @param {string} id - 知识点标识（与 knowledge.js 中节点 id 一致）
     * @param {boolean} correct - 是否答对
     */
    recordResult(id, correct) {
      // 确保记录存在
      if (!this.records[id]) {
        this.records[id] = {
          totalAttempts: 0,
          wrongCount: 0,
          lastWrongTime: null,
          subtopics: {}
        };
      }

      const record = this.records[id];
      record.totalAttempts += 1;

      if (!correct) {
        record.wrongCount += 1;
        record.lastWrongTime = Date.now();
      }

      // 首次答对时初始化 SM-2 字段
      if (correct && record.easeFactor === undefined) {
        const sm2Fields = getInitialSM2Fields();
        record.easeFactor = sm2Fields.easeFactor;
        record.interval = sm2Fields.interval;
        record.nextReviewTime = Date.now() + 86400000; // 1天后可复习
        record.lastReviewDate = sm2Fields.lastReviewDate;
      }

      // save-on-write：立即持久化
      this._persist();
    },

    /**
     * 安排一次 SM-2 复习
     * @param {string} id - 知识点标识
     * @param {number} quality - 复习质量 0=忘记, 1=困难, 2=轻松
     * @returns {boolean} 是否成功
     */
    scheduleReview(id, quality) {
      const record = this.records[id];
      if (!record || record.easeFactor === undefined) return false;
      const result = reviewResult(record, quality);
      record.easeFactor = result.newEF;
      record.interval = result.newInterval;
      record.nextReviewTime = result.nextReviewTime;
      record.lastReviewDate = Date.now();
      this._persist();
      return true;
    },

    /**
     * 持久化当前 records 到 localStorage
     */
    _persist() {
      try {
        storageManager._safeSetItem(
          STORAGE_KEYS.ENGLISH_KNOWLEDGE,
          JSON.stringify(this.records)
        );
      } catch (e) {
        console.warn('保存英语知识记录失败:', e.message);
      }
    },

    /**
     * 重置所有记录
     */
    reset() {
      this.records = {};
      try {
        localStorage.removeItem(STORAGE_KEYS.ENGLISH_KNOWLEDGE);
      } catch (e) {
        console.warn('清除英语知识记录失败:', e.message);
      }
    }
  }
});

export default useEnglishKnowledgeStore;
