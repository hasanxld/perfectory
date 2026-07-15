"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthShell } from "@/components/auth-shell"
import { GButton, GInput } from "@/components/ui-kit"
import { GoogleButton } from "@/components/google-button"
import { Icon } from "@/components/icon"
import { useAuth } from "@/lib/auth-context"

export default function SignupPage() {
  const { signupEmail, loginGoogle } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    setLoading(true)
    try {
      await signupEmail(name, email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(mapError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
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
  }

  return (
    <AuthShell title="Create your account" subtitle="Get 50 free credits and start generating voice">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <Icon name="danger-triangle-bold" size={18} />
            {error}
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-sm text-muted-foreground">Full name</label>
          <GInput
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
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
              placeholder="At least 6 characters"
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
        <GButton type="submit" loading={loading} className="mt-2 w-full">
          <Icon name="user-plus-bold" size={18} />
          Create Account
        </GButton>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="gradient-text font-medium">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}

function mapError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ""
  if (code.includes("email-already-in-use")) return "This email is already registered."
  if (code.includes("invalid-email")) return "Please enter a valid email."
  if (code.includes("weak-password")) return "Password is too weak."
  if (code.includes("popup-closed")) return "Google sign-in was cancelled."
  return "Something went wrong. Please try again."
}
