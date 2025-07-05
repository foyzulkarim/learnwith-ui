// src/features/notifications/components/NotificationIcon.tsx
import { Bell } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useUnreadCount } from '../hooks';

interface NotificationIconProps {
  onClick: () => void;
  className?: string;
}

export const NotificationIcon = ({ onClick, className = '' }: NotificationIconProps) => {
  const { data: unreadData, isLoading } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={`relative ${className}`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};
