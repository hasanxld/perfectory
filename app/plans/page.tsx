"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteShell } from "@/components/site-shell"
import { GButton, GCard, SectionLabel } from "@/components/ui-kit"
import { Icon } from "@/components/icon"
import { useAuth } from "@/lib/auth-context"
import { addCredits, updateUserProfile } from "@/lib/user-store"
import { cn } from "@/lib/utils"

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    credits: 50,
    icon: "gift-bold",
    highlight: false,
    features: ["50 starter credits", "All 3 languages", "Standard voices", "Browser playback"],
  },
  {
    id: "monthly" as const,
    name: "Monthly",
    price: { monthly: 9, yearly: 9 },
    credits: 1000,
    icon: "crown-bold",
    highlight: true,
    features: ["1,000 credits / month", "All 3 languages", "Priority voices", "Pitch & speed control", "Public profile badge"],
  },
  {
    id: "yearly" as const,
    name: "Yearly",
    price: { monthly: 90, yearly: 90 },
    credits: 15000,
    icon: "diamond-bold",
    highlight: false,
    features: ["15,000 credits / year", "Everything in Monthly", "2 months free", "Early access features"],
  },
]

export default function PlansPage() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly")
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function choose(planId: "free" | "monthly" | "yearly", credits: number) {
    if (!user) {
      router.push("/signup")
      return
    }
    setBusy(planId)
    await updateUserProfile(user.uid, { plan: planId })
    if (credits > 0) await addCredits(user.uid, credits)
    await refreshProfile()
    setBusy(null)
    router.push("/dashboard")
  }

  return (
    <SiteShell>
      <section className="flex flex-col items-center text-center animate-fade-up">
        <SectionLabel>
          <Icon name="crown-bold" size={14} className="text-brand-1" />
          Pricing
        </SectionLabel>
        <h1 className="mt-6 text-4xl sm:text-5xl">Choose your plan</h1>
        <p className="mt-4 max-w-lg text-muted-foreground">
          Simple, transparent credits. Upgrade or downgrade any time.
        </p>

        {/* cycle toggle */}
        <div className="mt-8 inline-flex rounded-2xl border border-border bg-secondary/40 p-1">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={cn(
                "rounded-xl px-6 py-2 text-sm capitalize transition",
                cycle === c
                  ? "gradient-brand text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
              {c === "yearly" && (
                <span className="ml-2 rounded-md bg-background/30 px-1.5 py-0.5 text-[10px]">
                  -17%
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = profile?.plan === p.id
          return (
            <GCard
              key={p.id}
              className={cn(
                "relative flex flex-col transition hover:-translate-y-1",
                p.highlight && "md:-translate-y-3 md:hover:-translate-y-4",
              )}
            >
              {p.highlight && (
                <span className="absolute right-5 top-5 rounded-full gradient-brand px-3 py-1 text-[11px] font-medium text-primary-foreground">
                  Popular
                </span>
              )}
              <span className="grid size-12 place-items-center rounded-2xl gradient-brand text-primary-foreground">
                <Icon name={p.icon} size={24} />
              </span>
              <h3 className="mt-5 text-xl">{p.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl">${p.price[cycle]}</span>
                <span className="mb-1 text-sm text-muted-foreground">
                  /{p.id === "free" ? "forever" : cycle === "yearly" ? "year" : "mo"}
                </span>
              </div>
              <p className="mt-2 font-mono text-sm text-brand-1">
                {p.credits.toLocaleString()} credits
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Icon name="check-circle-bold" size={18} className="mt-0.5 text-brand-1" />
                    {f}
                  </li>
                ))}
              </ul>
              <GButton
                onClick={() => choose(p.id, p.credits)}
                loading={busy === p.id}
                variant={p.highlight ? "solid" : "outline"}
                className="mt-8 w-full"
                disabled={isCurrent}
              >
                {isCurrent ? "Current Plan" : p.id === "free" ? "Get Started" : "Upgrade"}
              </GButton>
            </GCard>
          )
        })}
      </section>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Demo billing — selecting a plan instantly grants credits for testing.
      </p>
    </SiteShell>
  )
}
