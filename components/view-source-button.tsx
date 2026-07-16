'use client'

import { useState, useCallback, useEffect } from 'react'
import { Icon } from '@/components/icon'

// ─── Sign Up Button HTML + CSS ────────────────────────────────────────────────
const SIGNUP_BUTTON_CODE = `<button class="grdb-btn">Sign Up</button>

<style>
.grdb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  font-family: 'Share Tech', ui-sans-serif, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: oklch(0.22 0 0);
  border-radius: 14px;
  border: 1px solid oklch(0.36 0.05 275 / 55%);
  background-image: linear-gradient(
    180deg,
    oklch(1 0 0) 0%,
    oklch(0.95 0 0) 42%,
    oklch(0.84 0 0) 100%
  );
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;
}

.grdb-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.grdb-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
</style>`

// ─── Generate Guest Header + Sidebar standalone HTML ─────────────────────────
function buildGuestHeaderCode(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Perfectory Voice – Header</title>
<style>
  /* ── Reset & Base ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-family: 'Share Tech', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  body { background: oklch(0.97 0 0); color: oklch(0.22 0 0); }
  a { text-decoration: none; color: inherit; }

  /* ── Design Tokens ── */
  :root {
    --bg:        oklch(0.97 0 0);
    --fg:        oklch(0.22 0 0);
    --card:      oklch(1 0 0);
    --border:    oklch(0.36 0.05 275 / 55%);
    --muted:     oklch(0.72 0.03 275);
    --brand-1:   oklch(0.72 0.16 200);
    --radius:    1rem;
  }

  /* ── Gradient helpers ── */
  .gradient-brand {
    background-image: linear-gradient(180deg, oklch(1 0 0) 0%, oklch(0.95 0 0) 42%, oklch(0.84 0 0) 100%);
  }
  .glass {
    background: linear-gradient(135deg,
      color-mix(in oklch, oklch(1 0 0) 90%, transparent),
      color-mix(in oklch, oklch(1 0 0) 80%, transparent)
    );
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid color-mix(in oklch, white 40%, transparent);
  }

  /* ── Header ── */
  .site-header {
    position: sticky;
    top: 0;
    z-index: 40;
    border-bottom: 1px solid var(--border);
  }
  .header-inner {
    max-width: 1280px;
    margin: 0 auto;
    height: 64px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .header-left { display: flex; align-items: center; gap: 12px; }

  /* ── Logo ── */
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 500;
  }
  .logo-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background-image: linear-gradient(180deg, oklch(1 0 0) 0%, oklch(0.84 0 0) 100%);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  .logo-text span { color: var(--muted); font-weight: 400; }

  /* ── Hamburger ── */
  .hamburger {
    width: 40px; height: 40px;
    display: none;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: none;
    cursor: pointer;
    color: var(--muted);
    transition: color 0.15s;
  }
  .hamburger:hover { color: var(--fg); }
  @media (max-width: 1023px) { .hamburger { display: flex; } }

  /* ── Desktop Nav ── */
  .desktop-nav {
    display: none;
    align-items: center;
    gap: 4px;
  }
  @media (min-width: 1024px) { .desktop-nav { display: flex; } }
  .desktop-nav a {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 12px;
    font-size: 14px;
    color: var(--muted);
    transition: color 0.15s;
  }
  .desktop-nav a:hover { color: var(--fg); }
  .desktop-nav a.active {
    color: var(--fg);
    background: linear-gradient(135deg, color-mix(in oklch, var(--card) 95%, white), var(--card));
    border: 1px solid color-mix(in oklch, var(--border) 80%, white);
  }

  /* ── Header Actions ── */
  .header-actions { display: flex; align-items: center; gap: 8px; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 36px;
    padding: 0 16px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    white-space: nowrap;
  }
  .btn-ghost {
    border: none;
    background: none;
    color: var(--muted);
  }
  .btn-ghost:hover { color: var(--fg); }
  .btn-solid {
    border: 1px solid var(--border);
    background-image: linear-gradient(180deg, oklch(1 0 0) 0%, oklch(0.95 0 0) 42%, oklch(0.84 0 0) 100%);
    color: var(--fg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    clip-path: polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);
  }
  .btn-solid:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.11); }
  @media (max-width: 639px) { .btn-ghost { display: none; } }

  /* ── Sidebar Overlay ── */
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  .sidebar-overlay.open { display: block; }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 50;
    width: 288px;
    display: flex;
    flex-direction: column;
    padding: 20px;
    border-right: 1px solid var(--border);
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .sidebar.open { transform: translateX(0); }
  @media (min-width: 1024px) { .sidebar { display: none; } }

  .sidebar-head { display: flex; align-items: center; justify-content: space-between; }
  .close-btn {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: none;
    cursor: pointer;
    color: var(--muted);
  }

  .sidebar-nav {
    margin-top: 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .sidebar-nav a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    color: var(--muted);
    transition: background 0.15s, color 0.15s;
  }
  .sidebar-nav a:hover { background: oklch(0.28 0.05 275 / 25%); color: var(--fg); }
  .sidebar-nav a.active {
    background-image: linear-gradient(180deg, oklch(1 0 0) 0%, oklch(0.84 0 0) 100%);
    color: var(--fg);
  }
  .nav-icon { width: 20px; height: 20px; opacity: 0.75; }

  .sidebar-footer { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }
  .sidebar-footer .btn { width: 100%; height: 44px; font-size: 14px; justify-content: center; }
  .btn-outline {
    border: 1px solid var(--border);
    background: none;
    color: var(--fg);
    border-radius: 14px;
  }
  .btn-outline:hover { background: oklch(0.28 0.05 275 / 20%); }
