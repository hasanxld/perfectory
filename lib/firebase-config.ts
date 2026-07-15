import { initializeApp } from 'firebase/app';
import { getAuth, applyActionCode, checkActionCode, confirmPasswordReset } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCs6N0vhMAn7OR10RTB_YjUiMvfClqFJVw',
  authDomain: 'perfectory-voices.firebaseapp.com',
  projectId: 'perfectory-voices',
  storageBucket: 'perfectory-voices.firebasestorage.app',
  messagingSenderId: '968212963781',
  appId: '1:968212963781:web:6bf9430037555548702bac',
  measurementId: 'G-2X7GCBC379',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Re-export firebase auth functions for convenience
export { applyActionCode, checkActionCode, confirmPasswordReset };

export default app;
