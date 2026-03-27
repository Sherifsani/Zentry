import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-white text-lg">SafeTrack</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Nigeria's smart bus transit safety platform. Every journey monitored, every passenger protected.
            </p>
            <p className="text-xs text-slate-600 mt-4">
              Built for the Enyata × Interswitch Buildathon 2026
            </p>
          </div>

          {/* Passengers */}
          <div>
            <h4 className="font-heading font-bold text-white text-sm mb-3">Passengers</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/signup/passenger', label: 'Create Account' },
                { href: '/login',            label: 'Sign In'       },
                { href: '/#how-it-works',    label: 'How It Works'  },
                { href: '/#routes',          label: 'Browse Routes' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Operators */}
          <div>
            <h4 className="font-heading font-bold text-white text-sm mb-3">Operators</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/signup/operator',    label: 'Register Company'  },
                { href: '/login',              label: 'Operator Login'    },
                { href: '/#operators',         label: 'Platform Features' },
                { href: '/operator/dashboard', label: 'Dashboard'        },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© 2026 SafeTrack. All rights reserved.</p>
          <p>Payments secured by Interswitch · SMS by Termii · Maps by OpenStreetMap</p>
        </div>
      </div>
    </footer>
  );
}
