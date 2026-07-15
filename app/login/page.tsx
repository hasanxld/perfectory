"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthShell } from "@/components/auth-shell"
import { GButton, GInput } from "@/components/ui-kit"
import { Icon } from "@/components/icon"
import { GoogleIcon } from "@/components/google-icon"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const { loginEmail, loginGoogle, profile, profileLoading, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await loginEmail(email, password)
      // Redirect handled by useEffect once profile loads
    } catch (err) {
      setError(mapError(err))
      setSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    setError("")
    setSubmitting(true)
    try {
      await loginGoogle()
      // Redirect handled by useEffect once profile loads
    } catch (err) {
      setError(mapError(err))
      setSubmitting(false)
    }
  }

  // Redirect once Firebase Auth + Firestore profile are both resolved
  useEffect(() => {
    if (authLoading || profileLoading) return  // still initialising
    if (!user) return                           // not logged in — stay on page
    // Profile is loaded — go to dashboard
    router.replace("/dashboard")
  }, [authLoading, profileLoading, user, router])

  const loading = submitting || authLoading || profileLoading



  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue to your voice studio">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <Icon name="danger-triangle-bold" size={18} />
            {error}
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-sm text-muted-foreground">Email</label>
          <GInput
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-muted-foreground">Password</label>
          <div className="relative">
            <GInput
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle password"
            >
              <Icon name={show ? "eye-closed-bold" : "eye-bold"} size={18} />
            </button>
          </div>
        </div>
        <GButton type="submit" loading={submitting} disabled={submitting} className="mt-2 w-full">
          <Icon name="login-3-bold" size={18} />
          Log In
        </GButton>
      </form>

      {/* Divider */}
      <div className="relative mt-6 mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Google Login Button */}
      <GButton
        type="button"
        onClick={handleGoogleLogin}
        loading={loading}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        <GoogleIcon size={18} />
        Log in with Google
      </GButton>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="gradient-text font-medium">
          Sign up
        </Link>
      </p>
    </AuthShell>
  )
}

function mapError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ""
  if (code.includes("invalid-credential") || code.includes("wrong-password"))
    return "Invalid email or password."
  if (code.includes("user-not-found")) return "No account found with this email."
  if (code.includes("too-many-requests")) return "Too many attempts. Try again later."
  if (code.includes("popup-closed")) return "Google sign-in was cancelled."
  return "Something went wrong. Please try again."
}
