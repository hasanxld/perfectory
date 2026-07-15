"use client"

import { useCallback, useEffect, useRef, useState, useMemo } from "react"

export type LangCode = "bn-BD" | "en-US" | "hi-IN"

export const LANGUAGES: { code: LangCode; label: string; native: string; flag: string }[] = [
  { code: "bn-BD", label: "Bangla", native: "বাংলা", flag: "🇧🇩" },
  { code: "en-US", label: "English", native: "English", flag: "🇺🇸" },
  { code: "hi-IN", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
]

export function useTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [supported, setSupported] = useState(true)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false)
      return
    }
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  // Cache filtered voices per language to avoid recalculation
  const voicesForLang = useMemo(() => {
    const cache: Record<LangCode, SpeechSynthesisVoice[]> = {
      "bn-BD": [],
      "en-US": [],
      "hi-IN": [],
    }
    return (lang: LangCode) => {
      if (cache[lang].length > 0) return cache[lang]
      const base = lang.split("-")[0]
      const filtered = voices.filter(
        (v) => v.lang === lang || v.lang.toLowerCase().startsWith(base),
      )
      cache[lang] = filtered
      return filtered
    }
  }, [voices])

  const speak = useCallback(
    (opts: {
      text: string
      lang: LangCode
      voiceURI?: string
      rate?: number
      pitch?: number
      volume?: number
      onEnd?: () => void
    }) => {
      if (!("speechSynthesis" in window)) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(opts.text)
      u.lang = opts.lang
      u.rate = opts.rate ?? 1
      u.pitch = opts.pitch ?? 1
      u.volume = opts.volume ?? 1
      const match =
        voices.find((v) => v.voiceURI === opts.voiceURI) ??
        voicesForLang(opts.lang)[0]
      if (match) u.voice = match
      u.onstart = () => {
        setSpeaking(true)
        setPaused(false)
      }
      u.onend = () => {
        setSpeaking(false)
        setPaused(false)
        opts.onEnd?.()
      }
      u.onerror = () => {
        setSpeaking(false)
        setPaused(false)
      }
      utterRef.current = u
      window.speechSynthesis.speak(u)
    },
    [voices, voicesForLang],
  )

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
    setPaused(true)
  }, [])
  const resume = useCallback(() => {
    window.speechSynthesis.resume()
    setPaused(false)
  }, [])
  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }, [])

  return { voices, voicesForLang, speak, pause, resume, stop, speaking, paused, supported }
}
