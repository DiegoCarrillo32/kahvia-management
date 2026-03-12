import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrders, useCreateOrder } from '../hooks/useOrders';
import * as orderService from '../services/orderService';
import { createTestQueryClient, createWrapper } from '../test/query-wrapper';
import { Order } from '../types/order';
import { QueryClient } from '@tanstack/react-query';

vi.mock('../services/orderService', () => ({
  getOrders: vi.fn(),
  createOrder: vi.fn(),
  markOrderAsRoasted: vi.fn(),
  markOrderAsDelivered: vi.fn(),
  updateOrder: vi.fn(),
  deleteOrder: vi.fn(),
}));

describe('useOrders Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  it('should fetch orders successfully', async () => {
    const mockOrders: Order[] = [{ id: '1', clientName: 'Test Client' } as Order];
    vi.mocked(orderService.getOrders).mockResolvedValueOnce(mockOrders);

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockOrders);
  });

  it('should invalidate queries on createOrder success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    vi.mocked(orderService.createOrder).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({ clientName: 'New Order' } as unknown as Order);

    expect(orderService.createOrder).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['orders'] });
  });
});
