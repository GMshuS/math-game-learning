/**
 * 通知系统 Store
 */
import { defineStore } from 'pinia';

const STORAGE_KEY = 'math_game_notifications';
const EXPIRY_DAYS = 7;

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] // { id, type, title, message, read, createdAt }
  }),

  getters: {
    unreadCount: (state) => {
      return state.notifications.filter(n => !n.read).length;
    },

    hasUnread: (state) => {
      return state.notifications.some(n => !n.read);
    },

    unreadByType: (state) => (type) => {
      return state.notifications.filter(n => n.type === type && !n.read);
    }
  },

  actions: {
    /**
     * 初始化 - 从 LocalStorage 加载并清理过期通知
     */
    init() {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          this.notifications = parsed;
          this.cleanExpired();
        }
      } catch (e) {
        console.warn('Failed to load notifications:', e);
        this.notifications = [];
      }
    },

    /**
     * 添加通知
     */
    addNotification({ type, title, message }) {
      const notification = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        type, // 'card', 'achievement', 'error', 'success', 'info'
        title,
        message,
        read: false,
        createdAt: Date.now()
      };
      this.notifications.unshift(notification);
      this.save();
      return notification;
    },

    /**
     * 显示纯文本提示（自动 3 秒后清除）
     * @param {string} message 提示内容
     * @param {'success'|'error'|'info'} type 提示类型
     */
    show(message, type = 'info') {
      const notif = this.addNotification({
        type,
        title: type === 'error' ? '错误' : type === 'success' ? '成功' : '提示',
        message
      });
      // 3 秒后自动移除
      setTimeout(() => {
        this.clearNotification(notif.id);
      }, 3000);
      return notif;
    },

    /**
     * 标记为已读
     */
    markAsRead(id) {
      const notif = this.notifications.find(n => n.id === id);
      if (notif) {
        notif.read = true;
        this.save();
      }
    },

    /**
     * 标记所有为已读
     */
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true);
      this.save();
    },

    /**
     * 清除通知
     */
    clearNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.save();
    },

    /**
     * 清除所有通知
     */
    clearAll() {
      this.notifications = [];
      this.save();
    },

    /**
     * 清除已读通知
     */
    clearRead() {
      this.notifications = this.notifications.filter(n => !n.read);
      this.save();
    },

    /**
     * 清理过期通知（超过 7 天）
     */
    cleanExpired() {
      const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const before = this.notifications.length;
      this.notifications = this.notifications.filter(n => (now - n.createdAt) < expiryMs);
      if (this.notifications.length !== before) {
        this.save();
      }
    },

    /**
     * 保存到 LocalStorage
     */
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
      } catch (e) {
        console.warn('Failed to save notifications:', e);
      }
    }
  }
});

export default useNotificationStore;
