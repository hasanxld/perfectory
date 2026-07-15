'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { sendEmailVerification, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase-config'
import { useAuth } from '@/lib/auth-context'
import { GButton } from '@/components/ui-kit'
import { Icon } from '@/components/icon'
import { Logo } from '@/components/logo'
import { canResendVerificationEmail, updateEmailVerificationSentTime } from '@/lib/firestore-service'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)

  // Redirect logic — wait for loading to finish first
  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (profile?.emailVerified) {
      router.replace('/dashboard')
    }
  }, [loading, user, profile, router])

  // Poll Firebase Auth every 3s to detect when user clicks the link in their email
  useEffect(() => {
    if (!user) return
    const interval = setInterval(async () => {
      try {
        if (!auth.currentUser) return
        await auth.currentUser.reload()
        if (auth.currentUser.emailVerified) {
          router.replace('/dashboard')
        }
      } catch {
        // silent
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [user, router])

  // Countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleResend = useCallback(async () => {
    if (!user) return
    setResendError('')
    setResendSuccess(false)
    try {
      const { canResend, nextResendTime } = await canResendVerificationEmail(user.uid)
      if (!canResend && nextResendTime) {
        setResendCooldown(nextResendTime)
        setResendError(`Please wait ${nextResendTime}s before resending.`)
        return
      }
      setIsResending(true)
      if (!auth.currentUser) throw new Error('No current user')
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/dashboard`,
      })
      await updateEmailVerificationSentTime(user.uid)
      setResendSuccess(true)
      setResendCooldown(60)
      setTimeout(() => setResendSuccess(false), 4000)
    } catch {
      setResendError('Failed to send email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }, [user])

  const handleLogout = useCallback(async () => {
    await signOut(auth)
    router.replace('/login')
  }, [router])

  // Show spinner while auth is loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Icon name="refresh-bold" size={32} className="animate-spin text-brand-1" />
      </div>
    )
  }

  // Don't render if no user (redirect is happening)
  if (!user) return null

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 bg-background">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-lines opacity-20" />
        <div className="absolute left-1/2 top-0 size-[34rem] -translate-x-1/2 rounded-full bg-brand-2/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 size-[24rem] rounded-full bg-brand-1/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo showText />
        </div>

        {/* Card */}
        <div className="gradient-border rounded-3xl p-8">
          <div className="flex flex-col items-center gap-6">

            {/* Email icon */}
            <div className="relative flex size-20 items-center justify-center rounded-2xl bg-brand-1/10">
              <Icon name="user-speak-bold" size={38} className="text-brand-1" />
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-green-500">
                <Icon name="check-circle-bold" size={16} className="text-white" />
              </span>
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                A verification link has been sent to
              </p>
              <p className="mt-1 rounded-lg bg-secondary/60 px-3 py-1.5 font-mono text-sm font-semibold text-foreground break-all">
                {user.email}
              </p>
            </div>

            {/* Steps */}
            <div className="w-full space-y-2.5 rounded-2xl border border-border bg-secondary/30 p-4">
              {[
                { icon: 'notebook-bold', text: 'Open your Gmail inbox' },
                { icon: 'stars-bold', text: 'Look for an email from Perfectory Voice' },
                { icon: 'danger-triangle-bold', text: 'Also check your Spam / Junk folder' },
                { icon: 'bolt-circle-bold', text: 'Click the verification link inside' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-1/10">
                    <Icon name={icon} size={14} className="text-brand-1" />
                  </div>
                  <span className="text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            {/* Success / Error feedback */}
            {resendSuccess && (
              <div className="w-full flex items-center gap-2 rounded-xl border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm text-green-700">
                <Icon name="check-circle-bold" size={16} />
                Verification email sent! Check your inbox.
              </div>
            )}
            {resendError && (
              <div className="w-full flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <Icon name="danger-triangle-bold" size={16} />
                {resendError}
              </div>
            )}

            {/* Resend button */}
            <GButton
              onClick={handleResend}
              loading={isResending}
              disabled={resendCooldown > 0 || isResending}
              variant="outline"
              className="w-full"
            >
              <Icon name="refresh-bold" size={16} />
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : isResending
                  ? 'Sending...'
                  : 'Resend Verification Link'}
            </GButton>

            {/* Logout */}
            <GButton
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              <Icon name="logout-3-broken" size={16} />
              Log out
            </GButton>

            {/* Footer note */}
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Once you click the link in your email, this page will automatically redirect you to your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
