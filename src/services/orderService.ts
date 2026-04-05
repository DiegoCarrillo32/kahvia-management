import { collection, doc, getDoc, getDocs, updateDoc, addDoc, deleteDoc, query, serverTimestamp, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Order, OrderStatus } from '../types/order';

const COLLECTION_NAME = 'orders';

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'roastedAt' | 'deliveredAt' | 'status' | 'userId'>) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  const ordersRef = collection(db, COLLECTION_NAME);
  await addDoc(ordersRef, {
    ...order,
    userId: auth.currentUser.uid,
    status: 'Pendiente',
    createdAt: serverTimestamp(),
  });
};

export const getOrders = async (statusFilter?: OrderStatus): Promise<Order[]> => {
  if (!auth.currentUser) return [];
  const ordersRef = collection(db, COLLECTION_NAME);
  const q = query(ordersRef, where('userId', '==', auth.currentUser.uid));
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

  all.sort((a, b) => {
    const timeA = (a.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
    const timeB = (b.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
    return timeB - timeA;
  });

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

export const getOrder = async (orderId: string): Promise<Order | null> => {
  const orderRef = doc(db, COLLECTION_NAME, orderId);
  const snap = await getDoc(orderRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as Order;
  }
  return null;
};

export const getOrdersByClient = async (clientId: string): Promise<Order[]> => {
  if (!auth.currentUser) return [];
  const ordersRef = collection(db, COLLECTION_NAME);
  const q = query(ordersRef, where('userId', '==', auth.currentUser.uid), where('clientId', '==', clientId));
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

  all.sort((a, b) => {
    const timeA = (a.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
    const timeB = (b.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
    return timeB - timeA;
  });

  return all;
};
