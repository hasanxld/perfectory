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
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  type User,
} from "firebase/auth"
import { auth } from "./firebase-config"
import {
  createUserProfile,
  getUserProfile,
  createAccountSettings,
  type UserProfile,
} from "./firestore-service"

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  profileLoading: boolean
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
  const [loading, setLoading] = useState(true)       // Firebase Auth initialising
  const [profileLoading, setProfileLoading] = useState(false) // Firestore profile loading

  const refreshProfile = useCallback(async () => {
    if (!auth?.currentUser) return
    try {
      const p = await getUserProfile(auth.currentUser.uid)
      setProfile(p)
    } catch (error) {
      console.error("[Auth] Error refreshing profile:", error)
    }
  }, [])

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        setProfileLoading(true)
        try {
          let p = await getUserProfile(u.uid)
          if (!p) {
            // Profile doesn't exist yet — create it (new user)
            p = await createUserProfile({
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || '',
              avatarUrl: u.photoURL || undefined,
            })
            await createAccountSettings(u.uid)
          }
          setProfile(p)
        } catch (error) {
          console.error("[Auth] Firestore error loading profile:", error)
          // Still set profile to null so UI can react, but don't block auth
          setProfile(null)
        } finally {
          setProfileLoading(false)
        }
      } else {
        setProfile(null)
        setProfileLoading(false)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [])

  // ── Email / password signup ────────────────────────────────────────────────
  const signupEmail = useCallback(async (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => {
    if (!auth) throw new Error("Firebase not configured")

    // Step 1 — create Firebase Auth account (throws on auth errors e.g. email-already-in-use)
    const cred = await createUserWithEmailAndPassword(auth, email, password)

    // Step 2 — update display name (best-effort, don't throw)
    try {
      await updateProfile(cred.user, { displayName: name })
    } catch (e) {
      console.warn("[Auth] updateProfile failed:", e)
    }

    // Step 3 — write Firestore profile (best-effort, don't throw to caller)
    try {
      await createUserProfile({
        uid: cred.user.uid,
        email: cred.user.email || '',
        displayName: name,
        phoneNumber: phone,
        avatarUrl: undefined,
      })
      await createAccountSettings(cred.user.uid)
    } catch (e) {
      console.warn("[Auth] Firestore profile creation failed (will retry on next login):", e)
    }

    // Signup is considered successful — caller routes to /dashboard
  }, [])

  // ── Email / password login ─────────────────────────────────────────────────
  const loginEmail = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not configured")
    await signInWithEmailAndPassword(auth, email, password)
    // onAuthStateChanged will update profile & profileLoading
  }, [])

  // ── Google login / signup ──────────────────────────────────────────────────
  const loginGoogle = useCallback(async () => {
    if (!auth) throw new Error("Firebase not configured")
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    const result = await signInWithPopup(auth, provider)
    const gUser = result.user

    // Ensure Firestore profile exists (best-effort)
    try {
      const existing = await getUserProfile(gUser.uid)
      if (!existing) {
        await createUserProfile({
          uid: gUser.uid,
          email: gUser.email || '',
          displayName: gUser.displayName || '',
          avatarUrl: gUser.photoURL || undefined,
        })
        await createAccountSettings(gUser.uid)
      }
    } catch (e) {
      console.warn("[Auth] Google profile creation failed:", e)
    }
    // onAuthStateChanged fires and updates state
  }, [])

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      profileLoading,
      refreshProfile,
      loginEmail,
      signupEmail,
      loginGoogle,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
