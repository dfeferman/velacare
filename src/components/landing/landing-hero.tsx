import Image from 'next/image'
import Link from 'next/link'

/** Hero gemäß wireframes/01-startseite-hero-zuerst — Typo/Farben nach docs/velacare-brandbook.html */
const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDH7ZoCZc5ho2m8Sgd_45LRVBz_umuRz0uKtkX88chiUtjrepnOR3amTIaFKEODR5HRTuDFPBmfxwJ7HGmXaKHvLibRKezsYfL9CaCq57I4Zd2srJZ05uyEyn2pmePB6Q4WFQYTufFipnSJ6ZG-wj-Sf3pI0oYO8T01q-a3pidC7Qv80tcDF7x_VwHm3AIfj_TIvuT9M6e2Nxoe4SdiyUA2eY21aET3XI569Ir3jgjDuSWFr1avoILhQAuO2ePa1e3zISKG2NeHVdM'

export function LandingHero() {
  return (
    <section className="grid min-h-[calc(100vh-52px)] max-h-[860px] grid-cols-1 lg:grid-cols-2">
      {/* Links: Inhalt — warm-white / Cormorant + DM Sans */}
      <div className="relative flex flex-col justify-center overflow-hidden bg-warm-white p-8 md:p-16 lg:p-24">
        <div
          className="pointer-events-none absolute -bottom-[150px] -left-[100px] h-[500px] w-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201,107,63,0.05) 0%, transparent 70%)',
          }}
        />

        <div
          className="animate-fade-up mb-6 inline-flex items-center gap-2 self-start rounded-full border border-terra/20 bg-terra-pale px-3.5 py-1.5 text-xs font-medium text-terra-dark"
        >
          <span className="eyebrow-dot h-1.5 w-1.5 rounded-full bg-terra" />
          Gesetzlicher Anspruch ab Pflegegrad 1
        </div>

        <h1
          className="animate-fade-up mb-2 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-dark md:text-5xl lg:text-6xl"
          style={{ animationDelay: '0.1s' }}
        >
          Pflegehilfsmittel kostenlos —
          <em className="mt-0 block font-serif text-terra not-italic">jeden Monat nach Hause.</em>
        </h1>

        <p
          className="animate-fade-up mt-5 mb-7 max-w-[500px] text-base font-light leading-relaxed text-warm-gray md:text-lg"
          style={{ animationDelay: '0.2s' }}
        >
          Haben Sie oder ein Angehöriger einen Pflegegrad? Dann übernimmt Ihre Pflegekasse die Kosten —{' '}
          <strong className="font-medium text-dark">bis zu 42 € monatlich.</strong> Wir kümmern uns um den Rest.
        </p>

        <div
          className="animate-fade-up mb-7 flex flex-wrap items-center gap-2"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-dark">
            <div className="step-num-circle">1</div>
            <span>Angaben machen</span>
          </div>
          <div className="hidden px-1 text-xs text-mid-gray sm:block">→</div>
          <div className="flex items-center gap-2 text-xs font-medium text-dark">
            <div className="step-num-circle">2</div>
            <span>Box wählen</span>
          </div>
          <div className="hidden px-1 text-xs text-mid-gray sm:block">→</div>
          <div className="flex items-center gap-2 text-xs font-medium text-dark">
            <div className="step-num-circle">3</div>
            <span>Monatlich geliefert</span>
          </div>
        </div>

        <div className="animate-fade-up flex flex-col items-start gap-3" style={{ animationDelay: '0.4s' }}>
          <Link
            href="/beantragen"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-terra px-6 py-3.5 text-base font-medium text-warm-white shadow-[0_4px_16px_rgba(201,107,63,0.28)] transition-all hover:-translate-y-0.5 hover:bg-terra-dark hover:shadow-[0_6px_24px_rgba(201,107,63,0.4)]"
          >
            Anspruch prüfen — kostenlos &amp; unverbindlich
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <div className="flex items-center gap-1.5 pl-0.5 text-xs text-warm-gray">
            <span>✓ Nur 2 Minuten</span>
            <span className="text-mid-gray">·</span>
            <span>✓ Kein Papierkram</span>
            <span className="text-mid-gray">·</span>
            <span>✓ Wir erledigen alles</span>
          </div>
        </div>
      </div>

      {/* Rechts: Visual — Foto + schwebende Karten */}
      <div className="relative min-h-[44vh] overflow-hidden bg-gradient-to-br from-bg to-terra-pale lg:min-h-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 35% 45%, rgba(201,107,63,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 65%, rgba(45,122,95,0.05) 0%, transparent 50%)',
          }}
        />

        <div className="absolute left-1/2 top-1/2 aspect-[4/5] w-[72%] max-w-[360px] -translate-x-1/2 -translate-y-1/2">
          <div className="photo-frame relative h-full w-full overflow-hidden shadow-[0_20px_60px_rgba(44,36,32,0.14),0_4px_16px_rgba(44,36,32,0.08)]">
            <Image
              src={HERO_IMAGE}
              alt="Angehörige in warmer häuslicher Pflegesituation"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 72vw, 360px"
              priority
            />
          </div>
        </div>

        <div
          className="animate-fade-up absolute bottom-[10%] left-[10%] flex items-center gap-3 rounded-2xl border border-mid-gray/25 bg-warm-white p-3.5 shadow-xl"
          style={{ animationDelay: '0.7s' }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terra-pale text-lg">💶</div>
          <div>
            <div className="text-[15px] font-medium leading-tight text-dark">42 € / Monat</div>
            <div className="text-[11px] text-warm-gray">komplett von der Pflegekasse</div>
          </div>
        </div>

        <div
          className="animate-fade-up absolute right-[10%] top-[10%] flex items-center gap-2 rounded-xl border border-sage-light bg-sage-pale px-3.5 py-2.5"
          style={{ animationDelay: '0.9s' }}
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sage text-[10px] text-white">✓</div>
          <div className="text-xs font-medium text-sage">Keine Vertragsbindung</div>
        </div>
      </div>
    </section>
  )
}
