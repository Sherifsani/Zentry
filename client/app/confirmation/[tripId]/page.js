'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ConfirmationPage({ params, searchParams }) {
  const { tripId } = use(params);
  const query = use(searchParams);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        // Try to verify payment (Interswitch passes resp in query)
        const resp = query?.resp || '00';
        // Interswitch sends back: txnref, amount, resp, desc as query params
        const txnref = query?.txnref;

        await api.post('/api/payment/verify', {
          tripId,
          txnref,
          resp,
        });

        // Fetch trip data
        const { data } = await api.get(`/api/trips/${tripId}`);
        setTrip(data);
      } catch (err) {
        console.error('Verify error:', err);
        // Try to fetch trip anyway
        try {
          const { data } = await api.get(`/api/trips/${tripId}`);
          setTrip(data);
        } catch {
          // ignore
        }
      } finally {
        setLoading(false);
        sessionStorage.removeItem('pending_tripId');
      }
    };
    verify();
  }, [tripId, query]);

  const trackingUrl = trip?.trackingToken
    ? `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/track/${trip.trackingToken}`
    : null;

  const copyToClipboard = () => {
    if (trackingUrl) {
      navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    const text = `Track my journey live on SafeTrack: ${trackingUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareSMS = () => {
    const text = `Track my journey: ${trackingUrl}`;
    window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h1>
          <p className="text-slate-500 mt-1">Your seat is reserved and your journey is being monitored</p>
        </div>

        {/* Trip details */}
        {trip && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-slate-500">Trip ID</p>
                <p className="font-bold text-lg">{trip.tripId}</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                {trip.paymentStatus === 'paid' ? 'Paid' : 'Active'}
              </span>
            </div>
            {trip.routeId && (
              <div className="text-sm text-slate-600">
                <p><strong>{trip.routeId.origin}</strong> → <strong>{trip.routeId.destination}</strong></p>
                <p className="text-slate-500 mt-1">Passenger: {trip.passengerName} · Seat {trip.seatNumber}</p>
              </div>
            )}
          </div>
        )}

        {/* Share tracking link */}
        {trackingUrl && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4">
            <h2 className="font-semibold text-blue-900 mb-1">Share Live Tracking Link</h2>
            <p className="text-sm text-blue-700 mb-3">Send this to {trip?.emergencyContact?.name} so they can follow your journey</p>

            <div className="bg-white rounded-lg border border-blue-200 px-3 py-2 text-sm text-slate-600 break-all mb-3 font-mono">
              {trackingUrl}
            </div>

            <div className="flex gap-2">
              <button
                onClick={shareWhatsApp}
                className="flex-1 bg-green-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-700 transition"
              >
                WhatsApp
              </button>
              <button
                onClick={shareSMS}
                className="flex-1 bg-slate-700 text-white text-sm font-semibold py-2 rounded-lg hover:bg-slate-800 transition"
              >
                SMS
              </button>
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href={`/trip/${tripId}`}
            className="block w-full text-center bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition"
          >
            View My Trip →
          </Link>
          <Link
            href="/"
            className="block w-full text-center text-blue-600 text-sm hover:underline"
          >
            Back to routes
          </Link>
        </div>
      </div>
    </div>
  );
}
