// src/features/notifications/components/NotificationItem.tsx
import { formatDistanceToNow } from 'date-fns';
import { Video, BookOpen, Info, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';
import { Notification } from '../types';
import { useMarkAsRead } from '../hooks';
import { getNotificationUrl } from '../utils/getNotificationUrl';
import { cn } from '../../../lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'new_video':
      return <Video className="h-4 w-4 text-blue-500" />;
    case 'course_update':
      return <BookOpen className="h-4 w-4 text-green-500" />;
    case 'system':
      return <Info className="h-4 w-4 text-gray-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

export const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const [, navigate] = useLocation();
  const markAsReadMutation = useMarkAsRead();

  const handleClick = () => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    
    // Handle navigation
    const { url, isExternal } = getNotificationUrl(notification);
    
    if (url) {
      if (isExternal) {
        // Open external links in new tab
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // Navigate to internal routes
        navigate(url);
      }
    }
    // If url is null, do nothing (no misleading redirects)
    
    // Call optional onClick handler (e.g., to close dropdown)
    onClick?.();
  };

  const { url, isExternal } = getNotificationUrl(notification);
  console.log(url)
  const isClickable = url !== null;
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors',
        !notification.isRead && 'bg-blue-50 border-l-2 border-l-blue-500',
        isClickable && 'cursor-pointer'
      )}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            'text-sm font-medium text-gray-900 truncate',
            !notification.isRead && 'font-semibold'
          )}>
            {notification.title}
          </h4>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* External link indicator */}
            {isExternal && (
              <ExternalLink className="h-3 w-3 text-gray-400" />
            )}
            {/* Unread indicator */}
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {notification.message}
        </p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {timeAgo}
          </span>
          
          {notification.metadata?.courseName && (
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {notification.metadata.courseName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
