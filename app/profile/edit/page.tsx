"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SiteShell } from "@/components/site-shell"
import { RequireAuth } from "@/components/require-auth"
import { GButton, GCard, GInput, GTextarea } from "@/components/ui-kit"
import { Icon } from "@/components/icon"
import { useAuth } from "@/lib/auth-context"
import { updateUserProfile, getProfileByUsername } from "@/lib/user-store"

export default function EditProfilePage() {
  return (
    <SiteShell>
      <RequireAuth>
        <EditProfileContent />
      </RequireAuth>
    </SiteShell>
  )
}

function EditProfileContent() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [photoURL, setPhotoURL] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setUsername(profile.username)
      setBio(profile.bio)
      setPhotoURL(profile.photoURL)
      setIsPublic(profile.isPublic)
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile) return
    setMsg(null)
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9-]/g, "")
    if (cleanUsername.length < 3) {
      setMsg({ type: "err", text: "Username must be at least 3 characters (a-z, 0-9, -)." })
      return
    }
    setSaving(true)
    try {
      if (cleanUsername !== profile.username) {
        const existing = await getProfileByUsername(cleanUsername)
        if (existing && existing.uid !== user.uid) {
          setMsg({ type: "err", text: "That username is already taken." })
          setSaving(false)
          return
        }
      }
      await updateUserProfile(user.uid, {
        name,
        username: cleanUsername,
        bio,
        photoURL,
        isPublic,
      })
      await refreshProfile()
      setMsg({ type: "ok", text: "Profile updated successfully." })
    } catch {
      setMsg({ type: "err", text: "Could not save. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return null

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="grid size-10 place-items-center rounded-xl border border-border text-muted-foreground hover:text-foreground"
        >
          <Icon name="arrow-left-broken" size={20} />
        </Link>
        <div>
          <h1 className="text-3xl">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your public identity</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-8">
        <GCard className="flex flex-col gap-5">
          {/* avatar preview */}
          <div className="flex items-center gap-4">
            {photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoURL || "/placeholder.svg"} alt="Avatar" className="size-16 rounded-2xl object-cover ring-2 ring-brand-1/40" />
            ) : (
              <span className="grid size-16 place-items-center rounded-2xl gradient-brand text-xl text-primary-foreground">
                {name.slice(0, 1).toUpperCase() || "U"}
              </span>
            )}
            <div className="flex-1">
              <label className="mb-1.5 block text-sm text-muted-foreground">Avatar image URL</label>
              <GInput
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://…/avatar.png"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-muted-foreground">Full name</label>
            <GInput value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-muted-foreground">Username</label>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-gradient-to-b from-card to-background px-4 transition-all focus-within:border-brand-1 focus-within:ring-2 focus-within:ring-brand-1/20 hover:border-border/80">
              <span className="text-muted-foreground">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 flex-1 bg-transparent text-sm outline-none"
                required
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Your public profile: /u/{username || "username"}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-muted-foreground">Bio</label>
            <GTextarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell visitors about yourself…"
            />
          </div>

          {/* public toggle */}
          <button
            type="button"
            onClick={() => setIsPublic((p) => !p)}
            className="flex items-center justify-between rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-left"
          >
            <span className="flex items-center gap-3">
              <Icon name={isPublic ? "eye-bold" : "eye-closed-bold"} size={20} className="text-brand-1" />
              <span>
                <span className="block text-sm">Public profile</span>
                <span className="block text-xs text-muted-foreground">
                  Allow anyone to visit your profile page
                </span>
              </span>
            </span>
            <span
              className={`relative h-6 w-11 rounded-full transition ${isPublic ? "gradient-brand" : "bg-secondary"}`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-background transition-all ${isPublic ? "left-[22px]" : "left-0.5"}`}
              />
            </span>
          </button>

          {msg && (
            <p
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                msg.type === "ok"
                  ? "border-brand-1/40 bg-brand-1/10 text-brand-1"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              <Icon name={msg.type === "ok" ? "check-circle-bold" : "danger-triangle-bold"} size={18} />
              {msg.text}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <GButton type="submit" loading={saving} className="flex-1">
              <Icon name="diskette-bold" size={18} />
              Save Changes
            </GButton>
            <Link href={`/u/${profile.username}`} className="flex-1">
              <GButton type="button" variant="outline" className="w-full">
                <Icon name="eye-bold" size={18} />
                View Public Profile
              </GButton>
            </Link>
          </div>
        </GCard>
      </form>
    </div>
  )
}
