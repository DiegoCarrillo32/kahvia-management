import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDocs, writeBatch } from 'firebase/firestore';
import { createRoast, getRoasts, getRoastsByBean } from '../services/roastService';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
}));

const mockBatchCommit = vi.fn(() => Promise.resolve());
const mockBatchSet = vi.fn();
const mockBatchUpdate = vi.fn();

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  writeBatch: vi.fn(() => ({
    set: mockBatchSet,
    update: mockBatchUpdate,
    commit: mockBatchCommit,
  })),
}));

// Mock inventoryService used by roastService
vi.mock('../services/inventoryService', () => ({
  getInventory: vi.fn(() =>
    Promise.resolve([
      { id: 'bean-1', name: 'Caturra', amountGrams: 5000 },
      { id: 'bean-2', name: 'Bourbon', amountGrams: 3000 },
    ])
  ),
}));

describe('roastService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRoast', () => {
    it('should create a roast and deduct inventory via batch write', async () => {
      await createRoast({
        ingredients: [
          { beanId: 'bean-1', beanName: 'Caturra', gramsUsed: 1000 },
        ],
        inputWeightGrams: 1000,
        outputWeightGrams: 850,
        roastLevel: 'Medio',
        roastedAt: new Date(),
      });

      expect(writeBatch).toHaveBeenCalled();
      expect(mockBatchSet).toHaveBeenCalled();
      expect(mockBatchUpdate).toHaveBeenCalled();
      expect(mockBatchCommit).toHaveBeenCalled();
    });

    it('should calculate loss percentage correctly', async () => {
      await createRoast({
        ingredients: [
          { beanId: 'bean-1', beanName: 'Caturra', gramsUsed: 1000 },
        ],
        inputWeightGrams: 1000,
        outputWeightGrams: 850,
        roastLevel: 'Medio',
        roastedAt: new Date(),
      });

      // Verify the batch.set was called with lossPercentage = 15
      const setCall = mockBatchSet.mock.calls[0];
      expect(setCall[1].lossPercentage).toBe(15);
    });

    it('should handle blend roasts with multiple beans', async () => {
      await createRoast({
        ingredients: [
          { beanId: 'bean-1', beanName: 'Caturra', gramsUsed: 600 },
          { beanId: 'bean-2', beanName: 'Bourbon', gramsUsed: 400 },
        ],
        inputWeightGrams: 1000,
        outputWeightGrams: 830,
        roastLevel: 'Medio-Oscuro',
        roastedAt: new Date(),
      });

      // Should update both beans
      expect(mockBatchUpdate).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRoasts', () => {
    it('should return mapped roasts from Firestore', async () => {
      const mockDocs = [
        {
          id: 'roast-1',
          data: () => ({
            ingredients: [
              { beanId: 'bean-1', beanName: 'Caturra', gramsUsed: 1000 },
            ],
            inputWeightGrams: 1000,
            outputWeightGrams: 850,
            lossPercentage: 15,
            roastLevel: 'Medio',
            roastedAt: new Date(),
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockDocs } as never);

      const roasts = await getRoasts();
      expect(roasts).toHaveLength(1);
      expect(roasts[0].id).toBe('roast-1');
      expect(roasts[0].lossPercentage).toBe(15);
    });
  });

  describe('getRoastsByBean', () => {
    it('should filter roasts to only those containing the specified bean', async () => {
      const mockDocs = [
        {
          id: 'roast-1',
          data: () => ({
            ingredients: [
              { beanId: 'bean-1', beanName: 'Caturra', gramsUsed: 1000 },
            ],
            inputWeightGrams: 1000,
            outputWeightGrams: 850,
            lossPercentage: 15,
            roastLevel: 'Medio',
            roastedAt: new Date(),
          }),
        },
        {
          id: 'roast-2',
          data: () => ({
            ingredients: [
              { beanId: 'bean-2', beanName: 'Bourbon', gramsUsed: 500 },
            ],
            inputWeightGrams: 500,
            outputWeightGrams: 420,
            lossPercentage: 16,
            roastLevel: 'Claro',
            roastedAt: new Date(),
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockDocs } as never);

      const beanRoasts = await getRoastsByBean('bean-1');
      expect(beanRoasts).toHaveLength(1);
      expect(beanRoasts[0].id).toBe('roast-1');
    });
  });
});
