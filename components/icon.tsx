"use client"

import { Icon as Iconify, addCollection } from "@iconify/react"
import { cn } from "@/lib/utils"
import solarIcons from "@/lib/solar-icons.json"

/**
 * Solar icon set (https://iconbuddy.com/solar) bundled OFFLINE.
 * Only the icons used across the app are shipped (see scripts/build-icons.mjs),
 * so every icon renders instantly with zero network requests.
 * Pass the icon name without the "solar:" prefix, e.g. <Icon name="home-2-bold" />
 */
// Register the bundled subset once at module load (runs a single time).
addCollection(solarIcons as Parameters<typeof addCollection>[0])

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
