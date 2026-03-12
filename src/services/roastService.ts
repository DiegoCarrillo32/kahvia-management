import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Roast } from '../types/roast';
import { getInventory } from './inventoryService';

const COLLECTION_NAME = 'roasts';

export const createRoast = async (
  roast: Omit<Roast, 'id' | 'createdAt' | 'lossPercentage'>
) => {
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

  // Create roast document
  const roastRef = doc(collection(db, COLLECTION_NAME));
  batch.set(roastRef, {
    ...roast,
    lossPercentage,
    createdAt: serverTimestamp(),
  });

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
  const roastsRef = collection(db, COLLECTION_NAME);
  const q = query(roastsRef, orderBy('roastedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Roast));
};

export const getRoastsByBean = async (beanId: string): Promise<Roast[]> => {
  const all = await getRoasts();
  return all.filter((roast) =>
    roast.ingredients.some((ing) => ing.beanId === beanId)
  );
};

export const deleteRoast = async (roastId: string) => {
  const roastRef = doc(db, COLLECTION_NAME, roastId);
  await deleteDoc(roastRef);
};
