'use client'

import { useState, useCallback } from 'react'
import { Icon } from '@/components/icon'

export function ViewSourceButton() {
  const [open, setOpen] = useState(false)
  const [html, setHtml] = useState('')
  const [copied, setCopied] = useState(false)

  const handleOpen = useCallback(() => {
    // Grab the live full HTML of the current page
    const raw = document.documentElement.outerHTML
    // Pretty-print with basic indentation
    setHtml(raw)
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    setCopied(false)
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = html
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [html])

  // Close on Escape key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
  }, [handleClose])

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={handleOpen}
        aria-label="View page source HTML"
        className="fixed bottom-6 right-6 z-[9998] flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background/90 text-muted-foreground shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-1/60 hover:text-brand-1 hover:shadow-brand-1/20"
      >
        <Icon name="code-bold" size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-background/95 backdrop-blur-sm"
          onKeyDown={handleKeyDown}
        >
          {/* Header bar */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-1/10">
                <Icon name="code-bold" size={16} className="text-brand-1" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Page Source</p>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {typeof window !== 'undefined' ? window.location.pathname : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="flex h-9 items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 text-xs transition-all hover:border-brand-1/50 hover:bg-brand-1/10 hover:text-brand-1"
              >
                {copied ? (
                  <>
                    <Icon name="check-circle-bold" size={14} className="text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Icon name="copy-bold" size={14} />
                    Copy HTML
                  </>
                )}
              </button>

              {/* Close button */}
              <button
                onClick={handleClose}
                aria-label="Close source viewer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/50 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <Icon name="close-circle-broken" size={18} />
              </button>
            </div>
          </div>

          {/* Code area */}
          <div className="relative flex-1 overflow-hidden">
            <textarea
              readOnly
              value={html}
              spellCheck={false}
              className="h-full w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-foreground/80 outline-none selection:bg-brand-1/20"
            />
          </div>

          {/* Footer with line count */}
          <div className="flex h-8 shrink-0 items-center border-t border-border px-4">
            <p className="font-mono text-[10px] text-muted-foreground">
              {html.split('\n').length.toLocaleString()} lines &nbsp;·&nbsp; {(new Blob([html]).size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      )}
    </>
  )
}
