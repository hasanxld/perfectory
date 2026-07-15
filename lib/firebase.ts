import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "perfectory-voice.firebaseapp.com",
  projectId: "perfectory-voice",
  storageBucket: "perfectory-voice.firebasestorage.app",
  messagingSenderId: "997606408146",
  appId: "1:997606408146:web:b2b10075cb51d8b314920b",
  measurementId: "G-G8X7W1SDY4",
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Firestore instance. To use a named (non-default) database for this website,
// set NEXT_PUBLIC_FIRESTORE_DB_ID; otherwise the default database is used.
const dbId = process.env.NEXT_PUBLIC_FIRESTORE_DB_ID
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app)

export default app
