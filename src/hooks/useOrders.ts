import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as orderService from '../services/orderService';
import { Order, OrderStatus } from '../types/order';

export const useOrders = (statusFilter?: OrderStatus) => {
  return useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () => orderService.getOrders(statusFilter),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useMarkOrderAsRoasted = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderService.markOrderAsRoasted,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useMarkOrderAsDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderService.markOrderAsDelivered,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: Partial<Omit<Order, 'id' | 'createdAt'>> }) => 
      orderService.updateOrder(orderId, data),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderService.deleteOrder,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: !!orderId,
  });
};
