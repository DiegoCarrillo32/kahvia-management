export interface UserProfile {
  id: string; // Matches Firebase Auth UID
  email: string;
  businessName: string;
  role?: string;
  inviteCode?: string;
  createdAt?: unknown;
}
