import { collection, doc, getDoc, getDocs, updateDoc, query, serverTimestamp, addDoc, deleteDoc, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { CoffeeBean } from '../types/inventory';

const COLLECTION_NAME = 'inventory';

export const getInventory = async (): Promise<CoffeeBean[]> => {
  if (!auth.currentUser) return [];
  const invRef = collection(db, COLLECTION_NAME);
  const q = query(invRef, where('userId', '==', auth.currentUser.uid));
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoffeeBean));
  all.sort((a, b) => a.name.localeCompare(b.name));
  return all;
};

export const addCoffeeBean = async (bean: Omit<CoffeeBean, 'id' | 'updatedAt' | 'createdAt' | 'userId'>) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  const invRef = collection(db, COLLECTION_NAME);
  await addDoc(invRef, {
    ...bean,
    userId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateCoffeeBean = async (id: string, data: Partial<Omit<CoffeeBean, 'id' | 'createdAt'>>) => {
  const beanRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(beanRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const updateCoffeeBeanAmount = async (id: string, newAmountGrams: number) => {
  const beanRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(beanRef, {
    amountGrams: newAmountGrams,
    updatedAt: serverTimestamp()
  });
};

export const deleteCoffeeBean = async (id: string) => {
  const beanRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(beanRef);
};

export const getCoffeeBean = async (id: string): Promise<CoffeeBean | null> => {
  const beanRef = doc(db, COLLECTION_NAME, id);
  const snap = await getDoc(beanRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as CoffeeBean;
  }
  return null;
};
