import { db } from "./firebase"
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"

export type VoiceGeneration = {
  id?: string
  uid: string
  text: string
  language: "en" | "bn" | "hi"
  voice: string
  pitch: number
  rate: number
  createdAt?: Timestamp
}

const GENERATIONS = "generations"

/**
 * Save a voice generation to Firestore history
 */
export async function saveGeneration(
  uid: string,
  data: Omit<VoiceGeneration, "id" | "uid" | "createdAt">,
): Promise<string> {
  const docRef = await addDoc(collection(db, GENERATIONS), {
    uid,
    ...data,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Get recent generations for a user
 */
export async function getUserGenerations(
  uid: string,
  maxResults = 20,
): Promise<VoiceGeneration[]> {
  const q = query(
    collection(db, GENERATIONS),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(maxResults),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VoiceGeneration))
}

/**
 * Get all public generations for profile display
 */
export async function getPublicGenerations(
  uid: string,
  maxResults = 10,
): Promise<VoiceGeneration[]> {
  const q = query(
    collection(db, GENERATIONS),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(maxResults),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VoiceGeneration))
}
