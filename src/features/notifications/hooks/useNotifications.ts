// src/features/notifications/hooks/useNotifications.ts
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

export const useNotifications = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => notificationService.getNotifications(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
