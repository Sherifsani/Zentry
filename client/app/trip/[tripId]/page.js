'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';

const LiveMap = dynamic(() => import('@/components/map/LiveMap'), { ssr: false });

const STATUS_STYLES = {
  'on-route': 'bg-green-100 text-green-800',
  'delayed': 'bg-yellow-100 text-yellow-800',
  'stopped': 'bg-orange-100 text-orange-800',
  'alert': 'bg-red-100 text-red-800',
  'arrived': 'bg-blue-100 text-blue-800',
  'active': 'bg-green-100 text-green-800',
  'pending': 'bg-slate-100 text-slate-600',
};

const INCIDENT_TYPES = [
  { value: 'suspicious-stop', label: 'Suspicious Stop' },
  { value: 'armed-attack', label: 'Armed Attack' },
  { value: 'accident', label: 'Accident' },
  { value: 'feeling-unsafe', label: 'Feeling Unsafe' },
  { value: 'other', label: 'Other' },
];

export default function TripPage({ params }) {
  const { tripId } = use(params);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busPosition, setBusPosition] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('active');
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosSubmitting, setSosSubmitting] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const sosTimerRef = useRef(null);
  const sosProgressRef = useRef(null);
  const [sosHolding, setSosHolding] = useState(false);
  const [sosProgress, setSosProgressState] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/api/trips/${tripId}`);
        setTrip(data);
        setStatus(data.status || 'active');
        if (data.busId?.lastLocation) {
          setBusPosition({
            lat: data.busId.lastLocation.lat,
            lng: data.busId.lastLocation.lng,
            speed: 0,
            status: data.busId.status,
          });
        }
      } catch {
        // trip not found
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tripId]);

  useEffect(() => {
    if (!tripId) return;
    const socket = getSocket();
    socket.connect();
    socket.emit('join-trip', { tripId });

    socket.on('gps-update', (data) => {
      setBusPosition({ lat: data.lat, lng: data.lng, speed: data.speed, status: data.status });
      setProgress(data.progress || 0);
      setStatus(data.status || 'on-route');
    });

    socket.on('trip-status-change', (data) => {
      setStatus(data.status);
    });

    return () => {
      socket.off('gps-update');
      socket.off('trip-status-change');
      socket.disconnect();
    };
  }, [tripId]);

  // SOS long-press handlers
  const startSOS = useCallback(() => {
    setSosHolding(true);
    setSosProgressState(0);
    let elapsed = 0;
    const DURATION = 3000;

    sosProgressRef.current = setInterval(() => {
      elapsed += 50;
      setSosProgressState(Math.min((elapsed / DURATION) * 100, 100));
    }, 50);

    sosTimerRef.current = setTimeout(() => {
      clearInterval(sosProgressRef.current);
      setSosHolding(false);
      setSosProgressState(0);
      setShowSOSModal(true); // Show incident selector silently
    }, DURATION);
  }, []);

  const cancelSOS = useCallback(() => {
    clearTimeout(sosTimerRef.current);
    clearInterval(sosProgressRef.current);
    setSosHolding(false);
    setSosProgressState(0);
  }, []);

  const submitSOS = async (type) => {
    setShowSOSModal(false);
    setSosSubmitting(true);

    let lat = null, lng = null;
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {
      // Use bus position as fallback
      lat = busPosition?.lat;
      lng = busPosition?.lng;
    }

    try {
      await api.post('/api/incidents', { tripId, type, lat, lng });
      setSosSent(true);
    } catch (err) {
      console.error('SOS error:', err);
    } finally {
      setSosSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-3">Trip not found</p>
          <Link href="/" className="text-blue-600 hover:underline">← Home</Link>
        </div>
      </div>
    );
  }

  const route = trip.routeId;
  const waypoints = route?.waypoints || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs">Trip {trip.tripId}</p>
            <h1 className="font-heading font-bold">{route?.origin} → {route?.destination}</h1>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status] || 'bg-white text-blue-800'}`}>
            {status === 'on-route' ? 'On Route' : status === 'alert' ? 'ALERT' : status?.charAt(0).toUpperCase() + status?.slice(1)}
          </span>
        </div>
      </header>

      {/* Alert banners */}
      {status === 'alert' && (
        <div className="bg-red-600 text-white text-center text-sm font-semibold py-2.5 px-4 shrink-0">
          Emergency alert sent to operator and {trip.emergencyContact?.name}
        </div>
      )}
      {sosSent && (
        <div className="bg-slate-800 text-slate-200 text-center text-sm py-2.5 px-4 shrink-0">
          Alert sent silently. Help is on the way.
        </div>
      )}

      {/* Body — stacks on mobile, side-by-side on desktop */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">

        {/* Map — full width mobile, left pane desktop */}
        <div className="flex-1 min-h-[55vw] md:min-h-0">
          <LiveMap
            busPosition={busPosition}
            waypoints={waypoints}
            origin={route?.origin}
            destination={route?.destination}
            height="100%"
          />
        </div>

        {/* Info panel — bottom strip mobile, right sidebar desktop */}
        <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col">

          {/* Trip details */}
          <div className="px-5 py-5 border-b border-slate-100">
            <h2 className="font-heading font-bold text-slate-900 mb-3">Trip Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Passenger</p>
                <p className="font-semibold text-slate-800 text-sm truncate">{trip.passengerName}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Seat</p>
                <p className="font-semibold text-slate-800 text-sm">{trip.seatNumber}</p>
              </div>
              {trip.emergencyContact?.name && (
                <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                  <p className="text-xs text-slate-400 mb-0.5">Emergency Contact</p>
                  <p className="font-semibold text-slate-800 text-sm">
                    {trip.emergencyContact.name}
                    <span className="text-slate-400 font-normal"> · {trip.emergencyContact.relation}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium truncate max-w-[40%]">{route?.origin}</span>
              <span className="text-blue-600 font-semibold">{progress}%</span>
              <span className="font-medium truncate max-w-[40%] text-right">{route?.destination}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* SOS button — grows to fill remaining space on desktop */}
          <div className="flex-1 flex flex-col justify-end px-5 py-5">
            <p className="text-center text-xs text-slate-400 mb-3">
              Hold for 3 seconds if you need help
            </p>
            <button
              onMouseDown={startSOS}
              onMouseUp={cancelSOS}
              onMouseLeave={cancelSOS}
              onTouchStart={startSOS}
              onTouchEnd={cancelSOS}
              className="w-full bg-slate-100 border-2 border-slate-200 text-slate-600 font-heading font-semibold py-4 md:py-5 rounded-xl text-sm relative overflow-hidden select-none hover:border-slate-300 transition-colors"
              style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
            >
              <div
                className="absolute inset-0 bg-red-100 transition-all duration-100"
                style={{ transform: `scaleX(${sosProgress / 100})`, transformOrigin: 'left' }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {sosHolding ? 'Hold…' : 'Safety Button'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SOS incident type modal */}
      {showSOSModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowSOSModal(false)} />
          <div className="relative w-full md:max-w-sm bg-white rounded-t-2xl md:rounded-2xl p-5 z-10 md:mx-4 shadow-xl">
            <h3 className="text-sm font-heading font-semibold text-slate-700 mb-1">Report an issue</h3>
            <p className="text-xs text-slate-400 mb-4">Select the situation below</p>
            <div className="space-y-1">
              {INCIDENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => submitSOS(t.value)}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-800 text-sm font-medium transition-colors"
                >
                  {t.label}
                </button>
              ))}
              <button
                onClick={() => setShowSOSModal(false)}
                className="w-full text-center px-4 py-3 rounded-xl text-slate-400 text-sm border-t border-slate-100 mt-1 hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
