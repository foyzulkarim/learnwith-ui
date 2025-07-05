// src/features/notifications/types.ts

export interface Notification {
  _id: string;
  type: 'new_video' | 'course_update' | 'system';
  title: string;
  message: string;
  metadata: {
    courseId?: string;
    videoId?: string;
    courseName?: string;
    videoTitle?: string;
    [key: string]: any;
  };
  createdAt: string;
  isRead: boolean;
  readAt?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type NotificationType = Notification['type'];
