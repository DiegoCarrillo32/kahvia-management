import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDocs, getDoc } from 'firebase/firestore';
import { getOrders, createOrder, getOrder } from '../services/orderService';

// Setup firebase mocks
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-order-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should return mapped orders from Firestore', async () => {
      const mockDocs = [
        {
          id: 'order-1',
          data: () => ({
            clientName: 'Juan',
            clientPhone: '50612345678',
            coffeeStyle: 'Especial',
            amount: '250g',
            orderPrice: 5000,
            paid: true,
            status: 'Pendiente',
            createdAt: new Date(),
          }),
        },
        {
          id: 'order-2',
          data: () => ({
            clientName: 'Maria',
            clientPhone: '50687654321',
            coffeeStyle: 'Medio',
            amount: '500g',
            orderPrice: 8000,
            paid: false,
            status: 'Tostado',
            createdAt: new Date(),
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockDocs,
      } as never);

      const orders = await getOrders();

      expect(orders).toHaveLength(2);
      expect(orders[0].id).toBe('order-1');
      expect(orders[0].clientName).toBe('Juan');
      expect(orders[1].id).toBe('order-2');
      expect(orders[1].paid).toBe(false);
    });

    it('should return empty array when no orders exist', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
      } as never);

      const orders = await getOrders();
      expect(orders).toHaveLength(0);
    });

    it('should filter orders by status when provided', async () => {
      const mockDocs = [
        {
          id: '1',
          data: () => ({
            clientName: 'A',
            status: 'Pendiente',
            createdAt: new Date(),
          }),
        },
        {
          id: '2',
          data: () => ({
            clientName: 'B',
            status: 'Tostado',
            createdAt: new Date(),
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockDocs,
      } as never);

      const orders = await getOrders('Pendiente');
      expect(orders).toHaveLength(1);
      expect(orders[0].status).toBe('Pendiente');
    });
  });

  describe('getOrder', () => {
    it('should return a single order when it exists', async () => {
      const mockSnap = {
        exists: () => true,
        id: '123',
        data: () => ({ clientName: 'Test' })
      };
      
      vi.mocked(getDoc).mockResolvedValueOnce(mockSnap as never);

      const order = await getOrder('123');
      expect(order).toEqual({ id: '123', clientName: 'Test' });
    });

    it('should return null when order does not exist', async () => {
      const mockSnap = {
        exists: () => false,
      };
      
      vi.mocked(getDoc).mockResolvedValueOnce(mockSnap as never);

      const order = await getOrder('123');
      expect(order).toBeNull();
    });
  });

  describe('createOrder', () => {
    it('should call addDoc with order data', async () => {
      const { addDoc } = await import('firebase/firestore');

      await createOrder({
        clientName: 'Test',
        clientPhone: '50611111111',
        coffeeStyle: 'Grano Entero',
        amount: '1kg',
        orderPrice: 15000,
        paid: false,
        deliveryAddress: 'San José',
        notes: '',
      });

      expect(addDoc).toHaveBeenCalled();
    });
  });
});