</style>
</head>
<body>

<!-- ── Header ── -->
<header class="site-header glass">
  <div class="header-inner">
    <div class="header-left">
      <button class="hamburger" id="menuBtn" aria-label="Open menu">
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-width="1.8" d="M4 6h16M4 12h16M4 18h10"/>
        </svg>
      </button>
      <a href="/" class="logo">
        <div class="logo-icon">🎙</div>
        <span class="logo-text">Perfectory <span>Voice</span></span>
      </a>
    </div>

    <nav class="desktop-nav">
      <a href="/" class="active">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        Home
      </a>
      <a href="/generator">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        Generator
      </a>
      <a href="/plans">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.1-2h9.8l.9-5.1-3.4 3.5L12 7l-2.4 5.4L6.2 8.9 7.1 14z"/></svg>
        Plans
      </a>
      <a href="/login">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>
        Login
      </a>
    </nav>

    <div class="header-actions">
      <a href="/login">
        <button class="btn btn-ghost">Login</button>
      </a>
      <a href="/signup">
        <button class="btn btn-solid">Sign Up</button>
      </a>
    </div>
  </div>
</header>

<!-- ── Sidebar Overlay ── -->
<div class="sidebar-overlay" id="overlay" onclick="closeSidebar()"></div>

<!-- ── Sidebar ── -->
<aside class="sidebar glass" id="sidebar">
  <div class="sidebar-head">
    <a href="/" class="logo">
      <div class="logo-icon">🎙</div>
      <span class="logo-text">Perfectory <span>Voice</span></span>
    </a>
    <button class="close-btn" onclick="closeSidebar()" aria-label="Close menu">
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-width="1.8" d="M18 6 6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>

  <nav class="sidebar-nav">
    <a href="/" class="active">
      <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      Home
    </a>
    <a href="/generator">
      <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
      Generator
    </a>
    <a href="/plans">
      <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.1-2h9.8l.9-5.1-3.4 3.5L12 7l-2.4 5.4L6.2 8.9 7.1 14z"/></svg>
      Plans
    </a>
    <a href="/login">
      <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>
      Login
    </a>
  </nav>

  <div class="sidebar-footer">
    <a href="/login">
      <button class="btn btn-outline">Login</button>
    </a>
    <a href="/signup">
      <button class="btn btn-solid" style="width:100%;height:44px;font-size:14px;">Sign Up Free</button>
    </a>
  </div>
</aside>

