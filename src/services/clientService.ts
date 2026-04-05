import { collection, doc, getDoc, getDocs, updateDoc, serverTimestamp, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Client } from '../types/client';

const COLLECTION_NAME = 'clients';

export const getClients = async (): Promise<Client[]> => {
  if (!auth.currentUser) return [];
  const clientsRef = collection(db, COLLECTION_NAME);
  const q = query(clientsRef, where('userId', '==', auth.currentUser.uid));
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  
  // Client-side sort to avoid composite index requirement
  all.sort((a, b) => {
    const timeA = (a.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
    const timeB = (b.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
    return timeB - timeA;
  });
  
  return all;
};

export const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'userId'>) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  const clientsRef = collection(db, COLLECTION_NAME);
  await addDoc(clientsRef, {
    ...client,
    userId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  });
};

export const updateClient = async (id: string, data: Partial<Omit<Client, 'id' | 'createdAt' | 'userId'>>) => {
  const clientRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(clientRef, data);
};

export const deleteClient = async (id: string) => {
  const clientRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(clientRef);
};

export const getClient = async (id: string): Promise<Client | null> => {
  const clientRef = doc(db, COLLECTION_NAME, id);
  const snap = await getDoc(clientRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as Client;
  }
  return null;
};
