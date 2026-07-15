import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getDatabase, connectDatabaseEmulator } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyCMKNydjhcNLdKu9Nm-pzgq2pSRGDHVk-4",
  authDomain: "banglaquiz-sgw69.firebaseapp.com",
  databaseURL: "https://banglaquiz-sgw69-default-rtdb.firebaseio.com",
  projectId: "banglaquiz-sgw69",
  storageBucket: "banglaquiz-sgw69.firebasestorage.app",
  messagingSenderId: "1022892255338",
  appId: "1:1022892255338:web:347505a8ff6d0f1397c213",
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Auth + Google provider
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

// Firestore instance (for user profiles, plans, etc)
const dbId = process.env.NEXT_PUBLIC_FIRESTORE_DB_ID
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app)

// Realtime Database (for generation history, live updates)
export const rtdb = getDatabase(app)

// Optional: Connect to emulators in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  try {
    connectFirestoreEmulator(db, "localhost", 8080)
    connectDatabaseEmulator(rtdb, "localhost", 9000)
  } catch (err) {
    // emulator already connected, ignore
  }
}

export default app
