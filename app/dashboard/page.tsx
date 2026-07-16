'use client'

import { useState, useEffect, memo, useMemo } from 'react'
import Link from 'next/link'
import { SiteShell } from '@/components/site-shell'
import { RequireAuth } from '@/components/require-auth'
import { GButton, GCard } from '@/components/ui-kit'
import { Icon } from '@/components/icon'
import { useAuth } from '@/lib/auth-context'
import { getGenerationHistory, type GenerationHistory } from '@/lib/firestore-service'

export default function DashboardPage() {
  return (
    <SiteShell>
      <RequireAuth>
        <DashboardContent />
      </RequireAuth>
    </SiteShell>
  )
}

function DashboardContent() {
  const { profile, user } = useAuth()
  const [history, setHistory] = useState<GenerationHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.uid) {
      loadHistory()
    }
  }, [user?.uid])

  const loadHistory = async () => {
    if (!user?.uid) return
    try {
      setLoading(true)
      const historyData = await getGenerationHistory(user.uid)
      setHistory(historyData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5))
    } catch (error) {
      console.error('[Dashboard] Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!profile) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-1" />
    </div>
  )

  const planLabel = useMemo(() => 
    profile.plan === 'free' ? 'Free' : profile.plan === 'pro' ? 'Pro' : 'Premium',
    [profile.plan]
  )
  
  const usedPct = useMemo(() => 
    Math.min(100, Math.round((profile.credits / 200) * 100)),
    [profile.credits]
  )

  const stats = useMemo(() => [
    { icon: 'bolt-bold', label: 'Credits', value: profile.credits.toLocaleString(), accent: true },
    { icon: 'crown-bold', label: 'Plan', value: planLabel },
    { icon: 'history-bold', label: 'Generations', value: history.length.toString() },
    { icon: 'heart-bold', label: 'Favorites', value: profile.favoriteVoices.length.toString() },
  ], [profile.credits, planLabel, history.length, profile.favoriteVoices.length])

  return (
    <div className="animate-fade-up">
      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{profile.displayName}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">@{profile.username}</p>
        </div>
        <Link href="/generator">
          <GButton size="lg">
            <Icon name="microphone-3-bold" size={20} />
            New Generation
          </GButton>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <GCard key={s.label} className="flex items-center gap-4">
            <span className={`grid size-12 place-items-center rounded-2xl ${s.accent ? 'gradient-brand text-primary-foreground' : 'border border-border text-brand-1'}`}>
              <Icon name={s.icon} size={24} />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl">{s.value}</p>
            </div>
          </GCard>
        ))}
      </div>

      {/* Credits Progress */}
      <GCard className="mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="bolt-circle-bold" size={22} className="text-brand-1" />
            <h2 className="text-lg">Credit Balance</h2>
          </div>
          <Link href="/plans">
            <GButton size="sm" variant="outline">
              <Icon name="add-circle-bold" size={16} />
              Get More
            </GButton>
          </Link>
        </div>
        <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full gradient-brand transition-all" style={{ width: `${usedPct}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          You have <span className="font-mono text-foreground">{profile.credits}</span> credits. Each voice generation costs 1 credit.
        </p>
      </GCard>

      {/* Recent Generations */}
      <GCard className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Icon name="history-bold" size={22} className="text-brand-1" />
            Recent Generations
          </h2>
          <Link href="/profile/generations" className="text-sm text-brand-1 hover:text-brand-1/80">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="mt-4 flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-brand-1"></div>
          </div>
        ) : history.length > 0 ? (
          <div className="mt-4 space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-start gap-4 rounded-lg border border-border p-3 hover:bg-input/30">
                <div className="mt-1 flex size-10 items-center justify-center rounded-lg bg-brand-1/10">
                  <Icon name="microphone-3-bold" size={18} className="text-brand-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-foreground">{item.text.substring(0, 50)}...</p>
                  <p className="text-xs text-muted-foreground">{item.voiceName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.creditsUsed} credits</span>
                  <button className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary">
                    <Icon name="play-circle-bold" size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center">
            <Icon name="microphone-3-bold" size={32} className="mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-muted-foreground">No generations yet. Start by creating your first voice!</p>
            <Link href="/generator" className="mt-3 inline-block">
              <GButton size="sm">Create Now</GButton>
            </Link>
          </div>
        )}
      </GCard>

      {/* Quick Actions */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <QuickAction href="/generator" icon="microphone-3-bold" title="Voice Generator" desc="Create speech in Bangla, English or Hindi." />
        <QuickAction href="/profile/edit" icon="user-id-bold" title="Edit Profile" desc="Update your name, bio and avatar." />
        <QuickAction href="/settings" icon="setting-2-bold" title="Settings" desc="Manage your account and preferences." />
      </div>
    </div>
  )
}

const QuickAction = memo(function QuickAction({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href}>
      <GCard className="flex cursor-pointer flex-col gap-3 hover:border-brand-1/50 transition-colors">
        <div className="flex size-10 items-center justify-center rounded-lg bg-brand-1/10">
          <Icon name={icon} size={18} className="text-brand-1" />
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </GCard>
    </Link>
  )
})
