import Image from 'next/image'
import Link from 'next/link'

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDH7ZoCZc5ho2m8Sgd_45LRVBz_umuRz0uKtkX88chiUtjrepnOR3amTIaFKEODR5HRTuDFPBmfxwJ7HGmXaKHvLibRKezsYfL9CaCq57I4Zd2srJZ05uyEyn2pmePB6Q4WFQYTufFipnSJ6ZG-wj-Sf3pI0oYO8T01q-a3pidC7Qv80tcDF7x_VwHm3AIfj_TIvuT9M6e2Nxoe4SdiyUA2eY21aET3XI569Ir3jgjDuSWFr1avoILhQAuO2ePa1e3zISKG2NeHVdM'

export function LandingHero() {
  return (
    <div className="flex justify-center bg-v3-surface">
    <section className="grid w-full max-w-7xl min-h-[calc(85vh-52px)] max-h-[760px] grid-cols-1 lg:grid-cols-2">

      {/* ── Left: Content ───────────────────────────────────────────── */}
      <div className="relative flex flex-col justify-center overflow-hidden bg-v3-surface px-8 py-16 md:px-16 lg:px-20 xl:px-24">
        {/* Ambient blob */}
        <div
          className="pointer-events-none absolute -bottom-32 -left-24 h-[480px] w-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(158,90,53,0.05) 0%, transparent 65%)' }}
        />

        {/* Eyebrow */}
        <div
          className="animate-fade-up mb-6 inline-flex items-center gap-2 self-start rounded-full px-3.5 py-1.5 text-xs font-medium text-v3-primary"
          style={{
            animationDelay: '0.05s',
            border: '1px solid rgba(74,114,89,0.25)',
            background: '#EEF4F1',
          }}
        >
          <span className="eyebrow-dot h-1.5 w-1.5 flex-shrink-0 rounded-full bg-v3-primary" />
          Gesetzlicher Anspruch ab Pflegegrad 1
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up font-newsreader text-4xl font-semibold leading-[1.07] tracking-tight text-v3-on-surface md:text-5xl lg:text-[3.25rem]"
          style={{ animationDelay: '0.12s' }}
        >
          Pflegehilfsmittel kostenlos —
          <em className="mt-1 block not-italic text-v3-primary">
            jeden Monat nach Hause.
          </em>
        </h1>

        {/* Deco rule */}
        <div
          className="animate-fade-up deco-rule my-5"
          style={{ animationDelay: '0.18s' }}
        />

        {/* Lead */}
        <p
          className="animate-fade-up mb-7 max-w-[480px] text-base font-light leading-relaxed text-v3-on-surface-v md:text-lg"
          style={{ animationDelay: '0.22s' }}
        >
          Haben Sie oder ein Angehöriger einen Pflegegrad? Dann übernimmt Ihre Pflegekasse die Kosten —{' '}
          <strong className="font-medium text-v3-on-surface">bis zu 42 € monatlich.</strong>{' '}
          Wir kümmern uns um den Rest.
        </p>

        {/* Mini step tracker */}
        <div
          className="animate-fade-up mb-7 flex flex-wrap items-center gap-2"
          style={{ animationDelay: '0.28s' }}
        >
          {[
            { n: '1', label: 'Angaben machen' },
            { n: '2', label: 'Box wählen' },
            { n: '3', label: 'Monatlich geliefert' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              {i > 0 && (
                <span className="hidden px-1 text-[10px] text-v3-outline sm:block">→</span>
              )}
              <div className="flex items-center gap-1.5 text-xs font-medium text-v3-on-surface">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ background: '#4A7259' }}
                >
                  {s.n}
                </span>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="animate-fade-up flex flex-col items-start gap-3"
          style={{ animationDelay: '0.34s' }}
        >
          <Link
            href="/beantragen"
            className="ripple-btn inline-flex items-center gap-2.5 rounded-xl bg-v3-primary px-6 py-3.5 text-base font-medium text-white transition-all hover:-translate-y-0.5 active:scale-[.98]"
            style={{ boxShadow: '0 4px 16px rgba(74,114,89,0.28)' }}
          >
            Anspruch prüfen — kostenlos &amp; unverbindlich
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <div className="flex items-center gap-1.5 pl-0.5 text-xs text-v3-on-surface-v">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4A7259" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Nur 2 Minuten</span>
            <span className="text-v3-outline">·</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4A7259" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Kein Papierkram</span>
            <span className="text-v3-outline">·</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4A7259" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Wir erledigen alles</span>
          </div>
        </div>
      </div>

      {/* ── Right: Visual ───────────────────────────────────────────── */}
      <div
        className="relative min-h-[44vh] overflow-hidden lg:min-h-0"
        style={{ background: 'linear-gradient(135deg, #EEF4F1 0%, #F5EDE5 100%)' }}
      >
        {/* Dot-grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(74,114,89,0.08) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* Warm radial overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 35% 45%, rgba(74,114,89,0.08) 0%, transparent 55%), radial-gradient(ellipse at 72% 68%, rgba(158,90,53,0.06) 0%, transparent 50%)',
          }}
        />

        {/* Arch Photo */}
        <div className="absolute left-1/2 top-1/2 aspect-[4/5] w-[82%] max-w-[440px] -translate-x-1/2 -translate-y-1/2">
          <div
            className="photo-frame relative h-full w-full overflow-hidden"
            style={{
              borderRadius: '50% 50% 14px 14px / 56% 56% 14px 14px',
              boxShadow: '0 20px 60px rgba(38,30,23,0.14), 0 4px 16px rgba(38,30,23,0.08)',
            }}
          >
            <Image
              src={HERO_IMAGE}
              alt="Angehörige in warmer häuslicher Pflegesituation"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 82vw, 440px"
              priority
            />
          </div>
        </div>

        {/* Float card — bottom left */}
        <div
          className="animate-fade-up absolute bottom-[10%] left-[6%] flex items-center gap-3 rounded-2xl bg-v3-surface p-3.5"
          style={{
            animationDelay: '0.7s',
            border: '1px solid rgba(213,202,185,0.3)',
            boxShadow: '0 8px 24px rgba(38,30,23,0.10)',
          }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-lg flex-shrink-0"
            style={{ background: '#EEF4F1' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#4A7259" strokeWidth="1.8" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"/>
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-semibold leading-tight text-v3-on-surface font-newsreader">42 € / Monat</div>
            <div className="text-[11px] text-v3-on-surface-v">komplett von der Pflegekasse</div>
          </div>
        </div>

        {/* Float card — top right */}
        <div
          className="animate-fade-up absolute right-[6%] top-[12%] flex items-center gap-2 rounded-xl px-3.5 py-2.5"
          style={{
            animationDelay: '0.88s',
            background: '#EEF4F1',
            border: '1px solid rgba(74,114,89,0.2)',
          }}
        >
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white flex-shrink-0"
            style={{ background: '#4A7259' }}
          >
            ✓
          </div>
          <div className="text-xs font-medium text-v3-primary">Keine Vertragsbindung</div>
        </div>
      </div>
    </section>
    </div>
  )
}
