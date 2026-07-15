import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  writeBatch,
  Timestamp,
  increment,
} from "firebase/firestore"
import { db } from "./firebase"

// User Profile Operations
export async function createUserProfile(
  userId: string,
  data: {
    email: string
    displayName?: string
    photoURL?: string
  }
) {
  const userRef = doc(db, "users", userId)
  await setDoc(userRef, {
    ...data,
    credits: 50, // Starting credits
    plan: "free",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
}

export async function getUserProfile(userId: string) {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? userSnap.data() : null
}

export async function updateUserProfile(
  userId: string,
  data: Record<string, any>
) {
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

// Credits System
export async function deductCredits(userId: string, amount: number) {
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    credits: increment(-amount),
  })
}

export async function addCredits(userId: string, amount: number) {
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    credits: increment(amount),
  })
}

export async function getUserCredits(userId: string): Promise<number> {
  const user = await getUserProfile(userId)
  return user?.credits || 0
}

// Voice Generation History
export async function saveGeneration(
  userId: string,
  data: {
    text: string
    language: string
    voice: string
    pitch: number
    speed: number
    volume: number
    audioUrl?: string
    duration?: number
  }
) {
  const generationsRef = collection(db, "users", userId, "generations")
  const docRef = await addDoc(generationsRef, {
    ...data,
    creditsUsed: 1, // Adjust based on your pricing
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function getGenerationHistory(userId: string, limit = 50) {
  const generationsRef = collection(db, "users", userId, "generations")
  const q = query(generationsRef)
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort(
      (a: any, b: any) =>
        b.createdAt.toMillis() - a.createdAt.toMillis()
    )
    .slice(0, limit)
}

export async function deleteGeneration(userId: string, generationId: string) {
  const genRef = doc(db, "users", userId, "generations", generationId)
  await deleteDoc(genRef)
}

// Saved Voices/Presets
export async function saveFavoriteVoice(
  userId: string,
  data: {
    name: string
    language: string
    voice: string
    pitch: number
    speed: number
    volume: number
  }
) {
  const voicesRef = collection(db, "users", userId, "favoriteVoices")
  const docRef = await addDoc(voicesRef, {
    ...data,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function getFavoriteVoices(userId: string) {
  const voicesRef = collection(db, "users", userId, "favoriteVoices")
  const snapshot = await getDocs(voicesRef)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function deleteFavoriteVoice(userId: string, voiceId: string) {
  const voiceRef = doc(db, "users", userId, "favoriteVoices", voiceId)
  await deleteDoc(voiceRef)
}

// Subscriptions
export async function createSubscription(
  userId: string,
  data: {
    plan: "free" | "pro" | "enterprise"
    monthlyCredits: number
    price: number
    stripeSubscriptionId?: string
  }
) {
  const subRef = doc(db, "subscriptions", userId)
  await setDoc(subRef, {
    ...data,
    userId,
    startDate: Timestamp.now(),
    renewalDate: Timestamp.now(),
    active: true,
  })
}

export async function getSubscription(userId: string) {
  const subRef = doc(db, "subscriptions", userId)
  const subSnap = await getDoc(subRef)
  return subSnap.exists() ? subSnap.data() : null
}

export async function cancelSubscription(userId: string) {
  const subRef = doc(db, "subscriptions", userId)
  await updateDoc(subRef, {
    active: false,
    cancelledAt: Timestamp.now(),
  })
}

// Public Generations (for sharing)
export async function publishGeneration(
  userId: string,
  generationId: string,
  data?: {
    title?: string
    description?: string
  }
) {
  const pubRef = doc(db, "publicGenerations", `${userId}_${generationId}`)
  await setDoc(pubRef, {
    userId,
    generationId,
    ...data,
    publishedAt: Timestamp.now(),
    views: 0,
  })
}

export async function getPublicGenerations(limit = 100) {
  const pubRef = collection(db, "publicGenerations")
  const snapshot = await getDocs(pubRef)
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .slice(0, limit)
}

// Usage Analytics
export async function trackUsage(
  userId: string,
  event: string,
  metadata?: Record<string, any>
) {
  const analyticsRef = collection(db, "analytics")
  await addDoc(analyticsRef, {
    userId,
    event,
    metadata,
    timestamp: Timestamp.now(),
  })
}

// Batch operations example
export async function bulkUpdateUserStats(
  updates: Array<{
    userId: string
    creditsUsed: number
    generationsCount: number
  }>
) {
  const batch = writeBatch(db)

  for (const update of updates) {
    const userRef = doc(db, "users", update.userId)
    batch.update(userRef, {
      creditsUsed: increment(update.creditsUsed),
      generationsCount: increment(update.generationsCount),
      updatedAt: Timestamp.now(),
    })
  }

  await batch.commit()
}
