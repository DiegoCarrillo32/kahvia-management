import { collection, doc, getDocs, updateDoc, query, orderBy, serverTimestamp, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CoffeeBean } from '../types/inventory';

const COLLECTION_NAME = 'inventory';

export const getInventory = async (): Promise<CoffeeBean[]> => {
  const invRef = collection(db, COLLECTION_NAME);
  const q = query(invRef, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoffeeBean));
};

export const addCoffeeBean = async (bean: Omit<CoffeeBean, 'id' | 'updatedAt'>) => {
  const invRef = collection(db, COLLECTION_NAME);
  await addDoc(invRef, {
    ...bean,
    updatedAt: serverTimestamp()
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
