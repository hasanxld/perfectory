"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { SiteShell } from "@/components/site-shell"
import { GButton, GCard, GTextarea, SectionLabel } from "@/components/ui-kit"
import { Icon } from "@/components/icon"
import { useAuth } from "@/lib/auth-context"
import { spendCredit } from "@/lib/user-store"
import { saveGeneration } from "@/lib/generation-store"
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

  const handleGenerate = useCallback(async () => {
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
      // Save generation to history
      const langCode = lang as "en-US" | "bn-BD" | "hi-IN"
      const langMap = { "en-US": "en", "bn-BD": "bn", "hi-IN": "hi" } as const
      try {
        await saveGeneration(user.uid, {
          text: text.trim(),
          language: langMap[langCode],
          voice: voiceURI,
          pitch,
          rate,
        })
      } catch (err) {
        console.error("[v0] Failed to save generation:", err)
      }
    }
    tts.speak({ text, lang, voiceURI, rate, pitch, volume })
  }, [text, user, credits, tts, lang, voiceURI, rate, pitch, volume, refreshProfile])

  const noVoiceForLang = langVoices.length === 0

  return (
    <SiteShell>
      <div className="animate-fade-up">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-2">
            <Icon name="microphone-3-bold" size={14} className="text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voice Generator</span>
          </div>
          <h1 className="mt-8 text-5xl font-bold sm:text-6xl">Text to Voice</h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Bangla, English & Hindi. Type your text, tune the voice, and generate.
          </p>
        </div>

        {/* credits bar */}
        {user && (
          <div className="mx-auto mt-10 flex max-w-4xl items-center justify-between rounded-2xl border border-border/50 bg-muted/20 px-6 py-4">
            <span className="flex items-center gap-3 text-sm">
              <Icon name="bolt-bold" size={20} className="text-brand-1" />
              <span className="font-mono text-lg font-semibold">{credits}</span>
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

        <div className="mx-auto mt-10 max-w-4xl">
          {/* main editor container - glassmorphic */}
          <div className="rounded-3xl border border-border/40 bg-muted/10 p-8 backdrop-blur-lg">
            {/* language selector */}
            <div className="mb-6 inline-flex gap-3 rounded-2xl bg-muted/30 p-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition",
                    lang === l.code
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>

            {/* text editor */}
            <GTextarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={SAMPLES[lang]}
              rows={8}
              className="mt-4 rounded-2xl border border-border/30 bg-muted/40 text-base"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <button
                onClick={() => setText(SAMPLES[lang])}
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <Icon name="magic-stick-3-bold" size={14} />
                Insert sample
              </button>
              <span className="font-mono">{chars} chars</span>
            </div>

            {/* animated waveform */}
            <div className="mt-6 flex h-20 items-center justify-center gap-1 overflow-hidden rounded-2xl border border-border/30 bg-muted/50">
              {Array.from({ length: 48 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full gradient-brand"
                  style={{
                    height: tts.speaking ? undefined : "12px",
                    transformOrigin: "center",
                    animation: tts.speaking
                      ? `wave 1s ease-in-out ${i * 0.03}s infinite`
                      : "none",
                    minHeight: tts.speaking ? "40px" : "10px",
                  }}
                />
              ))}
            </div>

            {/* generate button */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <GButton onClick={handleGenerate} disabled={!canGenerate} className="flex-1 min-w-[160px] rounded-2xl">
                <Icon name={tts.speaking ? "soundwave-bold" : "play-bold"} size={20} />
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
              <p className="mt-6 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <Icon name="danger-triangle-bold" size={18} />
                {notice}
              </p>
            )}
            {!user && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link href="/signup" className="gradient-text font-semibold">Sign up</Link> to save credits and unlock more.
              </p>
            )}
          </div>

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
