"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
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
  signupEmail: (name: string, email: string, password: string, phone?: string) => Promise<void>
  loginGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return
    const p = await getUserProfile(auth.currentUser.uid)
    setProfile(p)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const p = await ensureUserProfile({
          uid: u.uid,
          email: u.email,
          name: u.displayName,
          photoURL: u.photoURL,
        })
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const loginEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signupEmail = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      // Generate DiceBear avatar from user's initials
      const initials = name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=random`
      if (name) await updateProfile(cred.user, { displayName: name, photoURL: avatarUrl })
      await ensureUserProfile({
        uid: cred.user.uid,
        email: cred.user.email,
        name,
        phone,
        photoURL: avatarUrl,
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

  const value = {
    user,
    profile,
    loading,
    refreshProfile,
    loginEmail,
    signupEmail,
    loginGoogle,
    logout,
  }

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
