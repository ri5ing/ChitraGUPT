import { UserProfile, Contract } from '@/types';
import { Timestamp } from 'firebase/firestore';

export const mockUsers: UserProfile[] = [];

// This is now just for type reference during the transition.
// All contract data should come from Firestore.
export const mockContracts: Omit<Contract, 'uploadDate'>[] & {uploadDate: string}[] = [];
