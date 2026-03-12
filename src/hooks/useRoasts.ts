import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as roastService from '../services/roastService';

export const useRoasts = () => {
  return useQuery({
    queryKey: ['roasts'],
    queryFn: roastService.getRoasts,
  });
};

export const useCreateRoast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roastService.createRoast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roasts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useDeleteRoast = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roastService.deleteRoast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roasts'] });
    },
  });
};

export const useRoastsByBean = (beanId: string) => {
  return useQuery({
    queryKey: ['roasts', 'byBean', beanId],
    queryFn: () => roastService.getRoastsByBean(beanId),
    enabled: !!beanId,
  });
};

export const useRoastsByOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['roasts', 'byOrder', orderId],
    queryFn: () => roastService.getRoastsByOrder(orderId),
    enabled: !!orderId,
  });
};
