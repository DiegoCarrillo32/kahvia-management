import { collection, doc, getDocs, updateDoc, addDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
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
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

  if (statusFilter) {
    return all.filter(order => order.status === statusFilter);
  }
  return all;
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

export const updateOrder = async (orderId: string, data: Partial<Omit<Order, 'id' | 'createdAt'>>) => {
  const orderRef = doc(db, COLLECTION_NAME, orderId);
  await updateDoc(orderRef, data);
};

export const deleteOrder = async (orderId: string) => {
  const orderRef = doc(db, COLLECTION_NAME, orderId);
  await deleteDoc(orderRef);
};
