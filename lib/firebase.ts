import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

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

// Firestore instance. To use a named (non-default) database, set
// NEXT_PUBLIC_FIRESTORE_DB_ID; otherwise the default database is used.
const dbId = process.env.NEXT_PUBLIC_FIRESTORE_DB_ID
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app)

export default app
