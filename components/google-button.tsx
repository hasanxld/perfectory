"use client"

import { GButton } from "./ui-kit"

export function GoogleButton({
  onClick,
  loading,
  label,
}: {
  onClick: () => void
  loading?: boolean
  label: string
}) {
  return (
    <GButton variant="outline" className="w-full" onClick={onClick} loading={loading} type="button">
      {!loading && (
        <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 4.1 29.3 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22c0-1.2-.1-2.3-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 4.1 29.3 2 24 2 15.6 2 8.3 6.9 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 46c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 37.1 26.7 38 24 38c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C8.2 41.1 15.5 46 24 46z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.2 5.2C39.9 40 44 34.5 44 24c0-1.2-.1-2.3-.4-3.5z" />
        </svg>
      )}
      {label}
    </GButton>
  )
}
