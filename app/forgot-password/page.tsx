"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { sendPasswordResetEmail } from "firebase/auth"
import { AuthShell } from "@/components/auth-shell"
import { GButton, GInput } from "@/components/ui-kit"
import { Icon } from "@/components/icon"
import { auth } from "@/lib/firebase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email) {
      setError("Please enter your email address.")
      return
    }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (err) {
      const code = (err as { code?: string })?.code ?? ""
      if (code.includes("user-not-found")) {
        setError("No account found with this email address.")
      } else if (code.includes("too-many-requests")) {
        setError("Too many attempts. Try again later.")
      } else {
        setError("Failed to send reset email. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }, [email])

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="We&apos;ve sent a password reset link">
        <div className="rounded-xl border border-brand-1/20 bg-brand-1/5 p-4 text-sm text-foreground">
          <p>
            A password reset link has been sent to <span className="font-medium">{email}</span>. Follow the link in the email to reset your password.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Didn&apos;t receive the email? Check your spam folder or try again with a different email.</p>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              setSent(false)
              setEmail("")
            }}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background/80"
          >
            Try another email
          </button>
          <Link href="/login" className="flex-1">
            <button className="w-full rounded-lg bg-brand-1 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-1/90">
              Back to Login
            </button>
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Reset password" subtitle="Enter your email to receive a reset link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <Icon name="danger-triangle-bold" size={18} />
            {error}
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-sm text-muted-foreground">Email address</label>
          <GInput
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
          />
        </div>
        <GButton type="submit" loading={loading} className="mt-2 w-full">
          <Icon name="mail-send-bold" size={18} />
          Send reset link
        </GButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="gradient-text font-medium">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
