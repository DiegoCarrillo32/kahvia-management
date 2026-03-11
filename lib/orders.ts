import { collection, addDoc, getDocs, updateDoc, doc, getDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { firestore } from './firebase';

export type OrderStatus = 'pending' | 'roasted' | 'delivered';
export type CoffeeStyle = 'light' | 'medium' | 'dark';
export type CoffeeAmount = '250g' | '500g' | '1kg';

export interface Order {
  id?: string;
  clientName: string;
  clientPhone: string;
  deliveryAddress: string;
  locationCoords?: { latitude: number; longitude: number };
  orderPrice: number;
  coffeeStyle: CoffeeStyle;
  amount: CoffeeAmount;
  notes: string;
  status: OrderStatus;
  createdAt: any;
  roastedAt?: any;
  deliveredAt?: any;
  paid: boolean;
}

const ordersRef = collection(firestore, 'orders');

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'paid'>) => {
  const newOrder = {
    ...order,
    createdAt: serverTimestamp(),
    status: 'pending' as OrderStatus,
    paid: false
  };
  return await addDoc(ordersRef, newOrder);
};

export const getOrders = async () => {
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Order[];
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
     const orderDoc = doc(firestore, 'orders', id);
     const updateData: any = { status };
     
     if (status === 'roasted') {
         updateData.roastedAt = serverTimestamp();
     } else if (status === 'delivered') {
         updateData.deliveredAt = serverTimestamp();
     }

     return await updateDoc(orderDoc, updateData);
};

export const getOrderById = async (id: string) => {
  const orderDoc = doc(firestore, 'orders', id);
  const docSnap = await getDoc(orderDoc);
  if(docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
  }
  return null;
}
