'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOperator, clearToken, clearOperator, isLoggedIn } from '@/lib/auth';
import api from '@/lib/api';

const RISK_STYLES = {
  Low:    { pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Medium: { pill: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500'   },
  High:   { pill: 'bg-red-100 text-red-600',        dot: 'bg-red-500'     },
};

const STATS = [
  {
    label: 'Live tracking',
    desc: 'Share with family',
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Silent SOS',
    desc: 'Hold 3 seconds',
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: 'AI monitoring',
    desc: 'Every kilometre',
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
];

export default function PassengerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    const profile = getOperator();
    if (profile?.role === 'operator') { router.replace('/operator/dashboard'); return; }
    setUser(profile);

    api.get('/api/routes')
      .then(({ data }) => setRoutes(data))
      .catch(() => {})
      .finally(() => setLoadingRoutes(false));
  }, [router]);

  const logout = () => {
    clearToken();
    clearOperator();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span className="font-heading font-extrabold text-slate-900">SafeTrack</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:block">
              Hello, <strong>{user.name?.split(' ')[0]}</strong>
            </span>
            <button
              onClick={logout}
              className="text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">
            Where to today, {user.name?.split(' ')[0]}?
          </h1>
          <p className="text-slate-500 text-sm mt-1">Choose a route below to book your safe journey</p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {STATS.map(({ label, desc, icon }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div>
                <p className="font-heading font-bold text-slate-800 text-sm">{label}</p>
                <p className="text-slate-400 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Route list */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-heading font-bold text-slate-900">Available Routes</h2>
            <span className="text-xs text-slate-400">{routes.length} routes</span>
          </div>

          {loadingRoutes ? (
            <div className="py-16 text-center text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-sm">Loading routes…</p>
            </div>
          ) : routes.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-sm">No routes available</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {routes.map((route) => {
                const risk = RISK_STYLES[route.riskScore] || RISK_STYLES.Low;
                return (
                  <Link
                    key={route._id}
                    href={`/book/${route._id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Risk dot */}
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${risk.dot}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 font-heading font-bold text-slate-900">
                        <span>{route.origin}</span>
                        <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span>{route.destination}</span>
                      </div>
                      {route.departureTime && (
                        <p className="text-xs text-slate-500 mt-0.5">Departs {route.departureTime}</p>
                      )}
                      {route.riskSummary && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate italic">{route.riskSummary}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:inline-flex ${risk.pill}`}>
                        {route.riskScore}
                      </span>
                      <span className="font-heading font-extrabold text-blue-700">
                        ₦{route.price?.toLocaleString()}
                      </span>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
