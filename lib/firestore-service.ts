import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  addDoc,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase-config';

// User Profile Types
export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  plan: 'free' | 'pro' | 'premium';
  credits: number;
  favoriteVoices: string[];
  phoneNumber?: string;
  createdAt: any;
  updatedAt: any;
}

// Generation History Types
export interface GenerationHistory {
  id: string;
  uid: string;
  text: string;
  voiceId: string;
  voiceName: string;
  audioUrl: string;
  creditsUsed: number;
  createdAt: any;
}

// Subscription/Plan Types
export interface UserSubscription {
  uid: string;
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  creditsPerMonth: number;
  creditsUsedThisMonth: number;
  renewalDate: any;
  createdAt: any;
  updatedAt: any;
}

// Account Settings Types
export interface AccountSettings {
  uid: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
  privacyLevel: 'public' | 'private';
  dataRetention: number; // days
  createdAt: any;
  updatedAt: any;
}

// USER PROFILE FUNCTIONS
export const createUserProfile = async (userData: Partial<UserProfile>) => {
  if (!userData.uid) throw new Error('UID is required');

  // Generate username from displayName (convert to lowercase, remove spaces, keep alphanumeric)
  const baseUsername = userData.displayName 
    ? userData.displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    : userData.email?.split('@')[0] || 'user';

  const userRef = doc(db, 'users', userData.uid);
  const profileData: UserProfile = {
    uid: userData.uid,
    email: userData.email || '',
    username: userData.username || baseUsername || 'user',
    displayName: userData.displayName || '',
    plan: 'free',
    credits: 50, // Free tier gets 50 credits
    favoriteVoices: [],
    avatarUrl: userData.avatarUrl,
    bio: userData.bio,
    phoneNumber: userData.phoneNumber,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, profileData);
  return profileData;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!uid) return null;

  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!uid) throw new Error('UID is required');

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const addFavoriteVoice = async (uid: string, voiceId: string) => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  const user = snapshot.data() as UserProfile;

  if (!user.favoriteVoices.includes(voiceId)) {
    await updateDoc(userRef, {
      favoriteVoices: [...user.favoriteVoices, voiceId],
      updatedAt: serverTimestamp(),
    });
  }
};

export const removeFavoriteVoice = async (uid: string, voiceId: string) => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  const user = snapshot.data() as UserProfile;

  await updateDoc(userRef, {
    favoriteVoices: user.favoriteVoices.filter((id) => id !== voiceId),
    updatedAt: serverTimestamp(),
  });
};

// GENERATION HISTORY FUNCTIONS
export const saveGenerationHistory = async (
  uid: string,
  generationData: Omit<GenerationHistory, 'id' | 'uid'>
): Promise<string> => {
  if (!uid) throw new Error('UID is required');

  const historyRef = collection(db, 'users', uid, 'generationHistory');
  const docRef = await addDoc(historyRef, {
    ...generationData,
    uid,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

export const getGenerationHistory = async (uid: string): Promise<GenerationHistory[]> => {
  if (!uid) return [];

  const historyRef = collection(db, 'users', uid, 'generationHistory');
  const q = query(historyRef);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as GenerationHistory));
};

export const deleteGenerationHistory = async (uid: string, historyId: string) => {
  if (!uid) throw new Error('UID is required');

  const historyRef = doc(db, 'users', uid, 'generationHistory', historyId);
  await deleteDoc(historyRef);
};

// SUBSCRIPTION/PLAN FUNCTIONS
export const getUserSubscription = async (uid: string): Promise<UserSubscription | null> => {
  if (!uid) return null;

  const subRef = doc(db, 'subscriptions', uid);
  const snapshot = await getDoc(subRef);
  return snapshot.exists() ? (snapshot.data() as UserSubscription) : null;
};

export const createSubscription = async (uid: string, plan: 'free' | 'pro' | 'premium') => {
  if (!uid) throw new Error('UID is required');

  const creditsMap = {
    free: 50,
    pro: 500,
    premium: 2000,
  };

  const subscriptionData: UserSubscription = {
    uid,
    plan,
    status: 'active',
    creditsPerMonth: creditsMap[plan],
    creditsUsedThisMonth: 0,
    renewalDate: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const subRef = doc(db, 'subscriptions', uid);
  await setDoc(subRef, subscriptionData);
  return subscriptionData;
};

export const updateSubscription = async (uid: string, updates: Partial<UserSubscription>) => {
  if (!uid) throw new Error('UID is required');

  const subRef = doc(db, 'subscriptions', uid);
  await updateDoc(subRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deductCredits = async (uid: string, amount: number) => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  const user = snapshot.data() as UserProfile;

  const newCredits = Math.max(0, user.credits - amount);

  await updateDoc(userRef, {
    credits: newCredits,
    updatedAt: serverTimestamp(),
  });

  return newCredits;
};

// ACCOUNT SETTINGS FUNCTIONS
export const getAccountSettings = async (uid: string): Promise<AccountSettings | null> => {
  if (!uid) return null;

  const settingsRef = doc(db, 'accountSettings', uid);
  const snapshot = await getDoc(settingsRef);
  return snapshot.exists() ? (snapshot.data() as AccountSettings) : null;
};

export const createAccountSettings = async (uid: string) => {
  if (!uid) throw new Error('UID is required');

  const settingsData: AccountSettings = {
    uid,
    emailNotifications: true,
    marketingEmails: false,
    twoFactorEnabled: false,
    privacyLevel: 'private',
    dataRetention: 90,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const settingsRef = doc(db, 'accountSettings', uid);
  await setDoc(settingsRef, settingsData);
  return settingsData;
};

export const updateAccountSettings = async (uid: string, updates: Partial<AccountSettings>) => {
  if (!uid) throw new Error('UID is required');

  const settingsRef = doc(db, 'accountSettings', uid);
  await updateDoc(settingsRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// UTILITY FUNCTIONS
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('displayName', '>=', searchTerm), where('displayName', '<=', searchTerm + '\uf8ff'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as UserProfile);
};


