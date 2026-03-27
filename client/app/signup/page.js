import Link from 'next/link';

export default function SignupChoicePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <span className="font-heading font-extrabold text-xl text-slate-900">SafeTrack</span>
      </Link>

      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl font-extrabold text-slate-900 mb-2">Join SafeTrack</h1>
          <p className="text-slate-500">Who are you signing up as?</p>
        </div>

        <div className="grid gap-4">
          {/* Passenger */}
          <Link href="/signup/passenger" className="group block">
            <div className="bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-7 transition-all hover:shadow-lg cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 transition-colors">
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-heading text-xl font-bold text-slate-900 mb-1">Passenger</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Book bus tickets, share live tracking with family, and travel safely across Nigeria.
                  </p>
                </div>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Operator */}
          <Link href="/signup/operator" className="group block">
            <div className="bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-7 transition-all hover:shadow-lg cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-100 group-hover:bg-slate-200 rounded-2xl flex items-center justify-center shrink-0 transition-colors">
                  <svg className="w-7 h-7 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="font-heading text-xl font-bold text-slate-900">Transport Operator</h2>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Verified</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Manage your fleet, monitor journeys in real time, and respond instantly to passenger alerts.
                  </p>
                </div>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
