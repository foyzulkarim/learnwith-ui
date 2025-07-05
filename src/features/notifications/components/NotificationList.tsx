// src/features/notifications/components/NotificationList.tsx
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '../hooks';

interface NotificationListProps {
  onNotificationClick?: (notificationId: string) => void;
}

export const NotificationList = ({ onNotificationClick }: NotificationListProps) => {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, error, isFetching } = useNotifications(page, limit);

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-sm text-gray-500">Loading notifications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-red-500">Failed to load notifications</p>
      </div>
    );
  }

  if (!data || data.notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5-5-5h5v-12h0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">No notifications yet</p>
        <p className="text-xs text-gray-400 mt-1">You'll see new updates here</p>
      </div>
    );
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="w-full">
      <ScrollArea className="h-[400px]">
        <div className="divide-y divide-gray-100">
          {data.notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onClick={() => onNotificationClick?.(notification._id)}
            />
          ))}
        </div>
      </ScrollArea>
      
      {data.hasMore && (
        <div className="p-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadMore}
            disabled={isFetching}
            className="w-full"
          >
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
