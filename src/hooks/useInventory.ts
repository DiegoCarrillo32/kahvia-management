import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as inventoryService from '../services/inventoryService';
import { CoffeeBean } from '../types/inventory';

export const useInventory = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getInventory,
  });
};

export const useAddCoffeeBean = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.addCoffeeBean,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useUpdateCoffeeBean = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<CoffeeBean, 'id' | 'createdAt'>> }) => 
      inventoryService.updateCoffeeBean(id, data),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useUpdateCoffeeBeanAmount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newAmountGrams }: { id: string; newAmountGrams: number }) => 
      inventoryService.updateCoffeeBeanAmount(id, newAmountGrams),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useDeleteCoffeeBean = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.deleteCoffeeBean,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
