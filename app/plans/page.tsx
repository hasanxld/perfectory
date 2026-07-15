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
    price: 0,
    credits: 50,
    dailyCredits: 5,
    icon: "gift-bold",
    highlight: false,
    gradient: "from-blue-400 to-blue-600",
    features: ["50 starter credits", "5 daily credits", "All 3 languages", "Standard voices", "Browser playback"],
  },
  {
    id: "monthly" as const,
    name: "Monthly Pack",
    price: 9,
    credits: 1000,
    dailyCredits: 33,
    icon: "crown-bold",
    highlight: true,
    gradient: "from-purple-400 to-pink-600",
    features: ["1,000 credits / month", "33+ daily credits", "All 3 languages", "Priority voices", "Pitch & speed control", "Public profile badge"],
  },
  {
    id: "yearly" as const,
    name: "Yearly Pack",
    price: 90,
    credits: 15000,
    dailyCredits: 41,
    icon: "star-bold",
    highlight: false,
    gradient: "from-amber-400 to-orange-600",
    features: ["15,000 credits / year", "41+ daily credits", "Everything in Monthly", "2 months free", "Early access features"],
  },
]

export default function PlansPage() {
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
          Simple, transparent credits. Get daily credits with every plan.
        </p>
      </section>

      <section className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = profile?.plan === p.id
          return (
            <div
              key={p.id}
              className={cn(
                "relative flex flex-col items-center text-center rounded-3xl p-6 transition hover:-translate-y-1",
                "bg-gradient-to-br border border-white/20 text-white shadow-lg",
                p.gradient,
                p.highlight && "md:-translate-y-3 md:hover:-translate-y-4 md:ring-2 md:ring-white/50",
              )}
            >
              {p.highlight && (
                <span className="absolute right-6 top-6 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-[11px] font-medium text-white">
                  Most Popular
                </span>
              )}
              <span className="grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur text-white">
                <Icon name={p.icon} size={24} />
              </span>
              <h3 className="mt-5 text-2xl font-bold">{p.name}</h3>
              <div className="mt-3 flex items-end justify-center gap-1">
                <span className="text-5xl font-bold">${p.price}</span>
                <span className="mb-1 text-sm text-white/80">
                  /{p.id === "free" ? "forever" : p.id === "monthly" ? "month" : "year"}
                </span>
              </div>
              <p className="mt-3 text-sm text-white/90">
                <span className="font-mono font-bold">{p.dailyCredits}+</span> daily credits
              </p>
              <p className="text-sm text-white/80">
                <span className="font-mono">{p.credits.toLocaleString()}</span> total
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center justify-center gap-2 text-sm text-white/90">
                    <Icon name="check-circle-bold" size={18} className="flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => choose(p.id, p.credits)}
                disabled={isCurrent || busy === p.id}
                className={cn(
                  "mt-8 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-medium transition-all duration-300",
                  "gradient-brand text-primary-foreground border border-border shadow-md shadow-black/10",
                  "hover:shadow-lg hover:shadow-black/15 hover:-translate-y-0.5 disabled:opacity-60",
                  "[clip-path:polygon(14px_0,100%_0,100%_calc(100%-14px),calc(100%-14px)_100%,0_100%,0_14px)]",
                )}
              >
                {isCurrent ? "Current Plan" : p.id === "free" ? "Get Started" : "Choose Plan"}
              </button>
            </div>
          )
        })}
      </section>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Demo billing — selecting a plan instantly grants credits for testing.
      </p>
    </SiteShell>
  )
}
