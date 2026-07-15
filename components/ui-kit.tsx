"use client"

import { cn } from "@/lib/utils"
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react"

/* Gradient "cutting" button with clipped corner + shine sweep */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

export const GButton = forwardRef<HTMLButtonElement, BtnProps>(
  ({ className, variant = "solid", size = "md", loading, children, disabled, ...props }, ref) => {
    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-sm",
      lg: "h-13 px-8 text-base",
    }
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl font-medium tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
          "[clip-path:polygon(14px_0,100%_0,100%_calc(100%-14px),calc(100%-14px)_100%,0_100%,0_14px)]",
          sizes[size],
          variant === "solid" &&
            "gradient-brand text-primary-foreground border border-border shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/15 hover:-translate-y-0.5",
          variant === "outline" &&
            "gradient-border text-foreground hover:-translate-y-0.5",
          variant === "ghost" &&
            "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
          className,
        )}
        {...props}
      >
        {variant === "solid" && (
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}
        {loading && (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  },
)
GButton.displayName = "GButton"

export const GInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-input/60 px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-transparent focus:ring-2 focus:ring-brand-1/70",
        className,
      )}
      {...props}
    />
  ),
)
GInput.displayName = "GInput"

export const GTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-border bg-input/60 p-4 text-sm leading-relaxed text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-transparent focus:ring-2 focus:ring-brand-1/70",
        className,
      )}
      {...props}
    />
  ),
)
GTextarea.displayName = "GTextarea"

/* Card with gradient hairline border + clipped corner */
export function GCard({
  children,
  className,
  cut = true,
}: {
  children: ReactNode
  className?: string
  cut?: boolean
}) {
  return (
    <div
      className={cn(
        "gradient-border rounded-3xl p-6",
        cut &&
          "[clip-path:polygon(22px_0,100%_0,100%_calc(100%-22px),calc(100%-22px)_100%,0_100%,0_22px)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium tracking-widest text-muted-foreground uppercase">
      {children}
    </span>
  )
}
