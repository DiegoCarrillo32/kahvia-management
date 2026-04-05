import { collection, doc, getDocs, setDoc, updateDoc, query, where, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { B2BRequest, B2BRequestStatus, B2BRequestType } from '../types/partnership';
import { getUserProfile } from './userService';

const COLLECTION_NAME = 'requests';

export const sendB2BRequest = async (
  partnershipId: string, 
  receiverId: string, 
  receiverBusinessName: string, 
  type: B2BRequestType | string, 
  message: string
) => {
  if (!auth.currentUser) throw new Error("No authentication");

  const senderProfile = await getUserProfile(auth.currentUser.uid);
  if (!senderProfile) throw new Error("Sender profile not found");

  const requestRef = doc(collection(db, COLLECTION_NAME));
  
  const newRequest: B2BRequest = {
    partnershipId,
    senderId: auth.currentUser.uid,
    senderBusinessName: senderProfile.businessName,
    receiverId,
    receiverBusinessName,
    type,
    message,
    status: 'pending',
    updates: [{
      status: 'pending',
      message: 'Solicitud enviada.',
      timestamp: new Date().toISOString(),
      updatedBy: auth.currentUser.uid
    }]
  };

  await setDoc(requestRef, {
    ...newRequest,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getB2BRequests = async (): Promise<B2BRequest[]> => {
  if (!auth.currentUser) return [];

  const uid = auth.currentUser.uid;
  const q1 = query(collection(db, COLLECTION_NAME), where('senderId', '==', uid));
  const q2 = query(collection(db, COLLECTION_NAME), where('receiverId', '==', uid));

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  
  const results = new Map<string, B2BRequest>();
  
  snap1.docs.forEach(d => {
    results.set(d.id, { id: d.id, ...d.data() } as B2BRequest);
  });
  
  snap2.docs.forEach(d => {
    results.set(d.id, { id: d.id, ...d.data() } as B2BRequest);
  });

  return Array.from(results.values()).sort((a,b) => {
    const timeA = (a.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
    const timeB = (b.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
    return timeB - timeA;
  });
};

export const addRequestUpdate = async (
  requestId: string,
  newStatus: B2BRequestStatus,
  updateMessage: string
) => {
  if (!auth.currentUser) return;

  const ref = doc(db, COLLECTION_NAME, requestId);
  const updateObj = {
    status: newStatus,
    message: updateMessage,
    timestamp: new Date().toISOString(),
    updatedBy: auth.currentUser.uid
  };

  await updateDoc(ref, {
    status: newStatus,
    updates: arrayUnion(updateObj),
    updatedAt: serverTimestamp()
  });
};
