import { db } from "./firebase"
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"

export const STARTING_CREDITS = 50

export type UserProfile = {
  uid: string
  email: string | null
  name: string
  phone?: string
  username: string
  bio: string
  photoURL: string
  plan: "free" | "monthly" | "yearly"
  credits: number
  isPublic: boolean
  createdAt?: unknown
}

const USERS = "users"

function slugify(base: string) {
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 20) || "user"
  )
}

export async function ensureUserProfile(params: {
  uid: string
  email: string | null
  name?: string | null
  phone?: string
  photoURL?: string | null
}): Promise<UserProfile> {
  const ref = doc(db, USERS, params.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    return snap.data() as UserProfile
  }
  const name = params.name || params.email?.split("@")[0] || "New User"
  let username = slugify(name)
  // ensure username uniqueness
  const taken = await getDocs(
    query(collection(db, USERS), where("username", "==", username)),
  )
  if (!taken.empty) username = `${username}-${params.uid.slice(0, 4)}`

  const profile: UserProfile = {
    uid: params.uid,
    email: params.email,
    name,
    phone: params.phone,
    username,
    bio: "",
    photoURL: params.photoURL || "",
    plan: "free",
    credits: STARTING_CREDITS,
    isPublic: true,
    createdAt: serverTimestamp(),
  }
  await setDoc(ref, profile)
  return profile
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS, uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function getProfileByUsername(
  username: string,
): Promise<UserProfile | null> {
  const res = await getDocs(
    query(collection(db, USERS), where("username", "==", username)),
  )
  if (res.empty) return null
  return res.docs[0].data() as UserProfile
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>,
) {
  await updateDoc(doc(db, USERS, uid), data)
}

export async function spendCredit(uid: string, amount = 1) {
  await updateDoc(doc(db, USERS, uid), { credits: increment(-amount) })
}

export async function addCredits(uid: string, amount: number) {
  await updateDoc(doc(db, USERS, uid), { credits: increment(amount) })
}
