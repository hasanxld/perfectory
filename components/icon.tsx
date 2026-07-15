"use client"

import { memo } from "react"
import { Icon as Iconify } from "@iconify/react"
import { cn } from "@/lib/utils"

/**
 * Solar icon set (https://iconbuddy.com/solar) via Iconify CDN.
 * Memoized to prevent unnecessary re-renders from parent updates.
 */
export const Icon = memo(function Icon({
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
      className={cn("shrink-0 inline-block", className)}
    />
  )
})
