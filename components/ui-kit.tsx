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
          sizes[size],
          variant === "solid" &&
            "gradient-brand text-primary-foreground border border-border shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 active:translate-y-0",
          variant === "outline" &&
            "border border-border text-foreground hover:-translate-y-0.5 active:translate-y-0",
          variant === "ghost" &&
            "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
          className,
        )}
        {...props}
      >
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
        "h-12 w-full rounded-2xl border border-border bg-gradient-to-b from-card to-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-brand-1 focus:ring-2 focus:ring-brand-1/20 hover:border-border/80",
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
        "w-full rounded-2xl border border-border bg-gradient-to-b from-card to-background p-4 text-sm leading-relaxed text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-brand-1 focus:ring-2 focus:ring-brand-1/20 hover:border-border/80",
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
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "gradient-border rounded-3xl p-6",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-1/30 bg-brand-1/10 px-4 py-1.5 text-xs font-medium tracking-widest text-brand-1 uppercase">
      {children}
    </span>
  )
}
