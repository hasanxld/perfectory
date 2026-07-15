"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth"
import { auth, googleProvider } from "./firebase"
import {
  ensureUserProfile,
  getUserProfile,
  type UserProfile,
} from "./user-store"

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  loginEmail: (email: string, password: string) => Promise<void>
  signupEmail: (name: string, email: string, password: string) => Promise<void>
  loginGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache profile fetches to prevent duplicate requests
const profileCache = new Map<string, { data: UserProfile; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds

async function getCachedProfile(uid: string): Promise<UserProfile> {
  const cached = profileCache.get(uid)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  const p = await getUserProfile(uid)
  profileCache.set(uid, { data: p, timestamp: Date.now() })
  return p
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return
    const p = await getCachedProfile(auth.currentUser.uid)
    setProfile(p)
  }, [])

  useEffect(() => {
    let ignore = false
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (ignore) return
      setUser(u)
      setLoading(false) // Mark loading complete immediately for faster paint
      if (u) {
        // Load profile in background without blocking UI
        const p = await ensureUserProfile({
          uid: u.uid,
          email: u.email,
          name: u.displayName,
          photoURL: u.photoURL,
        })
        if (!ignore) {
          setProfile(p)
          profileCache.set(u.uid, { data: p, timestamp: Date.now() })
        }
      } else {
        setProfile(null)
      }
    })
    return () => {
      ignore = true
      unsub()
    }
  }, [])

  const loginEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signupEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name) await updateProfile(cred.user, { displayName: name })
      await ensureUserProfile({
        uid: cred.user.uid,
        email: cred.user.email,
        name,
        photoURL: cred.user.photoURL,
      })
    },
    [],
  )

  const loginGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider)
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  // Memoize value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    profile,
    loading,
    refreshProfile,
    loginEmail,
    signupEmail,
    loginGoogle,
    logout,
  }), [user, profile, loading, refreshProfile, loginEmail, signupEmail, loginGoogle, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
