// src/features/notifications/services/notificationService.ts
import axios from 'axios';
import { ApiResponse, NotificationResponse, UnreadCountResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/notifications`,
  withCredentials: true, // Include cookies for JWT authentication
});

export const notificationService = {
  /**
   * Get notifications for the authenticated user
   */
  async getNotifications(page: number = 1, limit: number = 10): Promise<NotificationResponse> {
    const response = await api.get<ApiResponse<NotificationResponse>>('/', {
      params: { page, limit },
    });
    return response.data.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get<ApiResponse<UnreadCountResponse>>('/unread-count');
    return response.data.data;
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await api.post(`/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ updatedCount: number }> {
    const response = await api.post<ApiResponse<{ updatedCount: number }>>('/mark-all-read');
    return response.data.data;
  },
};
