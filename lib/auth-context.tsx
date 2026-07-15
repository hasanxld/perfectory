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
  type User,
} from "firebase/auth"
import { auth } from "./firebase-config"
import {
  createUserProfile,
  getUserProfile,
  createAccountSettings,
  updateEmailVerificationSentTime,
  type UserProfile,
} from "./firestore-service"
import { sendEmailVerification } from "firebase/auth"

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  loginEmail: (email: string, password: string) => Promise<void>
  signupEmail: (name: string, email: string, password: string, phone?: string, avatarUrl?: string) => Promise<void>
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
    if (!auth) {
      console.error("[Auth] Auth instance not available")
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u)
        if (u) {
          let p = await getUserProfile(u.uid)
          if (!p) {
            p = await createUserProfile({
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || '',
              avatarUrl: u.photoURL || undefined,
            })
            await createAccountSettings(u.uid)
          }
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
    async (name: string, email: string, password: string, phone?: string, avatarUrl?: string) => {
      if (!auth) throw new Error("Firebase Auth not configured")
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with name and avatar
      if (name) await updateProfile(cred.user, { displayName: name })
      
      // Create user profile with all data
      await createUserProfile({
        uid: cred.user.uid,
        email: cred.user.email || '',
        displayName: name,
        phoneNumber: phone,
        avatarUrl: avatarUrl || cred.user.photoURL || undefined,
        emailVerified: false,
      })
      
      // Create account settings
      await createAccountSettings(cred.user.uid)
      
      // Send email verification
      try {
        await sendEmailVerification(cred.user)
        await updateEmailVerificationSentTime(cred.user.uid)
      } catch (err) {
        console.error("[Auth] Error sending email verification:", err)
        throw new Error("Failed to send verification email")
      }
    },
    [],
  )



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
