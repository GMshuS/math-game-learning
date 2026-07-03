/**
 * 自定义模板 Store
 *
 * 管理用户创建的自定义题目模板以及策略C（哪些游戏模式启用自定义模板）。
 * 遵循 save-on-write 模式：每次 mutation 后立即持久化到 localStorage。
 */
import { defineStore } from 'pinia';
import storageManager, { STORAGE_KEYS } from '../utils/storage';

export const useCustomTemplateStore = defineStore('customTemplate', {
  state: () => ({
    /**
     * 模板数组
     * @type {Array<{id: string, subject: string, template: string, params: Array, answerFormula: string, knowledgeId: string, grade: number, difficulty: string, tags: Array<string>, createdAt: number, updatedAt: number}>}
     */
    templates: [],
    /**
     * 策略C 开关配置
     * @type {Object<string, boolean>}
     */
    strategyConfig: {
      targetedTraining: true,
      review: true,
      speedChallenge: false,
      cardBattle: false,
      shop: false,
      cashier: false
    }
  }),

  getters: {
    /**
     * 按年级筛选模板
     * @param {number} grade - 目标年级
     * @returns {Array} 匹配的模板数组
     */
    getTemplatesForGrade: (state) => (grade) => {
      return state.templates.filter(t => t.grade === grade);
    },
    /**
     * 按知识节点筛选
     * @param {string} knowledgeId - 知识点 id
     * @returns {Array} 匹配的模板数组
     */
    getTemplatesByKnowledge: (state) => (knowledgeId) => {
      return state.templates.filter(t => t.knowledgeId === knowledgeId);
    }
  },

  actions: {
    /**
     * 从 localStorage 加载模板数据和策略配置
     * 解析失败时回退到空数组/默认配置
     */
    init() {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
        if (saved) {
          this.templates = JSON.parse(saved);
        }
      } catch (e) {
        console.warn('加载自定义模板失败:', e.message);
        this.templates = [];
      }
      try {
        const config = localStorage.getItem(STORAGE_KEYS.TEMPLATE_CONFIG);
        if (config) {
          this.strategyConfig = { ...this.strategyConfig, ...JSON.parse(config) };
        }
      } catch (e) {
        console.warn('加载策略C配置失败:', e.message);
      }
    },

    /**
     * 持久化模板列表到 localStorage
     */
    _saveTemplates() {
      try {
        storageManager._safeSetItem(
          STORAGE_KEYS.CUSTOM_TEMPLATES,
          JSON.stringify(this.templates)
        );
      } catch (e) {
        console.warn('保存自定义模板失败:', e.message);
      }
    },

    /**
     * 持久化策略C配置到 localStorage
     */
    _saveConfig() {
      try {
        storageManager._safeSetItem(
          STORAGE_KEYS.TEMPLATE_CONFIG,
          JSON.stringify(this.strategyConfig)
        );
      } catch (e) {
        console.warn('保存策略C配置失败:', e.message);
      }
    },

    /**
     * 新增模板
     * 自动生成 id、createdAt、updatedAt
     * @param {Object} template - 模板数据（不含 id/createdAt/updatedAt）
     * @returns {string} 新模板的 id
     */
    addTemplate(template) {
      const newTemplate = {
        ...template,
        id: 'ct_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      this.templates.push(newTemplate);
      this._saveTemplates();
      return newTemplate.id;
    },

    /**
     * 更新指定模板
     * @param {string} id - 模板 id
     * @param {Object} data - 要更新的字段
     * @returns {boolean} 是否更新成功
     */
    updateTemplate(id, data) {
      const idx = this.templates.findIndex(t => t.id === id);
      if (idx !== -1) {
        this.templates[idx] = { ...this.templates[idx], ...data, updatedAt: Date.now() };
        this._saveTemplates();
        return true;
      }
      return false;
    },

    /**
     * 删除指定模板
     * @param {string} id - 模板 id
     */
    deleteTemplate(id) {
      this.templates = this.templates.filter(t => t.id !== id);
      this._saveTemplates();
    },

    /**
     * 更新策略C配置（部分更新）
     * @param {Object<string, boolean>} config - 要更新的模式开关
     */
    updateStrategyConfig(config) {
      this.strategyConfig = { ...this.strategyConfig, ...config };
      this._saveConfig();
    },

    /**
     * 检查某游戏模式是否启用了自定义模板
     * @param {string} mode - 游戏模式名称
     * @returns {boolean}
     */
    isModeEnabled(mode) {
      return this.strategyConfig[mode] === true;
    }
  }
});

export default useCustomTemplateStore;
