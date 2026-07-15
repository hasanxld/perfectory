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
  addDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore"

export const STARTING_CREDITS = 50

export type UserProfile = {
  uid: string
  email: string | null
  name: string
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

// Voice Generation History
export type VoiceGeneration = {
  id?: string
  text: string
  language: string
  voice: string
  pitch: number
  speed: number
  volume: number
  audioUrl?: string
  duration?: number
  creditsUsed?: number
  createdAt?: unknown
}

export async function saveGeneration(
  uid: string,
  data: VoiceGeneration,
): Promise<string> {
  const generationsRef = collection(db, USERS, uid, "generations")
  const docRef = await addDoc(generationsRef, {
    ...data,
    creditsUsed: 1,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getGenerationHistory(uid: string, limitCount = 50) {
  const generationsRef = collection(db, USERS, uid, "generations")
  const q = query(
    generationsRef,
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as (VoiceGeneration & { id: string })[]
}

export async function deleteGeneration(uid: string, generationId: string) {
  const genRef = doc(db, USERS, uid, "generations", generationId)
  await deleteDoc(genRef)
}

// Favorite Voices/Presets
export type FavoriteVoice = {
  id?: string
  name: string
  language: string
  voice: string
  pitch: number
  speed: number
  volume: number
  createdAt?: unknown
}

export async function saveFavoriteVoice(
  uid: string,
  data: FavoriteVoice,
): Promise<string> {
  const voicesRef = collection(db, USERS, uid, "favoriteVoices")
  const docRef = await addDoc(voicesRef, {
    ...data,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getFavoriteVoices(uid: string) {
  const voicesRef = collection(db, USERS, uid, "favoriteVoices")
  const q = query(voicesRef, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as (FavoriteVoice & { id: string })[]
}

export async function deleteFavoriteVoice(uid: string, voiceId: string) {
  const voiceRef = doc(db, USERS, uid, "favoriteVoices", voiceId)
  await deleteDoc(voiceRef)
}
