import { collection, doc, getDocs, setDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Partnership } from '../types/partnership';
import { getUserByInviteCode, getUserProfile } from './userService';

const COLLECTION_NAME = 'partnerships';

export const requestPartnership = async (inviteCode: string) => {
  if (!auth.currentUser) throw new Error("No authentication");

  const requesterProfile = await getUserProfile(auth.currentUser.uid);
  if (!requesterProfile) throw new Error("Requester profile not found");

  const receiverProfile = await getUserByInviteCode(inviteCode);
  if (!receiverProfile) throw new Error("Código de invitación inválido o usuario no encontrado");

  if (receiverProfile.id === auth.currentUser.uid) {
    throw new Error("No puedes enviarte una solicitud a ti mismo");
  }

  // Check if partnership already exists
  const q1 = query(collection(db, COLLECTION_NAME), 
    where('requesterId', '==', auth.currentUser.uid), 
    where('receiverId', '==', receiverProfile.id)
  );
  const q2 = query(collection(db, COLLECTION_NAME), 
    where('requesterId', '==', receiverProfile.id), 
    where('receiverId', '==', auth.currentUser.uid)
  );
  
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  if (!snap1.empty || !snap2.empty) {
    throw new Error("Ya existe una relación con este socio");
  }

  const partnershipRef = doc(collection(db, COLLECTION_NAME));
  const newPartnership: Partnership = {
    requesterId: auth.currentUser.uid,
    requesterBusinessName: requesterProfile.businessName,
    receiverId: receiverProfile.id,
    receiverBusinessName: receiverProfile.businessName,
    status: 'pending',
  };

  await setDoc(partnershipRef, {
    ...newPartnership,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getPartnerships = async (): Promise<Partnership[]> => {
  if (!auth.currentUser) return [];

  const uid = auth.currentUser.uid;
  const q1 = query(collection(db, COLLECTION_NAME), where('requesterId', '==', uid));
  const q2 = query(collection(db, COLLECTION_NAME), where('receiverId', '==', uid));

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  
  const results = new Map<string, Partnership>();
  
  snap1.docs.forEach(d => {
    results.set(d.id, { id: d.id, ...d.data() } as Partnership);
  });
  
  snap2.docs.forEach(d => {
    results.set(d.id, { id: d.id, ...d.data() } as Partnership);
  });

  return Array.from(results.values());
};

export const acceptPartnership = async (partnershipId: string) => {
  const ref = doc(db, COLLECTION_NAME, partnershipId);
  await updateDoc(ref, {
    status: 'active',
    updatedAt: serverTimestamp()
  });
};

export const rejectPartnership = async (partnershipId: string) => {
  const ref = doc(db, COLLECTION_NAME, partnershipId);
  await updateDoc(ref, {
    status: 'rejected',
    updatedAt: serverTimestamp()
  });
};
