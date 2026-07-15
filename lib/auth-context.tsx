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
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
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

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  loginEmail: (email: string, password: string) => Promise<void>
  signupEmail: (name: string, email: string, password: string, phone?: string, avatarUrl?: string) => Promise<void>
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
            // New user — create profile (emailVerified false by default for email/password)
            p = await createUserProfile({
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || '',
              avatarUrl: u.photoURL || undefined,
              emailVerified: u.emailVerified, // Google users are auto-verified
            })
            await createAccountSettings(u.uid)
          } else if (u.emailVerified && !p.emailVerified) {
            // Firebase Auth says verified but Firestore is not updated yet — sync it
            const { updateEmailVerificationStatus } = await import('./firestore-service')
            await updateEmailVerificationStatus(u.uid, true)
            p = { ...p, emailVerified: true }
          }
          setProfile(p)
        } else {
          setProfile(null)
        }
      } catch (error) {
        const errMsg = (error as Error)?.message || 'unknown error'
        if (errMsg.includes("Database") || errMsg.includes("Firestore")) {
          console.error("[Auth] Firestore database error - make sure database is created:", error)
        } else if (errMsg.includes("offline")) {
          console.warn("[Auth] Currently offline, will retry when online")
        } else {
          console.error("[Auth] Error in auth state change:", error)
        }
        setProfile(null)
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
      
      try {
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
        
        // Send email verification - this may fail but account is already created
        try {
          await sendEmailVerification(cred.user, {
            url: typeof window !== 'undefined' ? `${window.location.origin}/verify-email` : undefined,
          })
          await updateEmailVerificationSentTime(cred.user.uid)
        } catch (emailErr) {
          console.warn("[Auth] Warning: could not send verification email, but account created:", emailErr)
          // Don't throw - account is created, user can resend from verify-email page
        }
      } catch (err) {
        console.error("[Auth] Error during signup:", err)
        throw err
      }
    },
    [],
  )



  const loginGoogle = useCallback(async () => {
    if (!auth) throw new Error("Firebase Auth not configured")
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    
    const result = await signInWithPopup(auth, provider)
    const googleUser = result.user
    
    // Check if profile exists, if not create it
    try {
      let profile = await getUserProfile(googleUser.uid)
      if (!profile) {
        // New Google user — create profile with auto-verified email
        await createUserProfile({
          uid: googleUser.uid,
          email: googleUser.email || '',
          displayName: googleUser.displayName || 'Google User',
          phoneNumber: undefined,
          avatarUrl: googleUser.photoURL || undefined,
          emailVerified: true, // Google users are automatically verified
        })
        await createAccountSettings(googleUser.uid)
      }
    } catch (error) {
      console.error("[Auth] Error creating Google profile:", error)
      throw error
    }
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
