import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDocs } from 'firebase/firestore';
import { getInventory, addCoffeeBean } from '../services/inventoryService';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: { uid: 'test-user-id' } })),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-bean-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

describe('inventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInventory', () => {
    it('should return mapped beans from Firestore', async () => {
      const mockDocs = [
        {
          id: 'bean-1',
          data: () => ({
            name: 'Caturra',
            origin: 'Tarrazú',
            roastProfile: 'Medio',
            amountGrams: 5000,
            costPerKg: 12000,
          }),
        },
        {
          id: 'bean-2',
          data: () => ({
            name: 'Bourbon',
            origin: 'West Valley',
            roastProfile: 'Claro',
            amountGrams: 800,
            costPerKg: 15000,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockDocs } as never);

      const beans = await getInventory();

      expect(beans).toHaveLength(2);
      expect(beans[1].id).toBe('bean-1');
      expect(beans[1].name).toBe('Caturra');
      expect(beans[0].amountGrams).toBe(800);
    });

    it('should return empty array when no beans', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as never);

      const beans = await getInventory();
      expect(beans).toHaveLength(0);
    });
  });

  describe('addCoffeeBean', () => {
    it('should call addDoc with bean data and timestamps', async () => {
      const { addDoc } = await import('firebase/firestore');

      await addCoffeeBean({
        name: 'Gesha',
        origin: 'Chirripó',
        roastProfile: 'Claro',
        amountGrams: 2000,
        costPerKg: 25000,
      });

      expect(addDoc).toHaveBeenCalled();
    });
  });
});
