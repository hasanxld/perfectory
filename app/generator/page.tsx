"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { SiteShell } from "@/components/site-shell"
import { GButton, GCard, GTextarea, SectionLabel } from "@/components/ui-kit"
import { Icon } from "@/components/icon"
import { useAuth } from "@/lib/auth-context"
import { spendCredit } from "@/lib/user-store"
import { useTTS, LANGUAGES, type LangCode } from "@/lib/use-tts"
import { cn } from "@/lib/utils"

const SAMPLES: Record<LangCode, string> = {
  "bn-BD": "স্বাগতম! পারফেক্টরি ভয়েসে আপনার লেখা সুন্দর কণ্ঠে রূপান্তর করুন।",
  "en-US": "Welcome to Perfectory Voice. Turn your text into natural speech instantly.",
  "hi-IN": "परफेक्टरी वॉइस में आपका स्वागत है। अपने टेक्स्ट को आवाज़ में बदलें।",
}

export default function GeneratorPage() {
  const { user, profile, refreshProfile } = useAuth()
  const tts = useTTS()

  const [lang, setLang] = useState<LangCode>("en-US")
  const [text, setText] = useState("")
  const [voiceURI, setVoiceURI] = useState<string>("")
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [notice, setNotice] = useState<string>("")

  const langVoices = useMemo(() => tts.voicesForLang(lang), [tts, lang])

  useEffect(() => {
    setVoiceURI(langVoices[0]?.voiceURI ?? "")
  }, [langVoices])

  const credits = profile?.credits ?? 0
  const canGenerate = user ? credits > 0 : true
  const chars = text.trim().length

  async function handleGenerate() {
    setNotice("")
    if (!text.trim()) {
      setNotice("Please enter some text first.")
      return
    }
    if (!tts.supported) {
      setNotice("Your browser does not support speech synthesis.")
      return
    }
    if (user && credits <= 0) {
      setNotice("You are out of credits. Upgrade your plan to continue.")
      return
    }
    if (user && !tts.speaking) {
      await spendCredit(user.uid, 1)
      await refreshProfile()
    }
    tts.speak({ text, lang, voiceURI, rate, pitch, volume })
  }

  const noVoiceForLang = langVoices.length === 0

  return (
    <SiteShell>
      <div className="animate-fade-up">
        <div className="flex flex-col items-center text-center">
          <SectionLabel>
            <Icon name="microphone-3-bold" size={14} className="text-brand-1" />
            Voice Generator
          </SectionLabel>
          <h1 className="mt-6 text-4xl sm:text-5xl">Text to Voice</h1>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Bangla, English & Hindi. Type your text, tune the voice, and generate.
          </p>
        </div>

        {/* credits bar */}
        {user && (
          <div className="mx-auto mt-8 flex max-w-4xl items-center justify-between rounded-2xl border border-border bg-secondary/40 px-5 py-3">
            <span className="flex items-center gap-2 text-sm">
              <Icon name="bolt-bold" size={18} className="text-brand-1" />
              <span className="font-mono text-lg">{credits}</span>
              <span className="text-muted-foreground">credits left</span>
            </span>
            <Link href="/plans">
              <GButton size="sm" variant="outline">
                <Icon name="add-circle-bold" size={16} />
                Get more
              </GButton>
            </Link>
          </div>
        )}

        <div className="mx-auto mt-6 grid max-w-4xl gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* editor */}
          <GCard className="flex min-w-0 flex-col">
            {/* language pills */}
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition",
                    lang === l.code
                      ? "gradient-brand border-transparent text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>

            <GTextarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={SAMPLES[lang]}
              rows={8}
              className="mt-4"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <button
                onClick={() => setText(SAMPLES[lang])}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Icon name="magic-stick-3-bold" size={14} />
                Insert sample
              </button>
              <span className="font-mono">{chars} chars</span>
            </div>

            {/* animated waveform */}
            <div className="mt-5 flex h-20 items-center justify-center gap-1 overflow-hidden rounded-2xl border border-border bg-background/40">
              {Array.from({ length: 48 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    height: tts.speaking ? undefined : "12px",
                    backgroundImage:
                      "linear-gradient(180deg, oklch(0.78 0 0) 0%, oklch(0.55 0 0) 55%, oklch(0.38 0 0) 100%)",
                    transformOrigin: "center",
                    animation: tts.speaking
                      ? `wave 1s ease-in-out ${i * 0.03}s infinite`
                      : "none",
                    minHeight: tts.speaking ? "40px" : "10px",
                  }}
                />
              ))}
            </div>

            {/* controls */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <GButton onClick={handleGenerate} disabled={!canGenerate} className="flex-1 min-w-[160px]">
                <Icon name={tts.speaking ? "soundwave-bold" : "play-circle-bold"} size={20} />
                {tts.speaking ? "Generating…" : "Generate Voice"}
              </GButton>
              {tts.speaking && !tts.paused && (
                <GButton variant="outline" onClick={tts.pause}>
                  <Icon name="pause-bold" size={18} />
                </GButton>
              )}
              {tts.paused && (
                <GButton variant="outline" onClick={tts.resume}>
                  <Icon name="play-bold" size={18} />
                </GButton>
              )}
              {tts.speaking && (
                <GButton variant="outline" onClick={tts.stop}>
                  <Icon name="stop-bold" size={18} />
                </GButton>
              )}
            </div>

            {notice && (
              <p className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <Icon name="danger-triangle-bold" size={18} />
                {notice}
              </p>
            )}
            {!user && (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                <Link href="/signup" className="gradient-text">Sign up</Link> to save credits and unlock more.
              </p>
            )}
          </GCard>

          {/* settings */}
          <GCard className="flex flex-col gap-6">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm">
                <Icon name="user-speak-bold" size={16} className="text-brand-2" />
                Voice
              </label>
              {noVoiceForLang ? (
                <p className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                  No {LANGUAGES.find((l) => l.code === lang)?.label} voice installed on this device. A default voice will be used.
                </p>
              ) : (
                <div className="relative">
                  <select
                    value={voiceURI}
                    onChange={(e) => setVoiceURI(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-border bg-input/60 px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-brand-1/70"
                  >
                    {langVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI} className="bg-card">
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <Icon name="alt-arrow-down-bold" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              )}
            </div>

            <Slider label="Speed" icon="round-arrow-right-bold" value={rate} min={0.5} max={2} step={0.1} onChange={setRate} suffix="x" />
            <Slider label="Pitch" icon="soundwave-bold" value={pitch} min={0} max={2} step={0.1} onChange={setPitch} />
            <Slider label="Volume" icon="volume-loud-bold" value={volume} min={0} max={1} step={0.1} onChange={setVolume} />

            <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-xs leading-relaxed text-muted-foreground">
              <p className="flex items-center gap-2 text-foreground">
                <Icon name="info-circle-bold" size={16} className="text-brand-1" />
                Tip
              </p>
              <p className="mt-2">
                Voice availability depends on your device. Install language packs in your OS settings for the best Bangla & Hindi voices.
              </p>
            </div>
          </GCard>
        </div>
      </div>
    </SiteShell>
  )
}

function Slider({
  label,
  icon,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
}: {
  label: string
  icon: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  suffix?: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <Icon name={icon} size={16} className="text-brand-2" />
          {label}
        </span>
        <span className="font-mono text-muted-foreground">
          {value.toFixed(1)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--brand-1)]"
      />
    </div>
  )
}