<!-- Demo content -->
<div style="max-width:1280px;margin:0 auto;padding:60px 24px;text-align:center;">
  <h1 style="font-size:clamp(1.8rem,5vw,3rem);font-weight:500;line-height:1.2;">
    Perfectory Voice<br/>
    <span style="color:oklch(0.72 0.03 275);font-weight:400;">AI Text-to-Voice Studio</span>
  </h1>
  <p style="margin-top:16px;color:oklch(0.72 0.03 275);font-size:15px;">
    Resize the window to see the responsive sidebar in action.
  </p>
</div>

<script>
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('overlay');
  const menuBtn  = document.getElementById('menuBtn');

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', openSidebar);

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSidebar();
  });
</script>
</body>
</html>`
}

// ─── Panel config ─────────────────────────────────────────────────────────────
const PANELS = [
  {
    id: 'live',
    label: 'Full Page HTML',
    icon: 'document-code-bold' as const,
    description: 'Live rendered HTML of the current page',
    dynamic: true,
  },
  {
    id: 'signup-btn',
    label: 'Sign Up Button',
    icon: 'cursor-bold' as const,
    description: 'White gradient button HTML + CSS',
    dynamic: false,
    code: SIGNUP_BUTTON_CODE,
  },
  {
    id: 'header',
    label: 'Guest Header + Sidebar',
    icon: 'widget-5-bold' as const,
    description: 'Standalone responsive header & sidebar HTML/CSS/JS',
    dynamic: false,
    code: buildGuestHeaderCode(),
  },
]

export function ViewSourceButton() {
  const [open, setOpen] = useState(false)
  const [activePanel, setActivePanel] = useState('live')
  const [liveHtml, setLiveHtml] = useState('')
  const [copied, setCopied] = useState(false)

  const currentPanel = PANELS.find(p => p.id === activePanel)!
  const currentCode = currentPanel.dynamic ? liveHtml : (currentPanel as any).code as string

  const handleOpen = useCallback(() => {
    setLiveHtml(document.documentElement.outerHTML)
    setActivePanel('live')
    setCopied(false)
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    setCopied(false)
  }, [])

  // Refresh live HTML whenever panel switches to it
  useEffect(() => {
    if (open && activePanel === 'live') {
      setLiveHtml(document.documentElement.outerHTML)
    }
  }, [open, activePanel])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentCode)
    } catch {
      const el = document.createElement('textarea')
      el.value = currentCode
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [currentCode])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
  }, [handleClose])

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={handleOpen}
        aria-label="View page source HTML"
        className="fixed bottom-6 right-6 z-[9998] flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background/90 text-muted-foreground shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-1/60 hover:text-brand-1 hover:shadow-brand-1/20"
      >
        <Icon name="code-bold" size={20} />
      </button>

      {/* Full-screen overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-background"
          onKeyDown={handleKeyDown}
        >
          {/* Top bar */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-1/10">
                <Icon name="code-bold" size={16} className="text-brand-1" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Code Viewer</p>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {currentPanel.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/50 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <Icon name="close-circle-broken" size={18} />
              </button>
            </div>
          </div>

          {/* Tab strip */}
          <div className="flex shrink-0 gap-1 border-b border-border bg-secondary/20 px-4 pt-2">
            {PANELS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setActivePanel(p.id); setCopied(false) }}
                className={`flex items-center gap-2 rounded-t-xl border border-b-0 px-4 py-2.5 text-xs transition-all ${
                  activePanel === p.id
                    ? 'border-border bg-background text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={p.icon} size={13} />
                {p.label}
              </button>
            ))}
          </div>

          {/* Code textarea */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex h-8 shrink-0 items-center border-b border-border bg-secondary/10 px-4">
              <p className="font-mono text-[10px] text-muted-foreground">
                {currentPanel.label}
              </p>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                {currentCode.split('\n').length.toLocaleString()} lines
                &nbsp;·&nbsp;
                {(new Blob([currentCode]).size / 1024).toFixed(1)} KB
              </span>
            </div>
            <textarea
              readOnly
              value={currentCode}
              spellCheck={false}
              className="h-full w-full flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-foreground/80 outline-none selection:bg-brand-1/20"
            />
          </div>
        </div>
      )}
    </>
  )
}
