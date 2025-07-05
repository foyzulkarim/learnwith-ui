import { Notification } from '../types';

export interface NotificationUrlResult {
  url: string | null;
  isExternal: boolean;
}

/**
 * Generate URL for notification navigation
 * @param notification - The notification object
 * @returns Object with url and isExternal flag
 */
export const getNotificationUrl = (notification: Notification): NotificationUrlResult => {
  const { type, metadata } = notification;
  console.log('notification', notification)
  // Handle external URLs first
  if (metadata.isExternal && metadata.externalUrl) {
    return { 
      url: metadata.externalUrl, 
      isExternal: true 
    };
  }
  
  // Handle internal routes based on notification type
  switch (type) {
    case 'new_video':
      // For new video notifications, navigate to the specific lesson
      if (metadata.courseId && metadata.moduleId && metadata.videoId) {
        return { 
          url: `/course/${metadata.courseId}/module/${metadata.moduleId}/lesson/${metadata.videoId}`,
          isExternal: false 
        };
      }
      break;
      
    case 'course_update':
      // For course updates, navigate to the course overview
      if (metadata.courseId) {
        return { 
          url: `/course/${metadata.courseId}`, 
          isExternal: false 
        };
      }
      break;
      
    case 'system':
      // System notifications don't have a specific destination for now
      // Could be extended to go to dashboard, settings, etc.
      return { url: null, isExternal: false };
      
    default:
      break;
  }
  
  // Fallback: do nothing (no misleading redirects)
  return { url: null, isExternal: false };
};
