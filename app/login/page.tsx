"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthShell } from "@/components/auth-shell"
import { GButton, GInput } from "@/components/ui-kit"
import { GoogleButton } from "@/components/google-button"
import { Icon } from "@/components/icon"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const { loginEmail, loginGoogle } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await loginEmail(email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(mapError(err))
    } finally {
      setLoading(false)
    }
  }, [email, password, loginEmail, router])

  const handleGoogle = useCallback(async () => {
    setError("")
    setGoogleLoading(true)
    try {
      await loginGoogle()
      router.push("/dashboard")
    } catch (err) {
      setError(mapError(err))
    } finally {
      setGoogleLoading(false)
    }
  }, [loginGoogle, router])

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
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm text-muted-foreground">Password</label>
            <Link href="/forgot-password" className="text-xs text-brand-1 hover:underline">
              Forgot password?
            </Link>
          </div>
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
        <GButton type="submit" loading={loading} className="mt-3 w-full">
          <Icon name="login-3-bold" size={18} />
          Log In
        </GButton>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Continue with Google" />

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
