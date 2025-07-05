// src/features/notifications/components/NotificationDropdown.tsx
import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { NotificationIcon } from './NotificationIcon';
import { NotificationList } from './NotificationList';
import { useMarkAllAsRead, useUnreadCount } from '../hooks';

interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown = ({ className = '' }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const markAllAsReadMutation = useMarkAllAsRead();
  const { data: unreadData } = useUnreadCount();
  
  const unreadCount = unreadData?.count || 0;

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    // You can add navigation logic here if needed
    // For example, navigate to the course or video page
    console.log('Notification clicked:', notificationId);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
          <NotificationIcon
            onClick={() => setIsOpen(!isOpen)}
            className={className}
          />
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification List */}
        <NotificationList onNotificationClick={handleNotificationClick} />
      </PopoverContent>
    </Popover>
  );
};
