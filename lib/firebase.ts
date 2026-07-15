import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

if (!firebaseConfig.apiKey) {
  console.warn("[Firebase] Missing environment variables. Please add NEXT_PUBLIC_FIREBASE_* vars to your project settings.")
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Auth + Google provider
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

// Firestore instance. To use a named (non-default) database, set
// NEXT_PUBLIC_FIRESTORE_DB_ID; otherwise the default database is used.
const dbId = process.env.NEXT_PUBLIC_FIRESTORE_DB_ID
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app)

export default app
