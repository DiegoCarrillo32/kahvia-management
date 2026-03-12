import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useInventory, useAddCoffeeBean } from '../hooks/useInventory';
import * as inventoryService from '../services/inventoryService';
import { createTestQueryClient, createWrapper } from '../test/query-wrapper';
import { CoffeeBean } from '../types/inventory';
import { QueryClient } from '@tanstack/react-query';

vi.mock('../services/inventoryService', () => ({
  getInventory: vi.fn(),
  addCoffeeBean: vi.fn(),
  updateCoffeeBean: vi.fn(),
  updateCoffeeBeanAmount: vi.fn(),
  deleteCoffeeBean: vi.fn(),
}));

describe('useInventory Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  it('should fetch inventory items', async () => {
    const mockBeans: CoffeeBean[] = [{ id: '1', name: 'Test Bean', amountGrams: 500 } as CoffeeBean];
    vi.mocked(inventoryService.getInventory).mockResolvedValueOnce(mockBeans);

    const { result } = renderHook(() => useInventory(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBeans);
  });

  it('should invalidate inventory query on addCoffeeBean success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    vi.mocked(inventoryService.addCoffeeBean).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAddCoffeeBean(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({ name: 'New Bean' } as unknown as CoffeeBean);

    expect(inventoryService.addCoffeeBean).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['inventory'] });
  });
});
