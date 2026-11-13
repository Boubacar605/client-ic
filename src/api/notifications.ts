import { api, unwrap } from './client';
import type { Notification, NotificationPage } from './types';

export const listNotifications = (page = 1, limit = 20, lu?: boolean) =>
  api.get('/notifications', { params: { page, limit, ...(lu === undefined ? {} : { lu }) } }).then((r) => {
    const value = unwrap<NotificationPage | Notification[]>(r);
    if (Array.isArray(value)) return { data: value, page, limit, total: value.length, totalPages: value.length ? 1 : 0 };
    return {
      ...value,
      data: Array.isArray(value?.data) ? value.data : [],
    };
  });
export const unreadCount = () => api.get('/notifications/unread-count').then((r) => unwrap<{ count: number }>(r));
export const markAllNotificationsRead = () => api.patch('/notifications/read-all').then((r) => unwrap<{ count: number }>(r));
export const getNotification = (id: string) => api.get(`/notifications/${id}`).then((r) => unwrap<Notification & { events?: unknown[] }>(r));
export const markNotificationRead = (id: string) => api.patch(`/notifications/${id}/read`).then((r) => unwrap<Notification>(r));
