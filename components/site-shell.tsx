"use client"

import { useState, type ReactNode, memo, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Icon } from "./icon"
import { Logo } from "./logo"
import { GButton } from "./ui-kit"
import { cn } from "@/lib/utils"

type NavItem = { label: string; href: string; icon: string }

const guestNav: NavItem[] = [
  { label: "Home", href: "/", icon: "home-2-bold" },
  { label: "Generator", href: "/generator", icon: "microphone-3-bold" },
  { label: "Plans", href: "/plans", icon: "crown-bold" },
  { label: "Login", href: "/login", icon: "login-3-bold" },
]

const userNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "widget-5-bold" },
  { label: "Voice Generator", href: "/generator", icon: "microphone-3-bold" },
  { label: "Plans", href: "/plans", icon: "crown-bold" },
  { label: "Edit Profile", href: "/profile/edit", icon: "user-id-bold" },
]

export function SiteShell({ children }: { children: ReactNode }) {
  const { user, profile, logout, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const nav = user ? userNav : guestNav

  async function handleLogout() {
    await logout()
    setOpen(false)
    router.push("/")
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* optimized static background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 grid-lines opacity-20" />
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand-2/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-[28rem] rounded-full bg-brand-3/8 blur-3xl" />
      </div>

      {/* header */}
      <header className="sticky top-0 z-40 border-b border-border glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="grid size-10 place-items-center rounded-xl border border-border text-muted-foreground transition hover:text-foreground lg:hidden"
              aria-label="Open menu"
            >
              <Icon name="hamburger-menu-broken" size={22} />
            </button>
            <Logo />
          </div>

          {/* desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition",
                  pathname === item.href
                    ? "gradient-border text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="size-10 animate-pulse rounded-xl bg-secondary" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="hidden items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm sm:flex"
                >
                  <Icon name="bolt-bold" size={16} className="text-brand-1" />
                  <span className="font-mono">{profile?.credits ?? 0}</span>
                  <span className="text-muted-foreground">credits</span>
                </Link>
                <Avatar profile={profile} />
                <GButton size="sm" variant="outline" onClick={handleLogout} className="hidden sm:inline-flex">
                  <Icon name="logout-3-broken" size={16} />
                  Logout
                </GButton>
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <GButton size="sm" variant="ghost">Login</GButton>
                </Link>
                <Link href="/signup">
                  <GButton size="sm">Get Started</GButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* mobile sidebar */}
      {open && (
        <button
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border glass p-5 transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground"
            aria-label="Close menu"
          >
            <Icon name="close-circle-broken" size={20} />
          </button>
        </div>

        {user && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-3">
            <Avatar profile={profile} />
            <div className="min-w-0">
              <p className="truncate text-sm">{profile?.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                @{profile?.username}
              </p>
            </div>
          </div>
        )}

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                pathname === item.href
                  ? "gradient-brand text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </Link>
          ))}
          {user && (
            <Link
              href={`/u/${profile?.username ?? ""}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
            >
              <Icon name="user-circle-bold" size={20} />
              My Public Profile
            </Link>
          )}
        </nav>

        {user ? (
          <GButton variant="outline" onClick={handleLogout} className="mt-auto w-full">
            <Icon name="logout-3-broken" size={18} />
            Logout
          </GButton>
        ) : (
          <div className="mt-auto flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)}>
              <GButton variant="outline" className="w-full">Login</GButton>
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)}>
              <GButton className="w-full">Sign Up Free</GButton>
            </Link>
          </div>
        )}
      </aside>

      {/* main */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        {children}
      </main>

      <SiteFooter />
    </div>
  )
}

const Avatar = memo(function Avatar({ profile }: { profile: { displayName?: string; avatarUrl?: string } | null }) {
  if (profile?.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatarUrl || "/placeholder.svg"}
        alt={profile.displayName ?? "Avatar"}
        className="size-10 rounded-xl object-cover ring-2 ring-brand-1/40"
      />
    )
  }
  return (
    <span className="grid size-10 place-items-center rounded-xl gradient-brand text-sm font-medium text-primary-foreground">
      {(profile?.displayName ?? "U").slice(0, 1).toUpperCase()}
    </span>
  )
})

const FooterCol = memo(function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
})

function SiteFooter() {
  const [email, setEmail] = useState("")
  
  return (
    <footer className="relative z-10 mt-10 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Top section with logo and newsletter */}
        <div className="mb-12 grid gap-8 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Advanced AI text-to-voice studio supporting Bangla, English and Hindi.
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium">Subscribe to our Newsletter</p>
            <p className="mt-2 text-xs text-muted-foreground">Get updates on new features and improvements.</p>
            <div className="mt-4 flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 flex-1 rounded-2xl border border-border bg-gradient-to-b from-card to-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-brand-1 focus:ring-2 focus:ring-brand-1/20 hover:border-border/80"
              />
              <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-6 py-3 font-medium transition-all duration-300 gradient-brand text-primary-foreground border border-border shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/15 hover:-translate-y-0.5 [clip-path:polygon(14px_0,100%_0,100%_calc(100%-14px),calc(100%-14px)_100%,0_100%,0_14px)]">
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Main footer sections grid - 3 columns on all devices */}
        <div className="mb-12 grid grid-cols-3 gap-8">
          <FooterCol
            title="Product"
            links={[
              { label: "Generator", href: "/generator" },
              { label: "Plans", href: "/plans" },
              { label: "Dashboard", href: "/dashboard" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Contact", href: "#" },
              { label: "FAQ", href: "#" },
            ]}
          />
          <div>
            <p className="text-sm font-medium mb-4">Resources</p>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground transition hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground transition hover:text-foreground">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <p>© {new Date().getFullYear()} Perfectory Voice. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
