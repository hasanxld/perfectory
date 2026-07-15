"use client"

import { useEffect, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Logo } from "./logo"
import { Icon } from "./icon"

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title: string
  subtitle: string
}) {
  const { user, profile, loading, profileLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading || profileLoading || !user) return
    // Only redirect fully verified users away from auth pages
    if (profile?.emailVerified) {
      router.replace("/dashboard")
    }
  }, [loading, profileLoading, user, profile, router])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="absolute left-1/2 top-0 size-[34rem] -translate-x-1/2 rounded-full bg-brand-2/25 blur-[130px]" />
        <div className="absolute left-0 top-1/2 h-px w-full cut-lines" />
      </div>

      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo showText />
          <h1 className="mt-6 text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="gradient-border rounded-3xl p-6 [clip-path:polygon(22px_0,100%_0,100%_calc(100%-22px),calc(100%-22px)_100%,0_100%,0_22px)] sm:p-8">
          {children}
        </div>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <Icon name="arrow-left-broken" size={16} />
          Back to home
        </Link>
      </div>
    </div>
  )
}
