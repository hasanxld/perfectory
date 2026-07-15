import Link from "next/link"
import { Icon } from "./icon"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center rounded-xl gradient-brand text-primary-foreground shadow-lg shadow-brand-2/30 [clip-path:polygon(20%_0,100%_0,100%_80%,80%_100%,0_100%,0_20%)]">
        <Icon name="soundwave-bold" size={20} />
      </span>
      {showText && (
        <span className="text-lg font-normal tracking-wide">
          Perfectory<span className="gradient-text"> Voice</span>
        </span>
      )}
    </Link>
  )
}
