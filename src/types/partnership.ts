export type PartnershipStatus = 'pending' | 'active' | 'rejected';

export interface Partnership {
  id?: string;
  requesterId: string;
  requesterBusinessName: string;
  receiverId: string;
  receiverBusinessName: string;
  status: PartnershipStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type B2BRequestStatus = 'pending' | 'in_progress' | 'shipped' | 'fulfilled' | 'cancelled';
export type B2BRequestType = 'Café Verde' | 'Café Tostado' | 'Insumos' | 'Otro';

export interface B2BRequestUpdate {
  status: B2BRequestStatus;
  message: string;
  timestamp: unknown;
  updatedBy: string; // userId
}

export interface B2BRequest {
  id?: string;
  partnershipId: string;
  senderId: string;
  senderBusinessName: string;
  receiverId: string;
  receiverBusinessName: string;
  type: B2BRequestType | string;
  message: string;
  status: B2BRequestStatus;
  updates: B2BRequestUpdate[];
  createdAt?: unknown;
  updatedAt?: unknown;
}
