import { memo } from "react"
import Link from "next/link"
import { Logo } from "./logo"

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

export const SiteFooter = memo(function SiteFooter() {
  return (
    <footer className="relative z-10 mt-10 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Advanced AI text-to-voice studio supporting Bangla, English and Hindi.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            { label: "Generator", href: "/generator" },
            { label: "Plans", href: "/plans" },
            { label: "Dashboard", href: "/dashboard" },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { label: "Login", href: "/login" },
            { label: "Sign Up", href: "/signup" },
            { label: "Edit Profile", href: "/profile/edit" },
          ]}
        />
        <div>
          <p className="text-sm font-medium">Languages</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Bangla", "English", "Hindi"].map((l) => (
              <span
                key={l}
                className="rounded-lg border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Perfectory Voice. All rights reserved.</p>
          <p className="font-mono">Made with gradient love · Bangla · English · Hindi</p>
        </div>
      </div>
    </footer>
  )
})
