'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { applyActionCode, checkActionCode } from '@/lib/firebase-config'
import { auth } from '@/lib/firebase-config'
import { SiteShell } from '@/components/site-shell'
import { GCard } from '@/components/ui-kit'
import { Icon } from '@/components/icon'
import { updateEmailVerificationStatus } from '@/lib/firestore-service'

function VerifyEmailCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const oobCode = searchParams.get('oobCode')
        const mode = searchParams.get('mode')

        if (!oobCode) {
          setStatus('error')
          setMessage('Invalid verification link. Please try again.')
          setTimeout(() => router.push('/verify-email'), 3000)
          return
        }

        if (mode === 'verifyEmail') {
          const info = await checkActionCode(auth, oobCode)

          if (info.operation !== 'VERIFY_EMAIL') {
            throw new Error('Invalid verification operation')
          }

          await applyActionCode(auth, oobCode)

          if (auth.currentUser) {
            await updateEmailVerificationStatus(auth.currentUser.uid, true)
            await auth.currentUser.getIdTokenResult(true)
          }

          setStatus('success')
          setMessage('Email verified successfully! Redirecting to dashboard...')
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          setStatus('error')
          setMessage('Invalid verification link. Please try again.')
          setTimeout(() => router.push('/verify-email'), 3000)
        }
      } catch (err) {
        const error = err as { code?: string }
        if (error.code === 'auth/invalid-action-code') {
          setMessage('This verification link has expired. Please request a new one.')
        } else if (error.code === 'auth/user-token-expired') {
          setMessage('Session expired. Please log in again.')
        } else {
          setMessage('Verification failed. Please try again or contact support.')
        }
        setStatus('error')
        setTimeout(() => router.push('/verify-email'), 3000)
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <SiteShell>
      <main className="flex min-h-screen items-center justify-center px-4">
        <GCard className="w-full max-w-md text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Icon name="refresh-bold" size={32} className="animate-spin text-brand-1" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-600/10">
                <Icon name="check-circle-bold" size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
                <Icon name="x-circle-bold" size={32} className="text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-destructive">Verification Failed</h2>
              <p className="text-sm text-muted-foreground">{message}</p>
              <p className="mt-4 text-xs text-muted-foreground">Redirecting...</p>
            </div>
          )}
        </GCard>
      </main>
    </SiteShell>
  )
}

export default function VerifyEmailCallbackPage() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <main className="flex min-h-screen items-center justify-center px-4">
            <GCard className="w-full max-w-md text-center">
              <div className="flex flex-col items-center gap-4">
                <Icon name="refresh-bold" size={32} className="animate-spin text-brand-1" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </GCard>
          </main>
        </SiteShell>
      }
    >
      <VerifyEmailCallbackContent />
    </Suspense>
  )
}
