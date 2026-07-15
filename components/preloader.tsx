"use client"

import { useEffect, useState } from "react"

export function Preloader({ isLoading }: { isLoading: boolean }) {
  const [isVisible, setIsVisible] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true)
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300 ${
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-primary/5 to-accent/5 blur-3xl animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated logo/waveform */}
        <div className="flex items-center justify-center gap-0.5 h-16 w-full px-4 max-w-xs">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full flex-1"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, oklch(0.72 0.16 200) 0%, oklch(0.62 0.2 265) 50%, oklch(0.68 0.19 320) 100%)",
                animation: `wave 1.1s ease-in-out ${i * 0.04}s infinite`,
                height: `${20 + Math.abs(Math.sin(i * 0.7)) * 60}px`,
              }}
            />
          ))}
        </div>

        {/* Text and progress */}
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Perfectory Voice
            </h2>
            <p className="text-sm text-muted-foreground">
              Loading your voice generation studio...
            </p>
          </div>

          {/* Animated progress bar */}
          <div className="w-48 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full gradient-brand"
              style={{
                animation: "slideProgress 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground"
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.3);
          }
        }

        @keyframes slideProgress {
          0% {
            transform: translateX(-100%);
            width: 0;
          }
          50% {
            width: 100%;
          }
          100% {
            transform: translateX(100%);
            width: 0;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  )
}
