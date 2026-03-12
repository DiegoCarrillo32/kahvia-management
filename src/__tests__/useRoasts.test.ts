import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRoasts, useCreateRoast } from '../hooks/useRoasts';
import * as roastService from '../services/roastService';
import { createTestQueryClient, createWrapper } from '../test/query-wrapper';
import { Roast } from '../types/roast';
import { QueryClient } from '@tanstack/react-query';

vi.mock('../services/roastService', () => ({
  getRoasts: vi.fn(),
  createRoast: vi.fn(),
  deleteRoast: vi.fn(),
  getRoastsByBean: vi.fn(),
  getRoastsByOrder: vi.fn(),
}));

describe('useRoasts Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  it('should fetch roasts', async () => {
    const mockRoasts: Roast[] = [{ id: '1', roastLevel: 'Medio' } as Roast];
    vi.mocked(roastService.getRoasts).mockResolvedValueOnce(mockRoasts);

    const { result } = renderHook(() => useRoasts(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRoasts);
  });

  it('should invalidate roasts AND inventory on createRoast success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    vi.mocked(roastService.createRoast).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useCreateRoast(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({ roastLevel: 'Oscuro' } as unknown as Roast);

    expect(roastService.createRoast).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['roasts'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['inventory'] });
  });
});
