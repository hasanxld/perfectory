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

const isConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId)

if (!isConfigured) {
  console.warn(
    "[Firebase] Missing environment variables. Please add NEXT_PUBLIC_FIREBASE_* vars to your project settings."
  )
}

let app: ReturnType<typeof initializeApp> | undefined
let auth: ReturnType<typeof getAuth> | undefined
let db: ReturnType<typeof getFirestore> | undefined
let googleProvider: GoogleAuthProvider | undefined

try {
  if (isConfigured) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
    googleProvider.setCustomParameters({ prompt: "select_account" })

    const dbId = process.env.NEXT_PUBLIC_FIRESTORE_DB_ID
    db = dbId ? getFirestore(app, dbId) : getFirestore(app)
  }
} catch (error) {
  console.error("[Firebase] Initialization failed:", error)
}

export { app, auth, googleProvider, db, isConfigured }
export default app
