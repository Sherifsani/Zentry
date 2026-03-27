import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">

      {/* ── DOT GRID ─────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Vignette — fades dots at every edge so centre pops */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 70%, #000 100%)',
        }}
      />

      {/* ── SINGLE BLUE RADIAL GLOW ───────────────────────────────── */}
      {/* Sits behind headline — very faint, one colour, no blobs */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(59,130,246,0.13) 0%, transparent 70%)',
        }}
      />

      {/* ── CONTENT ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-32 pb-28 max-w-4xl mx-auto w-full">

        {/* Status pill */}
        <div className="inline-flex items-center gap-2 mb-10 border border-white/[0.08] bg-white/[0.03] text-white/50 text-xs font-medium px-3.5 py-1.5 rounded-full backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Live on major Nigerian corridors
        </div>

        {/* Headline */}
        <h1
          className="font-heading font-extrabold text-white leading-[1.06] tracking-[-0.03em] mb-6"
          style={{ fontSize: 'clamp(2.75rem, 7vw, 5rem)' }}
        >
          Bus travel safety,
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #60a5fa 0%, #a5b4fc 50%, #818cf8 100%)',
            }}
          >
            built for Nigeria.
          </span>
        </h1>

        {/* Sub */}
        <p className="text-white/40 text-lg leading-relaxed max-w-xl mb-10">
          Book your seat, share a live tracking link with family, and trigger a
          silent SOS — all from a single platform.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link
            href="/signup/passenger"
            className="font-heading font-bold text-sm bg-white text-black hover:bg-white/90 px-6 py-3 rounded-lg transition-all w-full sm:w-auto"
          >
            Get started free
          </Link>
          <Link
            href="/signup/operator"
            className="font-heading font-semibold text-sm text-white/70 hover:text-white border border-white/[0.1] hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] px-6 py-3 rounded-lg transition-all w-full sm:w-auto"
          >
            Register as operator →
          </Link>
        </div>

        {/* Metrics row */}
        <div className="mt-20 flex items-center justify-center gap-10 flex-wrap">
          {[
            { value: '5s',   label: 'GPS update interval'   },
            { value: '< 10s', label: 'SOS alert delivery'   },
            { value: 'Zero', label: 'Login for family view' },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-10">
              <div className="text-center">
                <p className="font-heading font-extrabold text-white text-2xl tracking-tight">
                  {value}
                </p>
                <p className="text-white/30 text-xs mt-0.5">{label}</p>
              </div>
              {i < 2 && (
                <div className="h-8 w-px bg-white/[0.07]" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM FADE TO WHITE ─────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #ffffff)',
        }}
      />
    </section>
  );
}
