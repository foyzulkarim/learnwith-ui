// src/features/notifications/hooks/useUnreadCount.ts
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};
