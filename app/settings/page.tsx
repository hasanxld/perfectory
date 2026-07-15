'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { updateAccountSettings, getAccountSettings, type AccountSettings } from '@/lib/firestore-service'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GButton } from '@/components/ui-kit'

export default function SettingsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<AccountSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user?.uid) {
      loadSettings()
    }
  }, [user, loading, router])

  const loadSettings = async () => {
    if (!user?.uid) return
    try {
      let accountSettings = await getAccountSettings(user.uid)
      if (!accountSettings) {
        // Create default settings if they don't exist
        accountSettings = {
          uid: user.uid,
          emailNotifications: true,
          marketingEmails: false,
          twoFactorEnabled: false,
          privacyLevel: 'private',
          dataRetention: 90,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }
      setSettings(accountSettings)
    } catch (error) {
      console.error('[Settings] Error loading settings:', error)
    }
  }

  const handleSaveSettings = async () => {
    if (!user?.uid || !settings) return

    try {
      setSaving(true)
      await updateAccountSettings(user.uid, settings)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('[Settings] Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brand-1"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
            <p className="mb-6 text-muted-foreground">Please log in to access your settings.</p>
            <Link href="/login">
              <GButton>Go to Login</GButton>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage your account preferences and security</p>
        </div>

        {/* Settings Card */}
        <div className="rounded-2xl border border-border bg-card p-8">
          {/* Tabs */}
          <div className="mb-8 flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-brand-1 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === 'privacy'
                  ? 'border-b-2 border-brand-1 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Privacy
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-4 px-4 font-medium transition-colors ${
                activeTab === 'security'
                  ? 'border-b-2 border-brand-1 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Security
            </button>
          </div>

          {/* Notifications Tab */}
          {activeTab === 'notifications' && settings && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Get notified about important updates</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                  className={`relative h-8 w-16 rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-brand-1' : 'bg-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                      settings.emailNotifications ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-6">
                <div>
                  <h3 className="font-medium text-foreground">Marketing Emails</h3>
                  <p className="text-sm text-muted-foreground">Receive updates about new features</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, marketingEmails: !settings.marketingEmails })}
                  className={`relative h-8 w-16 rounded-full transition-colors ${
                    settings.marketingEmails ? 'bg-brand-1' : 'bg-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                      settings.marketingEmails ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && settings && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-medium text-foreground">Privacy Level</h3>
                <div className="space-y-3">
                  {(['private', 'public'] as const).map((level) => (
                    <label key={level} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-input/50">
                      <input
                        type="radio"
                        name="privacyLevel"
                        value={level}
                        checked={settings.privacyLevel === level}
                        onChange={(e) =>
                          setSettings({ ...settings, privacyLevel: e.target.value as 'private' | 'public' })
                        }
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="font-medium text-foreground capitalize">{level}</p>
                        <p className="text-sm text-muted-foreground">
                          {level === 'private' ? 'Only you can see your profile' : 'Anyone can see your profile'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <label className="block">
                  <span className="font-medium text-foreground">Data Retention (days)</span>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={settings.dataRetention}
                    onChange={(e) => setSettings({ ...settings, dataRetention: parseInt(e.target.value) })}
                    className="mt-2 h-10 w-full rounded-lg border border-border bg-input/50 px-3 text-sm"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">How long we keep your data after deletion</p>
                </label>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && settings && (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, twoFactorEnabled: !settings.twoFactorEnabled })}
                  className={`relative h-8 w-16 rounded-full transition-colors ${
                    settings.twoFactorEnabled ? 'bg-brand-1' : 'bg-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                      settings.twoFactorEnabled ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="mb-4 font-medium text-foreground">Active Sessions</h3>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">You&apos;re currently logged in from this device</p>
                  <GButton className="mt-4 w-full" variant="outline">
                    Logout All Other Sessions
                  </GButton>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex gap-3 border-t border-border pt-6">
            <GButton onClick={handleSaveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </GButton>
            <button
              onClick={() => loadSettings()}
              className="px-6 py-3 font-medium text-muted-foreground hover:text-foreground rounded-2xl border border-border transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
