"use client"

import { Icon as Iconify } from "@iconify/react"
import { addCollection } from "@iconify/react"
import { cn } from "@/lib/utils"

/**
 * Solar icon set (https://iconbuddy.com/solar) via Iconify.
 * Pass the icon name without the "solar:" prefix, e.g. <Icon name="home-2-bold" />
 */

// Preload all icons used in the application
const icons = [
  "add-circle-bold",
  "alt-arrow-down-bold",
  "arrow-left-broken",
  "arrow-right-broken",
  "bolt-bold",
  "bolt-circle-bold",
  "check-circle-bold",
  "close-circle-broken",
  "crown-bold",
  "danger-triangle-bold",
  "diskette-bold",
  "eye-bold",
  "gift-bold",
  "hamburger-menu-broken",
  "home-2-bold",
  "info-circle-bold",
  "lock-keyhole-bold",
  "login-3-bold",
  "logout-3-broken",
  "magic-stick-3-bold",
  "microphone-3-bold",
  "notebook-bold",
  "pause-bold",
  "pen-bold",
  "play-bold",
  "refresh-bold",
  "rocket-2-bold",
  "soundwave-bold",
  "star-bold",
  "stars-bold",
  "stop-bold",
  "user-circle-bold",
  "user-cross-bold",
  "user-plus-bold",
  "user-speak-bold",
]

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
      data-preload={icons.includes(name)}
    />
  )
}
