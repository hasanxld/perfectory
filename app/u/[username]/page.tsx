"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { SiteShell } from "@/components/site-shell"
import { GButton, GCard } from "@/components/ui-kit"
import { Icon } from "@/components/icon"
import { type UserProfile } from "@/lib/firestore-service"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase-config"
import { collection, query, where, getDocs } from "firebase/firestore"

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = use(params)
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [state, setState] = useState<"loading" | "found" | "notfound" | "private">("loading")

  useEffect(() => {
    let active = true
    const loadProfile = async () => {
      try {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('username', '==', username))
        const snapshot = await getDocs(q)
        const p = snapshot.empty ? null : (snapshot.docs[0].data() as UserProfile)
        if (!active) return
        if (!p) setState("notfound")
        else setState("found")
      } catch (error) {
        console.error('[Profile] Error loading profile:', error)
        setState("notfound")
      }
    }
    loadProfile()
    return () => {
      active = false
    }
  }, [username])

  useEffect(() => {
    let active = true
    const loadProfile = async () => {
      try {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('username', '==', username))
        const snapshot = await getDocs(q)
        const p = snapshot.empty ? null : (snapshot.docs[0].data() as UserProfile)
        if (!active) return
        if (!p) setState("notfound")
        else {
          setProfile(p)
          setState("found")
        }
      } catch (error) {
        console.error('[Profile] Error loading profile:', error)
        if (active) setState("notfound")
      }
    }
    loadProfile()
    return () => {
      active = false
    }
  }, [username, user])

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl animate-fade-up">
        {state === "loading" && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Icon name="refresh-bold" size={32} className="animate-spin text-brand-1" />
          </div>
        )}

        {state === "notfound" && (
          <GCard className="flex flex-col items-center py-16 text-center">
            <Icon name="user-cross-bold" size={48} className="text-muted-foreground" />
            <h1 className="mt-4 text-2xl">Profile not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No user exists with the username @{username}.
            </p>
            <Link href="/" className="mt-6">
              <GButton variant="outline">
                <Icon name="home-2-bold" size={18} />
                Go home
              </GButton>
            </Link>
          </GCard>
        )}

        {state === "private" && (
          <GCard className="flex flex-col items-center py-16 text-center">
            <Icon name="lock-keyhole-bold" size={48} className="text-brand-2" />
            <h1 className="mt-4 text-2xl">This profile is private</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              @{username} has chosen to keep their profile hidden.
            </p>
          </GCard>
        )}

        {state === "found" && profile && (
          <>
            {/* banner */}
            <GCard className="relative overflow-hidden">
              <div className="absolute inset-0 -z-10 gradient-brand opacity-10" />
              <div className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:text-left">
                {profile.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photoURL || "/placeholder.svg"}
                    alt={profile.name}
                    className="size-24 rounded-3xl object-cover ring-2 ring-brand-1/50"
                  />
                ) : (
                  <span className="grid size-24 place-items-center rounded-3xl gradient-brand text-3xl text-primary-foreground">
                    {profile.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl">{profile.name}</h1>
                  <p className="mt-1 font-mono text-sm text-muted-foreground">@{profile.username}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Badge icon="crown-bold" label={`${planLabel(profile.plan)} plan`} />
                    <Badge icon="translation-2-bold" label="Bangla · English · Hindi" />
                  </div>
                </div>
              </div>
            </GCard>

            {/* bio */}
            <GCard className="mt-6">
              <h2 className="flex items-center gap-2 text-lg">
                <Icon name="notebook-bold" size={20} className="text-brand-2" />
                About
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {profile.bio || "This user hasn't written a bio yet."}
              </p>
            </GCard>

            {/* cta */}
            <GCard className="mt-6 flex flex-col items-center gap-4 py-8 text-center">
              <Icon name="microphone-3-bold" size={36} className="text-brand-1" />
              <p className="max-w-sm text-sm text-muted-foreground">
                {profile.name} creates voice content with Perfectory Voice. Try it yourself.
              </p>
              <Link href="/generator">
                <GButton>
                  <Icon name="soundwave-bold" size={18} />
                  Open Voice Generator
                </GButton>
              </Link>
            </GCard>

            {user?.uid === profile.uid && (
              <Link href="/profile/edit" className="mt-6 block">
                <GButton variant="outline" className="w-full">
                  <Icon name="pen-bold" size={18} />
                  Edit my profile
                </GButton>
              </Link>
            )}
          </>
        )}
      </div>
    </SiteShell>
  )
}

function planLabel(plan: string) {
  return plan === "free" ? "Free" : plan === "monthly" ? "Monthly" : "Yearly"
}

function Badge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
      <Icon name={icon} size={14} className="text-brand-1" />
      {label}
    </span>
  )
}
