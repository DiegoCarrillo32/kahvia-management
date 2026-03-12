export type RoastLevel = 'Claro' | 'Medio' | 'Medio-Oscuro' | 'Oscuro';

export interface RoastIngredient {
  beanId: string;
  beanName: string;
  gramsUsed: number;
}

export interface Roast {
  id?: string;
  orderId?: string;
  orderClientName?: string;
  ingredients: RoastIngredient[];
  inputWeightGrams: number;
  outputWeightGrams: number;
  lossPercentage: number;
  roastLevel: RoastLevel;
  durationMinutes?: number;
  temperatureCelsius?: number;
  roasterName?: string;
  notes?: string;
  roastedAt: unknown;
  createdAt?: unknown;
}
