export type CoffeeStyle = 'Grano Entero' | 'Molido' | 'Espresso' | 'Prensa Francesa' | 'Filtro';
export type CoffeeAmount = '250g' | '500g' | '1kg';
export type OrderStatus = 'Pendiente' | 'Tostado' | 'Entregado';

export interface Order {
  id?: string;
  userId: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  deliveryAddress: string;
  locationCoords?: { latitude: number; longitude: number };
  orderPrice: number;
  coffeeStyle: CoffeeStyle;
  amount: CoffeeAmount;
  notes: string;
  status: OrderStatus;
  createdAt: unknown;
  roastedAt?: unknown;
  deliveredAt?: unknown;
  paid: boolean;
}
