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
import { auth, googleProvider, isConfigured } from "./firebase"
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!auth || !auth.currentUser) return
    try {
      const p = await getUserProfile(auth.currentUser.uid)
      setProfile(p)
    } catch (error) {
      console.error("[Auth] Error refreshing profile:", error)
    }
  }, [])

  useEffect(() => {
    if (!isConfigured) {
      console.warn("[Auth] Firebase not configured. Skipping auth setup.")
      setLoading(false)
      return
    }

    if (!auth) {
      console.error("[Auth] Auth instance not available")
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
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
      } catch (error) {
        console.error("[Auth] Error in auth state change:", error)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const loginEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth not configured")
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signupEmail = useCallback(
    async (name: string, email: string, password: string) => {
      if (!auth) throw new Error("Firebase Auth not configured")
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
    if (!auth || !googleProvider)
      throw new Error("Firebase Auth not configured")
    await signInWithPopup(auth, googleProvider)
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  return (
    <AuthContext.Provider
        value={{
          user,
          profile,
          loading,
          refreshProfile,
          loginEmail,
          signupEmail,
          loginGoogle,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
