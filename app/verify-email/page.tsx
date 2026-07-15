'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { sendEmailVerification, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase-config'
import { useAuth } from '@/lib/auth-context'
import { SiteShell } from '@/components/site-shell'
import { GButton, GCard } from '@/components/ui-kit'
import { Icon } from '@/components/icon'
import { canResendVerificationEmail, updateEmailVerificationSentTime } from '@/lib/firestore-service'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)

  // Redirect if not logged in or already verified
  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else if (profile?.emailVerified) {
      router.push('/dashboard')
    }
  }, [user, profile, router])

  // Check email verification status
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    const checkVerification = async () => {
      if (!auth.currentUser) return
      
      // Refresh token to get latest email verification status
      try {
        await auth.currentUser.getIdTokenResult(true)
        if (auth.currentUser.emailVerified) {
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('[VerifyEmail] Error checking verification:', err)
      }
    }

    // Check every 2 seconds
    interval = setInterval(checkVerification, 2000)
    return () => clearInterval(interval)
  }, [router])

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleResendEmail = useCallback(async () => {
    if (!user) return
    
    setResendError('')
    setResendSuccess(false)
    
    try {
      // Check if can resend
      const { canResend, nextResendTime } = await canResendVerificationEmail(user.uid)
      
      if (!canResend && nextResendTime) {
        setResendCooldown(nextResendTime)
        setResendError(`Please wait ${nextResendTime} seconds before resending`)
        return
      }

      setIsResending(true)
      
      // Send verification email
      await sendEmailVerification(user, {
        url: `${window.location.origin}/verify-email`,
      })

      // Update sent time
      await updateEmailVerificationSentTime(user.uid)

      setResendSuccess(true)
      setResendCooldown(60)

      // Clear success message after 3 seconds
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (err) {
      console.error('[VerifyEmail] Error resending email:', err)
      setResendError('Failed to send verification email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }, [user])

  const handleLogout = useCallback(async () => {
    await signOut(auth)
    router.push('/login')
  }, [router])

  if (!user || !profile) {
    return null
  }

  return (
    <SiteShell>
      <main className="flex min-h-screen items-center justify-center px-4">
        <GCard className="w-full max-w-md">
          <div className="flex flex-col items-center gap-6">
            {/* Success Icon */}
            <div className="flex size-16 items-center justify-center rounded-full bg-brand-1/10">
              <Icon name="check-circle-bold" size={32} className="text-brand-1" />
            </div>

            {/* Title and Description */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">Account Created!</h1>
              <p className="mt-2 text-muted-foreground">
                We&apos;ve sent a verification link to
              </p>
              <p className="font-mono text-sm font-medium text-brand-1 break-all">
                {user.email}
              </p>
            </div>

            {/* Instructions */}
            <div className="w-full space-y-3 rounded-lg bg-secondary/40 p-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <Icon name="check-bold" size={16} className="text-green-600" />
                Check your email
              </p>
              <p className="text-xs text-muted-foreground">
                Click the link in the email to verify your address and activate your free plan with 50 starter credits.
              </p>
              <p className="text-xs text-muted-foreground">
                Don&apos;t forget to check your spam folder if you don&apos;t see it!
              </p>
            </div>

            {/* Error Message */}
            {resendError && (
              <div className="w-full flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                <Icon name="danger-triangle-bold" size={16} />
                <span>{resendError}</span>
              </div>
            )}

            {/* Success Message */}
            {resendSuccess && (
              <div className="w-full flex items-center gap-2 rounded-lg border border-green-600/40 bg-green-600/10 px-4 py-3 text-xs text-green-600">
                <Icon name="check-circle-bold" size={16} />
                <span>Verification email sent successfully!</span>
              </div>
            )}

            {/* Resend Button */}
            <GButton
              onClick={handleResendEmail}
              disabled={resendCooldown > 0 || isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Link'}
            </GButton>

            {/* Logout Button */}
            <GButton
              onClick={handleLogout}
              variant="ghost"
              className="w-full"
            >
              <Icon name="sign-out-bold" size={16} />
              Log Out
            </GButton>

            {/* Additional Info */}
            <div className="text-center text-xs text-muted-foreground">
              <p>
                Verification link will expire in 24 hours. Once verified, you&apos;ll get instant access to your dashboard.
              </p>
            </div>
          </div>
        </GCard>
      </main>
    </SiteShell>
  )
}
