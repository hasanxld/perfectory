import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate required Firebase config
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'] as const
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key])

if (missingKeys.length > 0) {
  throw new Error(
    `[Firebase] Missing required environment variables: ${missingKeys.map(k => `NEXT_PUBLIC_FIREBASE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`).join(', ')}. Please add them to your project settings.`
  )
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
