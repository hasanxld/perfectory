"use client"

import Link from "next/link"
import { SiteShell } from "@/components/site-shell"
import { RequireAuth } from "@/components/require-auth"
import { GButton, GCard } from "@/components/ui-kit"
import { Icon } from "@/components/icon"
import { useAuth } from "@/lib/auth-context"
import { STARTING_CREDITS } from "@/lib/user-store"

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
  const { profile } = useAuth()
  if (!profile) return null

  const planLabel =
    profile.plan === "free" ? "Free" : profile.plan === "monthly" ? "Monthly" : "Yearly"
  const usedPct = Math.min(100, Math.round((profile.credits / (STARTING_CREDITS * 4)) * 100))

  const stats = [
    { icon: "bolt-bold", label: "Credits", value: profile.credits.toLocaleString(), accent: true },
    { icon: "crown-bold", label: "Plan", value: planLabel },
    { icon: "translation-2-bold", label: "Languages", value: "3" },
    { icon: profile.isPublic ? "eye-bold" : "eye-closed-bold", label: "Profile", value: profile.isPublic ? "Public" : "Private" },
  ]

  return (
    <div className="animate-fade-up">
      {/* welcome */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{profile.name}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">@{profile.username}</p>
        </div>
        <Link href="/generator">
          <GButton size="lg">
            <Icon name="microphone-3-bold" size={20} />
            New Generation
          </GButton>
        </Link>
      </div>

      {/* stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <GCard key={s.label} className="flex items-center gap-4">
            <span
              className={`grid size-12 place-items-center rounded-2xl ${
                s.accent ? "gradient-brand text-primary-foreground" : "border border-border text-brand-1"
              }`}
            >
              <Icon name={s.icon} size={24} />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl">{s.value}</p>
            </div>
          </GCard>
        ))}
      </div>

      {/* credits meter */}
      <GCard className="mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="bolt-circle-bold" size={22} className="text-brand-1" />
            <h2 className="text-lg">Credit balance</h2>
          </div>
          <Link href="/plans">
            <GButton size="sm" variant="outline">
              <Icon name="add-circle-bold" size={16} />
              Get more
            </GButton>
          </Link>
        </div>
        <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full gradient-brand transition-all" style={{ width: `${usedPct}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          You have <span className="font-mono text-foreground">{profile.credits}</span> credits.
          Each voice generation costs 1 credit.
        </p>
      </GCard>

      {/* quick actions */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <QuickAction href="/generator" icon="microphone-3-bold" title="Voice Generator" desc="Create speech in Bangla, English or Hindi." />
        <QuickAction href="/profile/edit" icon="user-id-bold" title="Edit Profile" desc="Update your name, bio and avatar." />
        <QuickAction href={`/u/${profile.username}`} icon="user-circle-bold" title="Public Profile" desc="See how visitors view your profile." />
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon,
  title,
  desc,
}: {
  href: string
  icon: string
  title: string
  desc: string
}) {
  return (
    <Link href={href}>
      <GCard className="h-full transition hover:-translate-y-1">
        <span className="grid size-11 place-items-center rounded-2xl border border-border text-brand-2">
          <Icon name={icon} size={22} />
        </span>
        <h3 className="mt-4 text-lg">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm text-brand-1">
          Open <Icon name="arrow-right-broken" size={16} />
        </span>
      </GCard>
    </Link>
  )
}
