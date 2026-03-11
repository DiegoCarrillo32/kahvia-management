import { collection, doc, getDocs, updateDoc, addDoc, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types/order';

const COLLECTION_NAME = 'orders';

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'roastedAt' | 'deliveredAt' | 'status'>) => {
  const ordersRef = collection(db, COLLECTION_NAME);
  await addDoc(ordersRef, {
    ...order,
    status: 'Pendiente',
    createdAt: serverTimestamp(),
  });
};

export const getOrders = async (statusFilter?: OrderStatus): Promise<Order[]> => {
  const ordersRef = collection(db, COLLECTION_NAME);
  
  let q;
  if (statusFilter) {
    q = query(ordersRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
  } else {
    q = query(ordersRef, orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const markOrderAsRoasted = async (orderId: string) => {
  const orderRef = doc(db, COLLECTION_NAME, orderId);
  await updateDoc(orderRef, {
    status: 'Tostado',
    roastedAt: serverTimestamp()
  });
};

export const markOrderAsDelivered = async (orderId: string) => {
  const orderRef = doc(db, COLLECTION_NAME, orderId);
  await updateDoc(orderRef, {
    status: 'Entregado',
    deliveredAt: serverTimestamp()
  });
};
