import api from './axios'
import type { ApiResponse, Notification } from '../types'

export const getNotifications = (userId: number) =>
  api.get<ApiResponse<Notification[]>>(`/api/notifications?userId=${userId}`).then(r => r.data.data)

export const getUnreadCount = (userId: number) =>
  api.get<ApiResponse<number>>(`/api/notifications/unread-count?userId=${userId}`).then(r => r.data.data)

export const markAsRead = (id: number, userId: number) =>
  api.patch<ApiResponse<Notification>>(`/api/notifications/${id}/read?userId=${userId}`).then(r => r.data.data)

export const markAllAsRead = (userId: number) =>
  api.patch(`/api/notifications/read-all?userId=${userId}`)
