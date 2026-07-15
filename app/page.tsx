import Link from "next/link"
import { SiteShell } from "@/components/site-shell"
import { GButton, GCard, SectionLabel } from "@/components/ui-kit"
import { Icon } from "@/components/icon"

const features = [
  {
    icon: "translation-2-bold",
    title: "3 Languages",
    desc: "Native Bangla, English and Hindi speech synthesis in one studio.",
  },
  {
    icon: "tuning-4-bold",
    title: "Full Control",
    desc: "Fine-tune pitch, speed and volume for the perfect delivery.",
  },
  {
    icon: "download-minimalistic-bold",
    title: "Instant Playback",
    desc: "Generate and preview your voice instantly, right in the browser.",
  },
  {
    icon: "bolt-circle-bold",
    title: "Credits System",
    desc: "Fair, transparent credits. Upgrade any time for more power.",
  },
]

const steps = [
  { icon: "pen-new-square-bold", title: "Type your text", desc: "Paste or write in Bangla, English or Hindi." },
  { icon: "microphone-3-bold", title: "Pick a voice", desc: "Choose language, voice and tuning options." },
  { icon: "play-circle-bold", title: "Generate & play", desc: "Hear natural speech instantly and reuse it." },
]

export default function HomePage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="flex flex-col items-center text-center animate-fade-up">
        <SectionLabel>
          <Icon name="stars-bold" size={14} className="text-brand-1" />
          AI Text to Voice Studio
        </SectionLabel>
        <h1 className="mt-6 max-w-3xl text-balance text-4xl leading-tight sm:text-5xl md:text-6xl">
          Turn your words into{" "}
          <span className="gradient-text">natural voice</span> in Bangla,
          English & Hindi
        </h1>
        <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          Perfectory Voice is an advanced text-to-speech studio with a beautiful
          gradient interface, precise controls and a fair credit system.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/generator">
            <GButton size="lg">
              <Icon name="microphone-3-bold" size={20} />
              Start Generating
            </GButton>
          </Link>
          <Link href="/plans">
            <GButton size="lg" variant="outline">
              <Icon name="crown-bold" size={20} />
              View Plans
            </GButton>
          </Link>
        </div>

        {/* waveform preview */}
        <div className="mt-14 w-full max-w-3xl">
          <GCard className="flex items-center justify-center gap-1.5 overflow-hidden py-10">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full gradient-brand"
                style={{
                  height: `${20 + Math.abs(Math.sin(i * 0.7)) * 60}px`,
                  animation: `wave 1.1s ease-in-out ${i * 0.04}s infinite`,
                }}
              />
            ))}
          </GCard>
        </div>
      </section>

      {/* Features bento */}
      <section className="mt-24">
        <div className="flex flex-col items-center text-center">
          <SectionLabel>Why Perfectory</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl">Built for creators</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <GCard key={f.title} className="transition hover:-translate-y-1">
              <span className="grid size-12 place-items-center rounded-2xl gradient-brand text-primary-foreground">
                <Icon name={f.icon} size={24} />
              </span>
              <h3 className="mt-5 text-lg">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </GCard>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="mt-24">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { native: "বাংলা", label: "Bangla", desc: "Warm, expressive Bengali voices." },
            { native: "English", label: "English", desc: "Crystal clear global English." },
            { native: "हिन्दी", label: "Hindi", desc: "Natural, fluent Hindi delivery." },
          ].map((l) => (
            <GCard key={l.label} className="text-center">
              <p className="gradient-text text-4xl">{l.native}</p>
              <p className="mt-3 text-sm font-medium">{l.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
            </GCard>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-24">
        <div className="flex flex-col items-center text-center">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl">Three simple steps</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <GCard key={s.title}>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl border border-border font-mono text-brand-1">
                  {i + 1}
                </span>
                <Icon name={s.icon} size={26} className="text-brand-2" />
              </div>
              <h3 className="mt-5 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </GCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24">
        <GCard className="relative overflow-hidden py-14 text-center">
          <div className="absolute inset-0 -z-10 gradient-brand opacity-10" />
          <h2 className="text-3xl sm:text-4xl">Ready to give your text a voice?</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Create a free account and get 50 credits to start generating today.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/signup">
              <GButton size="lg">
                <Icon name="rocket-2-bold" size={20} />
                Create Free Account
              </GButton>
            </Link>
          </div>
        </GCard>
      </section>
    </SiteShell>
  )
}
