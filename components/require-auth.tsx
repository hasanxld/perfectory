"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Icon } from "./icon"

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.replace("/login")
      return
    }
    
    if (!profile?.emailVerified) {
      router.replace("/verify-email")
      return
    }
  }, [loading, user, profile, router])

  if (loading || !user || !profile?.emailVerified) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Icon name="refresh-bold" size={32} className="animate-spin text-brand-1" />
        <p className="text-sm">Loading your studio…</p>
      </div>
    )
  }
  return <>{children}</>
}
