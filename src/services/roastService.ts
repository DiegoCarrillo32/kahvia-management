import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  serverTimestamp,
  writeBatch,
  where
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Roast } from '../types/roast';
import { getInventory } from './inventoryService';

const COLLECTION_NAME = 'roasts';

export const createRoast = async (
  roast: Omit<Roast, 'id' | 'createdAt' | 'lossPercentage' | 'userId'>
) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  // Calculate loss percentage
  const lossPercentage =
    roast.inputWeightGrams > 0
      ? Math.round(
          ((roast.inputWeightGrams - roast.outputWeightGrams) /
            roast.inputWeightGrams) *
            10000
        ) / 100
      : 0;

  // Fetch current inventory to compute new amounts
  const beans = await getInventory();
  const beansMap = new Map<string, number>();
  beans.forEach((b) => beansMap.set(b.id!, b.amountGrams));

  const batch = writeBatch(db);

  // Create roast document — filter undefined values (Firestore rejects them)
  const roastRef = doc(collection(db, COLLECTION_NAME));
  const roastData = Object.fromEntries(
    Object.entries({
      ...roast,
      userId: auth.currentUser.uid,
      lossPercentage,
      createdAt: serverTimestamp(),
    }).filter(([, v]) => v !== undefined)
  );
  batch.set(roastRef, roastData);

  // Deduct each ingredient from inventory
  for (const ingredient of roast.ingredients) {
    const currentAmount = beansMap.get(ingredient.beanId) || 0;
    const newAmount = Math.max(0, currentAmount - ingredient.gramsUsed);
    const beanRef = doc(db, 'inventory', ingredient.beanId);
    batch.update(beanRef, {
      amountGrams: newAmount,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
};

export const getRoasts = async (): Promise<Roast[]> => {
  if (!auth.currentUser) return [];
  const roastsRef = collection(db, COLLECTION_NAME);
  const q = query(roastsRef, where('userId', '==', auth.currentUser.uid));
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Roast));
  all.sort((a, b) => {
    const timeA = (a.roastedAt as { toMillis?: () => number })?.toMillis?.() || 0;
    const timeB = (b.roastedAt as { toMillis?: () => number })?.toMillis?.() || 0;
    return timeB - timeA;
  });
  return all;
};

export const getRoastsByBean = async (beanId: string): Promise<Roast[]> => {
  const all = await getRoasts();
  return all.filter((roast) =>
    roast.ingredients.some((ing) => ing.beanId === beanId)
  );
};

export const getRoastsByOrder = async (orderId: string): Promise<Roast[]> => {
  const all = await getRoasts();
  return all.filter((roast) => roast.orderId === orderId);
};

export const deleteRoast = async (roastId: string) => {
  const roastRef = doc(db, COLLECTION_NAME, roastId);
  await deleteDoc(roastRef);
};

export const getRoast = async (roastId: string): Promise<Roast | null> => {
  const roastRef = doc(db, COLLECTION_NAME, roastId);
  const snap = await getDoc(roastRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as Roast;
  }
  return null;
};
