import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/layout/Hero';

async function getRoutes() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/routes`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const RISK_STYLES = {
  Low:    { pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Medium: { pill: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500'   },
  High:   { pill: 'bg-red-100 text-red-600',        dot: 'bg-red-500'     },
};

export default async function LandingPage() {
  const routes = await getRoutes();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <Hero />

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="py-24 px-6 bg-white" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-heading font-semibold text-sm uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="font-heading text-4xl font-extrabold text-slate-900">
              Three steps to a safer journey
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Book & Pay',
                desc: 'Choose your route, fill in your details and one emergency contact, then pay securely. Your unique trip ID is instant.',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50',
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Track Live',
                desc: 'Your family gets a one-tap link to watch your bus move on a live map — no app download, no login required. Updates every 5 seconds.',
                color: 'from-indigo-500 to-indigo-600',
                bg: 'bg-indigo-50',
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Stay Safe',
                desc: 'Hold the safety button for 3 seconds to silently alert your operator and emergency contact with your exact GPS location.',
                color: 'from-emerald-500 to-emerald-600',
                bg: 'bg-emerald-50',
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
            ].map(({ step, icon, title, desc, color, bg }) => (
              <div key={step} className="relative group">
                <div className={`${bg} rounded-2xl p-8 h-full border border-slate-100 hover:border-slate-200 transition-all hover:shadow-lg hover:-translate-y-1`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}>
                    {icon}
                  </div>
                  <p className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{step}</p>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-heading font-semibold text-sm uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="font-heading text-4xl font-extrabold text-slate-900">
              Safety built into every layer
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'AI Safety Engine',
                desc: 'Every GPS ping is analysed in real time. Speed anomalies, route deviations over 500m, and GPS signal loss all trigger automatic operator alerts — no passenger action needed.',
                tag: 'Proactive',
                tagColor: 'bg-purple-100 text-purple-700',
                icon: (
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                  </svg>
                ),
              },
              {
                title: 'Silent SOS',
                desc: 'A 3-second hold on the safety button fires an alert with no sound, no screen change. Your exact coordinates go to the operator dashboard and your emergency contact via SMS instantly.',
                tag: 'Discreet',
                tagColor: 'bg-red-100 text-red-700',
                icon: (
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ),
              },
              {
                title: 'Zero-Login Family Tracking',
                desc: "Share a link. That's it. Your family watches your bus on a live map from any phone with no account, no app. They're notified automatically when you pass key waypoints.",
                tag: 'Frictionless',
                tagColor: 'bg-blue-100 text-blue-700',
                icon: (
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: 'Secure Payments',
                desc: 'Fast, secure checkout with instant booking confirmation. Your trip ID and live tracking link are generated the moment payment clears — no delays.',
                tag: 'Instant',
                tagColor: 'bg-emerald-100 text-emerald-700',
                icon: (
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
              },
            ].map(({ icon, title, desc, tag, tagColor }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    {icon}
                  </div>
                  <span className={`text-xs font-heading font-bold px-2.5 py-1 rounded-full ${tagColor}`}>{tag}</span>
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROUTES (live data) ────────────────────────── */}
      {routes.length > 0 && (
        <section className="py-24 px-6 bg-white" id="routes">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-blue-600 font-heading font-semibold text-sm uppercase tracking-widest mb-3">Available Routes</p>
              <h2 className="font-heading text-4xl font-extrabold text-slate-900">
                Where are you heading?
              </h2>
            </div>

            <div className="space-y-4">
              {routes.map((route) => {
                const risk = RISK_STYLES[route.riskScore] || RISK_STYLES.Low;
                return (
                  <Link key={route._id} href={`/book/${route._id}`} className="block group">
                    <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${risk.dot} shrink-0`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 font-heading font-bold text-slate-900 text-lg">
                            <span className="truncate">{route.origin}</span>
                            <span className="text-slate-300">→</span>
                            <span className="truncate">{route.destination}</span>
                          </div>
                          {route.riskSummary && (
                            <p className="text-sm text-slate-500 mt-0.5 truncate">{route.riskSummary}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className={`text-xs font-heading font-bold px-2.5 py-1 rounded-full ${risk.pill}`}>
                          {route.riskScore} Risk
                        </span>
                        <span className="font-heading font-extrabold text-blue-700 text-lg">
                          ₦{route.price?.toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/signup/passenger"
                className="font-heading font-bold inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
              >
                Book a seat now →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FOR OPERATORS ─────────────────────────────── */}
      <section className="py-24 px-6 bg-[#05112a] relative overflow-hidden" id="operators">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-400 font-heading font-semibold text-sm uppercase tracking-widest mb-4">For Transport Operators</p>
              <h2 className="font-heading text-4xl font-extrabold text-white mb-6 leading-tight">
                Your entire fleet.<br />One command centre.
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                SafeTrack gives transport companies a real-time window into every bus on the road.
                Respond to incidents in seconds, monitor deviations automatically, and build passenger trust at scale.
              </p>
              <div className="space-y-3">
                {[
                  'Live fleet map with colour-coded bus status',
                  'Instant SOS and AI anomaly alerts',
                  'Full incident log with resolution tracking',
                  'Route and bus management dashboard',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <Link
                  href="/signup/operator"
                  className="font-heading font-bold bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30"
                >
                  Register Your Company →
                </Link>
                <Link
                  href="/login"
                  className="font-heading font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 px-6 py-3 rounded-xl text-sm transition-all"
                >
                  Operator Login
                </Link>
              </div>
            </div>

            {/* Dashboard preview card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-slate-500 text-xs">Operator Dashboard</span>
              </div>
              <div className="space-y-2">
                {[
                  { plate: 'ABJ-001-GIG', route: 'Abuja → Lagos', status: 'on-route', ping: '2s ago' },
                  { plate: 'LOS-002-GIG', route: 'Lagos → Abuja', status: 'alert',    ping: '5s ago' },
                  { plate: 'LOS-003-GIG', route: 'Lagos → PH',    status: 'on-route', ping: '3s ago' },
                ].map(({ plate, route, status, ping }) => (
                  <div key={plate} className="bg-slate-900/60 rounded-lg px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-heading font-bold text-white text-sm">{plate}</p>
                      <p className="text-slate-500 text-xs">{route}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 text-xs">{ping}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${status === 'alert' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-red-900/30 border border-red-800/40 rounded-lg px-4 py-2.5 flex items-center gap-2.5">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-red-300 text-xs font-heading font-bold">SOS Alert — LOS-002-GIG</p>
                  <p className="text-red-400/70 text-xs">Suspicious stop on Abuja-Lagos corridor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STATS ──────────────────────────────── */}
      <section className="py-16 px-6 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '< 5s',  label: 'GPS update latency' },
            { value: '< 10s', label: 'SOS alert delivery' },
            { value: '100%',  label: 'Free family tracking' },
            { value: '24/7',  label: 'AI anomaly monitoring' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-heading text-3xl font-extrabold text-slate-900">{value}</p>
              <p className="text-slate-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO STORY ───────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-blue-600 font-heading font-semibold text-sm uppercase tracking-widest mb-4">Real Scenario</p>
          <blockquote className="font-heading text-2xl font-bold text-slate-900 leading-snug mb-6">
            "Emeka boards a GIG bus from Abuja to Lagos. His mum in Lagos is worried — she always is.
            The bus suddenly stops on the Abuja–Kaduna highway. SafeTrack's AI flags it in seconds.
            The operator is alerted. His mum is alerted. GPS coordinates dispatched.
            All in under 10 seconds."
          </blockquote>
          <p className="text-slate-500 text-sm mb-8">That's SafeTrack working silently, every kilometre of the journey.</p>
          <Link
            href="/signup/passenger"
            className="font-heading font-bold inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl transition-all"
          >
            Start travelling safely →
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-4xl font-extrabold text-white mb-4">
            Ready to travel with confidence?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of passengers and operators making Nigerian bus travel safer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup/passenger"
              className="font-heading font-bold bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl text-base transition-all shadow-lg w-full sm:w-auto"
            >
              Create Passenger Account
            </Link>
            <Link
              href="/signup/operator"
              className="font-heading font-semibold bg-blue-500/30 hover:bg-blue-500/50 text-white border border-white/30 px-8 py-4 rounded-xl text-base transition-all w-full sm:w-auto"
            >
              Register as Operator
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
