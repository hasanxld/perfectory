'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '@/lib/firebase-config'
import { useAuth } from '@/lib/auth-context'
import { GButton } from '@/components/ui-kit'
import { Icon } from '@/components/icon'
import { Logo } from '@/components/logo'
import { canResendVerificationEmail, updateEmailVerificationSentTime } from '@/lib/firestore-service'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, profile, loading, profileLoading, refreshProfile } = useAuth()
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)
  const [checkingVerify, setCheckingVerify] = useState(false)

  // Redirect logic
  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (profile?.emailVerified) {
      router.replace('/dashboard')
    }
  }, [loading, profileLoading, user, profile, router])

  // Poll Firebase Auth every 4s to auto-detect when user clicks the link
  useEffect(() => {
    if (!user) return
    const interval = setInterval(async () => {
      try {
        if (!auth.currentUser) return
        await auth.currentUser.reload()
        if (auth.currentUser.emailVerified) {
          await refreshProfile()
          router.replace('/dashboard')
        }
      } catch {
        // silent
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [user, router, refreshProfile])

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((p) => Math.max(0, p - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const handleResend = useCallback(async () => {
    if (!user || !auth.currentUser) return
    setResendError('')
    setResendSuccess(false)
    setIsResending(true)
    try {
      const { canResend, nextResendTime } = await canResendVerificationEmail(user.uid)
      if (!canResend && nextResendTime) {
        setResendCooldown(nextResendTime)
        setResendError(`Please wait ${nextResendTime}s before resending.`)
        return
      }
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      })
      try { await updateEmailVerificationSentTime(user.uid) } catch (_) { /* ignore */ }
      setResendSuccess(true)
      setResendCooldown(60)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch {
      setResendError('Failed to send email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }, [user])

  const handleCheckNow = useCallback(async () => {
    if (!auth.currentUser) return
    setCheckingVerify(true)
    try {
      await auth.currentUser.reload()
      if (auth.currentUser.emailVerified) {
        await refreshProfile()
        router.replace('/dashboard')
      } else {
        setResendError('Email not verified yet. Please check your inbox and click the link.')
        setTimeout(() => setResendError(''), 4000)
      }
    } catch {
      setResendError('Could not check status. Please try again.')
    } finally {
      setCheckingVerify(false)
    }
  }, [router, refreshProfile])

  const handleLogout = useCallback(async () => {
    const { signOut } = await import('firebase/auth')
    await signOut(auth)
    router.replace('/login')
  }, [router])

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="size-8 animate-spin rounded-full border-2 border-brand-1 border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">

      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-10%] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-brand-1/15 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[400px] w-[400px] rounded-full bg-brand-2/10 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-5%] h-[300px] w-[300px] rounded-full bg-brand-3/10 blur-[90px]" />
      </div>

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo showText />
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-black/10">

          {/* Top accent bar */}
          <div className="h-1 w-full gradient-brand" />

          <div className="flex flex-col items-center gap-6 p-8">

            {/* Animated envelope icon */}
            <div className="relative">
              <div className="flex size-24 items-center justify-center rounded-full bg-brand-1/10 ring-8 ring-brand-1/5">
                <div className="animate-float">
                  <Icon name="letter-bold" size={44} className="text-brand-1" />
                </div>
              </div>
              {/* Pulse ring */}
              <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-brand-1/30" />
              {/* Small check badge */}
              <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-card bg-brand-1">
                <Icon name="check-circle-bold" size={14} className="text-white" />
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We sent a verification link to
              </p>
              <div className="inline-flex items-center gap-2 rounded-xl border border-brand-1/20 bg-brand-1/5 px-4 py-2">
                <Icon name="user-bold" size={14} className="text-brand-1 shrink-0" />
                <span className="font-mono text-sm font-semibold text-foreground break-all">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Step instructions */}
            <div className="w-full rounded-2xl border border-border bg-secondary/20 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                How to verify
              </p>
              <div className="space-y-3">
                {([
                  { num: '1', text: 'Open your email inbox' },
                  { num: '2', text: 'Find the email from Perfectory Voice' },
                  { num: '3', text: 'Check Spam / Junk if you don\'t see it' },
                  { num: '4', text: 'Click "Verify email address" in the email' },
                ] as const).map(({ num, text }) => (
                  <div key={num} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white">
                      {num}
                    </span>
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-check notice */}
            <div className="flex w-full items-center gap-2 rounded-xl border border-brand-1/20 bg-brand-1/5 px-4 py-2.5 text-xs text-brand-1">
              <span className="size-1.5 animate-pulse rounded-full bg-brand-1" />
              This page checks automatically every few seconds
            </div>

            {/* Feedback banners */}
            {resendSuccess && (
              <div className="flex w-full items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600">
                <Icon name="check-circle-bold" size={16} />
                Verification email sent! Check your inbox.
              </div>
            )}
            {resendError && (
              <div className="flex w-full items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <Icon name="danger-triangle-bold" size={16} />
                {resendError}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex w-full flex-col gap-3">
              {/* Check now */}
              <GButton
                onClick={handleCheckNow}
                loading={checkingVerify}
                disabled={checkingVerify || isResending}
                className="w-full"
              >
                <Icon name="refresh-bold" size={16} />
                {checkingVerify ? 'Checking...' : 'I\'ve verified — check now'}
              </GButton>

              {/* Resend */}
              <GButton
                onClick={handleResend}
                loading={isResending}
                disabled={resendCooldown > 0 || isResending || checkingVerify}
                variant="outline"
                className="w-full"
              >
                <Icon name="letter-bold" size={16} />
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend verification email'}
              </GButton>

              {/* Log out */}
              <GButton
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                <Icon name="logout-3-broken" size={16} />
                Log out &amp; use a different account
              </GButton>
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Didn&apos;t receive anything? Check your spam folder or{' '}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-brand-1 underline-offset-2 hover:underline disabled:opacity-50"
          >
            resend the email
          </button>
          .
        </p>

      </div>
    </div>
  )
}
