import { initializeApp, getApps } from 'firebase/app';
import { getAuth, applyActionCode, checkActionCode, confirmPasswordReset } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Avoid re-initialising on hot reloads
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Firestore — named database "perfectory" as set in Firebase Console
// NEXT_PUBLIC_FIRESTORE_DB_ID env var controls the database id
const firestoreDbId = process.env.NEXT_PUBLIC_FIRESTORE_DB_ID ?? 'perfectory';
export const db = getFirestore(app, firestoreDbId);

// Storage
export const storage = getStorage(app);

// Re-export auth helpers
export { applyActionCode, checkActionCode, confirmPasswordReset };

export default app;
