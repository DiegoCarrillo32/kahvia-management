import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types/user';

const COLLECTION_NAME = 'users';

const generateRandomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, COLLECTION_NAME, uid);
  const snap = await getDoc(userRef);
  
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as UserProfile;
  }
  
  return null;
};

export const createUserProfile = async (uid: string, profile: Omit<UserProfile, 'id' | 'createdAt'>) => {
  const userRef = doc(db, COLLECTION_NAME, uid);
  await setDoc(userRef, {
    ...profile,
    inviteCode: profile.inviteCode || generateRandomCode(),
    createdAt: serverTimestamp(),
  });
};

export const ensureInviteCode = async (uid: string, currentProfile: UserProfile): Promise<string> => {
  if (currentProfile.inviteCode) return currentProfile.inviteCode;
  
  const newCode = generateRandomCode();
  const userRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(userRef, { inviteCode: newCode });
  return newCode;
};

export const getUserByInviteCode = async (inviteCode: string): Promise<UserProfile | null> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('inviteCode', '==', inviteCode.toUpperCase())
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as UserProfile;
};
