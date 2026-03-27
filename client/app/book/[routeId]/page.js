'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const RISK_STYLES = {
  Low:    'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  High:   'bg-red-100 text-red-600',
};

export default function BookingPage({ params }) {
  const { routeId } = use(params);
  const router = useRouter();

  const [route, setRoute] = useState(null);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // step: 'form' | 'payment' | 'processing'
  const [step, setStep] = useState('form');
  const [pendingTripId, setPendingTripId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    passengerName: '',
    passengerPhone: '',
    seatNumber: '',
    ecName: '',
    ecPhone: '',
    ecRelation: '',
  });

  // Fake card state — not sent to backend
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [routeRes, busesRes] = await Promise.allSettled([
          api.get(`/api/routes/${routeId}`),
          api.get(`/api/buses`),
        ]);
        if (routeRes.status === 'fulfilled') setRoute(routeRes.value.data);
        if (busesRes.status === 'fulfilled') setBuses(busesRes.value.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [routeId]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleCardChange = (e) => setCard((c) => ({ ...c, [e.target.name]: e.target.value }));

  // Step 1 — submit booking form, get tripId
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const availableBus = buses.find(
        (b) => b.currentRouteId?._id === routeId || b.currentRouteId === routeId
      );

      const { data } = await api.post('/api/payment/initiate', {
        routeId,
        passengerName: form.passengerName,
        passengerPhone: form.passengerPhone,
        seatNumber: form.seatNumber,
        emergencyContact: { name: form.ecName, phone: form.ecPhone, relation: form.ecRelation },
        busId: availableBus?._id,
      });

      setPendingTripId(data.tripId);
      setStep('payment');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2 — simulate payment, call verify
  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setPaying(true);
    setStep('processing');

    // Artificial 2-second "processing" delay for realism
    await new Promise((r) => setTimeout(r, 2000));

    try {
      await api.post('/api/payment/verify', { tripId: pendingTripId });
      router.push(`/confirmation/${pendingTripId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
      setStep('payment');
      setPaying(false);
    }
  };

  const formatCardNumber = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Route not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">← Back to routes</Link>
        </div>
      </div>
    );
  }

  // ── PROCESSING SCREEN ───────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold text-slate-800 mb-1">Processing payment…</h2>
          <p className="text-slate-500 text-sm">Please wait, do not close this page</p>
        </div>
      </div>
    );
  }

  // ── PAYMENT SCREEN ──────────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => setStep('form')}
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              ← Back
            </button>
            <h1 className="font-heading font-bold text-slate-800">Secure Payment</h1>
            <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              SSL Secured
            </span>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-8">
          {/* Amount summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
            <p className="text-sm text-slate-500 mb-1">You are paying for</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-slate-900">
                  {route.origin} → {route.destination}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Passenger: {form.passengerName} · Seat {form.seatNumber}
                </p>
              </div>
              <p className="font-heading font-extrabold text-2xl text-blue-700">
                ₦{route.price?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Visual card */}
          <div
            className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)' }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
            <p className="text-xs text-blue-200 mb-6 relative">SafeTrack Pay</p>
            <p className="font-mono text-xl tracking-widest mb-6 relative">
              {card.number
                ? card.number.replace(/\d(?=.{4})/g, '•')
                : '•••• •••• •••• ••••'}
            </p>
            <div className="flex justify-between items-end relative">
              <div>
                <p className="text-xs text-blue-200">CARD HOLDER</p>
                <p className="font-heading font-semibold text-sm uppercase">
                  {card.name || form.passengerName || 'YOUR NAME'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-200">EXPIRES</p>
                <p className="font-mono text-sm">{card.expiry || 'MM/YY'}</p>
              </div>
            </div>
          </div>

          {/* Card form */}
          <form onSubmit={handlePayment} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Card Number</label>
              <input
                type="text"
                name="number"
                value={card.number}
                onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
                placeholder="0000 0000 0000 0000"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name on Card</label>
              <input
                type="text"
                name="name"
                value={card.name}
                onChange={handleCardChange}
                placeholder={form.passengerName}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Expiry Date</label>
                <input
                  type="text"
                  name="expiry"
                  value={card.expiry}
                  onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                  placeholder="MM/YY"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={card.cvv}
                  onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="•••"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={paying}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-heading font-bold py-3.5 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Pay ₦{route.price?.toLocaleString()}
            </button>

            <p className="text-center text-xs text-slate-400">
              This is a simulated payment — no real charge will be made
            </p>
          </form>
        </main>
      </div>
    );
  }

  // ── BOOKING FORM ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">← Back</Link>
          <h1 className="font-heading font-bold text-slate-800">Book Your Seat</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Route summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="font-heading font-bold text-lg text-slate-900">{route.origin}</span>
              <span className="text-blue-500">→</span>
              <span className="font-heading font-bold text-lg text-slate-900">{route.destination}</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${RISK_STYLES[route.riskScore] || RISK_STYLES.Low}`}>
              {route.riskScore} Risk
            </span>
          </div>
          {route.riskSummary && (
            <p className="text-sm text-slate-500 italic mb-2">{route.riskSummary}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {route.departureTime && <span>Departs <strong>{route.departureTime}</strong></span>}
            <span className="font-heading font-extrabold text-xl text-blue-700 ml-auto">
              ₦{route.price?.toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleBookingSubmit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          {/* Passenger details */}
          <div>
            <h2 className="font-heading font-semibold text-slate-800 mb-4">Passenger Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                <input
                  type="text" name="passengerName" value={form.passengerName}
                  onChange={handleChange} required placeholder="e.g. Emeka Nwosu"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Phone Number</label>
                  <input
                    type="tel" name="passengerPhone" value={form.passengerPhone}
                    onChange={handleChange} required placeholder="08012345678"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Seat Number</label>
                  <input
                    type="text" name="seatNumber" value={form.seatNumber}
                    onChange={handleChange} required placeholder="e.g. 12A"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency contact */}
          <div>
            <h2 className="font-heading font-semibold text-slate-800 mb-1">Emergency Contact</h2>
            <p className="text-xs text-slate-400 mb-4">This person receives live tracking updates and SOS alerts</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Contact Name</label>
                  <input
                    type="text" name="ecName" value={form.ecName}
                    onChange={handleChange} required placeholder="e.g. Ngozi Nwosu"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Relation</label>
                  <select
                    name="ecRelation" value={form.ecRelation}
                    onChange={handleChange} required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select…</option>
                    <option>Mother</option>
                    <option>Father</option>
                    <option>Spouse</option>
                    <option>Sibling</option>
                    <option>Friend</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Contact Phone</label>
                <input
                  type="tel" name="ecPhone" value={form.ecPhone}
                  onChange={handleChange} required placeholder="08098765432"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-heading font-bold py-3.5 rounded-xl transition disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : `Continue to Payment — ₦${route.price?.toLocaleString()}`}
          </button>
        </form>
      </main>
    </div>
  );
}
