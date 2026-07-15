'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SiteShell } from '@/components/site-shell'
import { RequireAuth } from '@/components/require-auth'
import { GButton, GCard, GInput, GTextarea } from '@/components/ui-kit'
import { Icon } from '@/components/icon'
import { useAuth } from '@/lib/auth-context'
import { updateUserProfile, checkUsernameAvailability } from '@/lib/firestore-service'

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
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(true)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName)
      setUsername(profile.username)
      setBio(profile.bio || '')
      setAvatarUrl(profile.avatarUrl || '')
    }
  }, [profile])

  // Check username availability
  const handleUsernameChange = async (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setUsername(clean)

    if (clean !== profile?.username && clean.length >= 3) {
      setCheckingUsername(true)
      try {
        const available = await checkUsernameAvailability(clean)
        setUsernameAvailable(available)
      } catch (error) {
        console.error('[Profile] Error checking username:', error)
      } finally {
        setCheckingUsername(false)
      }
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile) return

    setMsg(null)
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9-]/g, '')

    if (cleanUsername.length < 3) {
      setMsg({ type: 'err', text: 'Username must be at least 3 characters.' })
      return
    }

    if (!usernameAvailable && cleanUsername !== profile.username) {
      setMsg({ type: 'err', text: 'That username is already taken.' })
      return
    }

    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        displayName,
        username: cleanUsername,
        bio,
        avatarUrl,
      })
      await refreshProfile()
      setMsg({ type: 'ok', text: 'Profile updated successfully!' })
    } catch (error) {
      console.error('[Profile] Error saving:', error)
      setMsg({ type: 'err', text: 'Could not save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return null

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Link href="/dashboard" className="grid size-10 place-items-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="arrow-left-broken" size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your public identity and personal info</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Section */}
        <GCard className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-1/20 to-brand-1/10 overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <Icon name="user-circle-bold" size={40} className="text-brand-1" />
                )}
              </div>
              <div className="flex-1">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Avatar URL</span>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-2 h-10 w-full rounded-lg border border-border bg-input/50 px-3 text-sm focus:border-brand-1 focus:ring-2 focus:ring-brand-1/20"
                  />
                </label>
              </div>
            </div>
          </div>
        </GCard>

        {/* Profile Information */}
        <GCard className="space-y-5 p-6">
          <div>
            <label className="block">
              <span className="text-sm font-medium text-foreground">Display Name</span>
              <GInput
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your full name"
                className="mt-2"
              />
            </label>
          </div>

          <div>
            <label className="block">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                Username
                {checkingUsername && <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-brand-1" />}
                {!checkingUsername && username !== profile.username && username.length >= 3 && (
                  <span className={usernameAvailable ? 'text-green-600 text-xs' : 'text-red-600 text-xs'}>
                    {usernameAvailable ? '✓ Available' : '✗ Taken'}
                  </span>
                )}
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-gradient-to-b from-card to-background px-4 transition-all focus-within:border-brand-1 focus-within:ring-2 focus-within:ring-brand-1/20 hover:border-border/80">
                <span className="text-muted-foreground">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="username"
                  className="h-12 flex-1 bg-transparent text-sm outline-none"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">3-20 characters, letters, numbers, and hyphens only</p>
            </label>
          </div>

          <div>
            <label className="block">
              <span className="text-sm font-medium text-foreground">Bio</span>
              <GTextarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={160}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">{bio.length}/160 characters</p>
            </label>
          </div>
        </GCard>

        {/* Messages */}
        {msg && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              msg.type === 'ok'
                ? 'border-green-500/50 bg-green-500/10 text-green-600'
                : 'border-red-500/50 bg-red-500/10 text-red-600'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <GButton type="submit" disabled={saving || (!usernameAvailable && username !== profile.username)}>
            {saving ? 'Saving...' : 'Save Changes'}
          </GButton>
          <Link href="/dashboard" className="flex-1">
            <button className="w-full h-12 rounded-2xl border border-border text-muted-foreground hover:text-foreground font-medium transition-colors">
              Cancel
            </button>
          </Link>
        </div>

        {/* Account Links */}
        <GCard className="border-dashed p-6">
          <h3 className="mb-4 font-medium text-foreground">Account Management</h3>
          <div className="space-y-2">
            <Link href="/settings" className="flex items-center gap-2 rounded-lg p-2 hover:bg-input/50 transition-colors">
              <Icon name="setting-2-bold" size={18} className="text-muted-foreground" />
              <span className="text-sm">Settings & Preferences</span>
              <Icon name="arrow-right-bold" size={16} className="ml-auto text-muted-foreground" />
            </Link>
            <Link href="/profile/change-password" className="flex items-center gap-2 rounded-lg p-2 hover:bg-input/50 transition-colors">
              <Icon name="lock-bold" size={18} className="text-muted-foreground" />
              <span className="text-sm">Change Password</span>
              <Icon name="arrow-right-bold" size={16} className="ml-auto text-muted-foreground" />
            </Link>
            <button className="w-full flex items-center gap-2 rounded-lg p-2 hover:bg-red-500/10 transition-colors">
              <Icon name="logout-bold" size={18} className="text-red-600" />
              <span className="text-sm text-red-600">Delete Account</span>
              <Icon name="arrow-right-bold" size={16} className="ml-auto text-red-600" />
            </button>
          </div>
        </GCard>
      </form>
    </div>
  )
}
