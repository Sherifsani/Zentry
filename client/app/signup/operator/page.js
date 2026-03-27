'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setToken, setOperator } from '@/lib/auth';

export default function OperatorSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: '', email: '', phone: '', rcNumber: '', address: '', password: '', confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register/operator', {
        companyName: form.companyName,
        email: form.email,
        phone: form.phone,
        rcNumber: form.rcNumber,
        address: form.address,
        password: form.password,
      });
      setToken(data.token);
      setOperator({ ...data.operator, role: 'operator' });
      router.push('/operator/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#05112a] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />

        <Link href="/" className="relative flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <span className="font-heading font-extrabold text-white text-xl">SafeTrack</span>
        </Link>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            🏢 Transport Companies Only
          </div>
          <h2 className="font-heading text-4xl font-extrabold text-white leading-tight mb-6">
            Your fleet.<br />Under control.
          </h2>
          <div className="space-y-4">
            {[
              { icon: '🗺️', text: 'Real-time fleet map and bus status' },
              { icon: '🚨', text: 'Instant SOS and AI anomaly alerts' },
              { icon: '📊', text: 'Full incident logs and resolution tracking' },
              { icon: '🔒', text: 'Verified operators only — passengers trust your brand' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-slate-400 text-sm">
                <span className="text-xl">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-400">
          <p className="font-heading font-semibold text-white text-xs mb-1">Verification</p>
          <p className="text-xs">Your CAC registration is confirmed by our team within 24 hours. You can access the dashboard immediately after signup.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-2">
            <Link href="/signup" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="font-heading text-2xl font-extrabold text-slate-900">Register your company</h1>
            <p className="text-slate-500 text-sm mt-1">Get full access to the operator dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input
                type="text" name="companyName" value={form.companyName} onChange={update} required
                placeholder="e.g. GIG Motors Nigeria"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email" name="email" value={form.email} onChange={update} required
                  placeholder="ops@company.ng"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel" name="phone" value={form.phone} onChange={update} required
                  placeholder="08012345678"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                CAC Registration Number
                <span className="text-slate-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text" name="rcNumber" value={form.rcNumber} onChange={update}
                placeholder="e.g. RC123456"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Address
                <span className="text-slate-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text" name="address" value={form.address} onChange={update}
                placeholder="e.g. 12 Utako Junction, Abuja"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password" name="password" value={form.password} onChange={update} required
                  placeholder="Min. 8 characters"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password" name="confirm" value={form.confirm} onChange={update} required
                  placeholder="Repeat password"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full font-heading font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 text-sm"
            >
              {loading ? 'Creating account...' : 'Register Company →'}
            </button>

            <p className="text-center text-xs text-slate-400">
              By registering you confirm you are an authorised representative of a licensed transport company.
            </p>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
