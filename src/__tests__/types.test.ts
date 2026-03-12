import { describe, it, expect } from 'vitest';
import { Roast, RoastIngredient } from '../types/roast';
import { CoffeeBean } from '../types/inventory';
import { Order, OrderStatus } from '../types/order';

describe('Type Definitions', () => {
  describe('CoffeeBean', () => {
    it('should allow creating a bean with all fields', () => {
      const bean: CoffeeBean = {
        id: 'bean-1',
        name: 'Caturra',
        origin: 'Tarrazú',
        roastProfile: 'Medio',
        amountGrams: 5000,
        costPerKg: 12000,
        boughtAt: '2025-03-01',
        notes: 'High quality',
        avgDensity: 680,
        avgHumidity: 11.5,
      };

      expect(bean.name).toBe('Caturra');
      expect(bean.costPerKg).toBe(12000);
      expect(bean.avgDensity).toBe(680);
    });

    it('should allow creating a bean with only required fields', () => {
      const bean: CoffeeBean = {
        name: 'Test',
        origin: 'Test',
        roastProfile: 'Claro',
        amountGrams: 100,
      };

      expect(bean.costPerKg).toBeUndefined();
      expect(bean.notes).toBeUndefined();
    });
  });

  describe('Roast', () => {
    it('should support single bean roast', () => {
      const ingredient: RoastIngredient = {
        beanId: 'bean-1',
        beanName: 'Caturra',
        gramsUsed: 1000,
      };

      const roast: Roast = {
        id: 'roast-1',
        ingredients: [ingredient],
        inputWeightGrams: 1000,
        outputWeightGrams: 850,
        lossPercentage: 15,
        roastLevel: 'Medio',
        roastedAt: new Date(),
      };

      expect(roast.ingredients).toHaveLength(1);
      expect(roast.lossPercentage).toBe(15);
    });

    it('should support blend roast with multiple beans', () => {
      const roast: Roast = {
        ingredients: [
          { beanId: 'b1', beanName: 'Caturra', gramsUsed: 600 },
          { beanId: 'b2', beanName: 'Bourbon', gramsUsed: 400 },
        ],
        inputWeightGrams: 1000,
        outputWeightGrams: 840,
        lossPercentage: 16,
        roastLevel: 'Medio-Oscuro',
        durationMinutes: 12,
        temperatureCelsius: 210,
        roasterName: 'Diego',
        notes: 'Great blend',
        roastedAt: new Date(),
        orderId: 'order-1',
        orderClientName: 'Juan',
      };

      expect(roast.ingredients).toHaveLength(2);
      expect(roast.roasterName).toBe('Diego');
      expect(roast.orderId).toBe('order-1');
      expect(roast.orderClientName).toBe('Juan');
    });

    it('should allow roast without order association', () => {
      const roast: Roast = {
        ingredients: [{ beanId: 'b1', beanName: 'Caturra', gramsUsed: 500 }],
        inputWeightGrams: 500,
        outputWeightGrams: 420,
        lossPercentage: 16,
        roastLevel: 'Claro',
        roastedAt: new Date(),
      };

      expect(roast.orderId).toBeUndefined();
      expect(roast.orderClientName).toBeUndefined();
    });
  });

  describe('Order', () => {
    it('should define valid order statuses', () => {
      const statuses: OrderStatus[] = ['Pendiente', 'Tostado', 'Entregado'];
      expect(statuses).toHaveLength(3);
    });

    it('should allow creating an order with all fields', () => {
      const order: Order = {
        id: 'order-1',
        clientName: 'Juan',
        clientPhone: '50612345678',
        deliveryAddress: 'San José Centro',
        coffeeStyle: 'Grano Entero',
        amount: '250g',
        orderPrice: 5000,
        paid: true,
        status: 'Pendiente',
        notes: '',
        createdAt: new Date(),
      };

      expect(order.clientName).toBe('Juan');
      expect(order.orderPrice).toBe(5000);
    });
  });
});

describe('Business Logic', () => {
  it('should correctly calculate loss percentage', () => {
    const input = 1000;
    const output = 850;
    const loss =
      Math.round(((input - output) / input) * 10000) / 100;
    expect(loss).toBe(15);
  });

  it('should handle zero input weight', () => {
    const input = 0;
    const output = 0;
    const loss = input > 0
      ? Math.round(((input - output) / input) * 10000) / 100
      : 0;
    expect(loss).toBe(0);
  });

  it('should correctly sum blend ingredient weights', () => {
    const ingredients: RoastIngredient[] = [
      { beanId: 'b1', beanName: 'A', gramsUsed: 600 },
      { beanId: 'b2', beanName: 'B', gramsUsed: 400 },
      { beanId: 'b3', beanName: 'C', gramsUsed: 200 },
    ];

    const totalInput = ingredients.reduce((sum, i) => sum + i.gramsUsed, 0);
    expect(totalInput).toBe(1200);
  });

  it('should calculate blend percentages correctly', () => {
    const ingredients: RoastIngredient[] = [
      { beanId: 'b1', beanName: 'A', gramsUsed: 600 },
      { beanId: 'b2', beanName: 'B', gramsUsed: 400 },
    ];

    const total = ingredients.reduce((s, i) => s + i.gramsUsed, 0);
    const pctA = Math.round((ingredients[0].gramsUsed / total) * 100);
    const pctB = Math.round((ingredients[1].gramsUsed / total) * 100);

    expect(pctA).toBe(60);
    expect(pctB).toBe(40);
  });

  it('should deduct inventory correctly after roast', () => {
    const currentAmount = 5000;
    const gramsUsed = 1000;
    const newAmount = Math.max(0, currentAmount - gramsUsed);
    expect(newAmount).toBe(4000);
  });

  it('should not go negative when deducting more than available', () => {
    const currentAmount = 500;
    const gramsUsed = 1000;
    const newAmount = Math.max(0, currentAmount - gramsUsed);
    expect(newAmount).toBe(0);
  });
});
