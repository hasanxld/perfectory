'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteShell } from '@/components/site-shell'
import { GButton, GCard, SectionLabel } from '@/components/ui-kit'
import { Icon } from '@/components/icon'
import { useAuth } from '@/lib/auth-context'
import { updateUserProfile, createSubscription, getUserSubscription } from '@/lib/firestore-service'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    price: 0,
    credits: 50,
    monthlyCredits: 50,
    icon: 'gift-bold',
    highlight: false,
    gradient: 'from-blue-400 to-blue-600',
    features: ['50 starter credits', 'Basic voices', 'All 3 languages', 'Standard quality', 'Download audio'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 9,
    credits: 500,
    monthlyCredits: 500,
    icon: 'crown-bold',
    highlight: true,
    gradient: 'from-purple-400 to-pink-600',
    features: ['500 monthly credits', 'Priority voices', 'All 3 languages', 'Premium quality', 'Faster processing', 'Advanced controls'],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: 29,
    credits: 2000,
    monthlyCredits: 2000,
    icon: 'star-bold',
    highlight: false,
    gradient: 'from-amber-400 to-orange-600',
    features: ['2000 monthly credits', 'All voices available', 'All 3 languages', 'Highest quality', 'Priority support', 'API access', 'Batch processing'],
  },
]

export default function PlansPage() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function upgradePlan(planId: 'free' | 'pro' | 'premium') {
    if (!user) {
      router.push('/signup')
      return
    }

    try {
      setBusy(planId)

      // Update user profile with new plan
      await updateUserProfile(user.uid, {
        plan: planId,
      })

      // Create or update subscription
      await createSubscription(user.uid, planId)

      // Refresh profile to get updated data
      await refreshProfile()

      router.push('/dashboard')
    } catch (error) {
      console.error('[Plans] Error upgrading plan:', error)
      alert('Failed to upgrade plan')
    } finally {
      setBusy(null)
    }
  }

  const currentPlan = profile?.plan || 'free'

  return (
    <SiteShell>
      <section className="flex flex-col items-center text-center animate-fade-up">
        <SectionLabel>
          <Icon name="crown-bold" size={14} className="text-brand-1" />
          Pricing Plans
        </SectionLabel>
        <h1 className="mt-6 text-4xl sm:text-5xl">Choose Your Plan</h1>
        <p className="mt-4 max-w-lg text-muted-foreground">
          Simple, transparent pricing. Only pay for what you use. Upgrade or downgrade anytime.
        </p>
      </section>

      {/* Plans Grid */}
      <section className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <GCard
            key={plan.id}
            className={cn('relative flex flex-col p-0 overflow-hidden transition-all hover:border-brand-1/50', plan.highlight && 'ring-2 ring-brand-1 md:scale-105')}
          >
            {/* Plan Header */}
            <div className={`bg-gradient-to-r ${plan.gradient} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                  <p className="mt-1 text-sm opacity-90">
                    ${plan.price}<span className="text-xs">/month</span>
                  </p>
                </div>
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20">
                  <Icon name={plan.icon} size={28} />
                </div>
              </div>
            </div>

            {/* Plan Content */}
            <div className="flex flex-1 flex-col p-6">
              {/* Credits */}
              <div className="mb-6 rounded-lg bg-brand-1/10 p-4">
                <p className="text-sm text-muted-foreground">Monthly Credits</p>
                <p className="text-3xl font-bold text-brand-1">{plan.monthlyCredits.toLocaleString()}</p>
              </div>

              {/* Features */}
              <div className="flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Icon name="check-bold" size={18} className="mt-0.5 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              {!user ? (
                <GButton
                  onClick={() => router.push('/signup')}
                  className="mt-6 w-full"
                >
                  Get Started
                </GButton>
              ) : (
                <>
                  <GButton
                    onClick={() => upgradePlan(plan.id)}
                    disabled={busy === plan.id || currentPlan === plan.id}
                    className={cn('mt-6 w-full', currentPlan === plan.id && 'opacity-50')}
                  >
                    {busy === plan.id ? 'Processing...' : currentPlan === plan.id ? 'Current Plan' : `Choose ${plan.name}`}
                  </GButton>

                  {currentPlan === plan.id && (
                    <p className="mt-2 text-center text-xs text-green-600 font-medium">✓ Currently active</p>
                  )}
                </>
              )}
            </div>
          </GCard>
        ))}
      </section>

      {/* FAQ Section */}
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>

        <div className="space-y-4">
          <details className="group rounded-2xl border border-border bg-card p-4 cursor-pointer">
            <summary className="flex items-center justify-between font-medium text-foreground">
              Can I change plans anytime?
              <Icon name="arrow-right-bold" size={20} className="transition-transform group-open:rotate-90" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </details>

          <details className="group rounded-2xl border border-border bg-card p-4 cursor-pointer">
            <summary className="flex items-center justify-between font-medium text-foreground">
              Do unused credits roll over?
              <Icon name="arrow-right-bold" size={20} className="transition-transform group-open:rotate-90" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              Pro and Premium plans include monthly credits that refresh each month. Unused credits don&apos;t roll over to the next month.
            </p>
          </details>

          <details className="group rounded-2xl border border-border bg-card p-4 cursor-pointer">
            <summary className="flex items-center justify-between font-medium text-foreground">
              What payment methods do you accept?
              <Icon name="arrow-right-bold" size={20} className="transition-transform group-open:rotate-90" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              We accept all major credit cards, PayPal, and other digital payment methods. All payments are securely processed.
            </p>
          </details>

          <details className="group rounded-2xl border border-border bg-card p-4 cursor-pointer">
            <summary className="flex items-center justify-between font-medium text-foreground">
              Can I get a refund?
              <Icon name="arrow-right-bold" size={20} className="transition-transform group-open:rotate-90" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              We offer a 14-day money-back guarantee. If you&apos;re not satisfied, we&apos;ll refund your purchase.
            </p>
          </details>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto mt-16 max-w-2xl rounded-2xl border border-brand-1/30 bg-gradient-to-r from-brand-1/5 to-brand-1/10 p-8 text-center">
        <h2 className="text-2xl font-bold">Ready to get started?</h2>
        <p className="mt-2 text-muted-foreground">Join thousands of users creating amazing voice content.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {!user ? (
            <>
              <GButton onClick={() => router.push('/signup')} size="lg">
                Sign Up Now
              </GButton>
              <GButton onClick={() => router.push('/login')} size="lg" variant="outline">
                Login
              </GButton>
            </>
          ) : (
            <GButton onClick={() => router.push('/dashboard')} size="lg">
              Go to Dashboard
            </GButton>
          )}
        </div>
      </section>
    </SiteShell>
  )
}
