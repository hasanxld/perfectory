"use client"

import { Icon as Iconify } from "@iconify/react"
import { cn } from "@/lib/utils"

/**
 * Solar icon set (https://iconbuddy.com/solar) via Iconify.
 * Pass the icon name without the "solar:" prefix, e.g. <Icon name="home-2-bold" />
 */
export function Icon({
  name,
  className,
  size = 20,
}: {
  name: string
  className?: string
  size?: number
}) {
  return (
    <Iconify
      icon={`solar:${name}`}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    />
  )
}
