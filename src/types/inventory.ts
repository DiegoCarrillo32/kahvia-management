export interface CoffeeBean {
  id?: string;
  name: string;
  origin: string;
  roastProfile: string;
  amountGrams: number;
  costPerKg?: number;
  boughtAt?: string;
  notes?: string;
  avgDensity?: number;
  avgHumidity?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}
