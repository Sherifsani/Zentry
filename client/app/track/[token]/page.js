'use client';

import { use, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';

const LiveMap = dynamic(() => import('@/components/map/LiveMap'), { ssr: false });

const STATUS_LABELS = {
  'on-route': 'On Route',
  'delayed': 'Delayed',
  'stopped': 'Stopped',
  'alert': 'Alert',
  'arrived': 'Arrived',
  'active': 'Active',
  'pending': 'Pending',
};

const STATUS_STYLES = {
  'on-route': 'bg-green-100 text-green-800',
  'delayed': 'bg-yellow-100 text-yellow-800',
  'stopped': 'bg-orange-100 text-orange-800',
  'alert': 'bg-red-100 text-red-800',
  'arrived': 'bg-blue-100 text-blue-800',
  'active': 'bg-green-100 text-green-800',
};

export default function TrackingPage({ params }) {
  const { token } = use(params);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busPosition, setBusPosition] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('active');
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/api/trips/track/${token}`);
        setTrip(data);
        setStatus(data.status || 'active');
        if (data.busId?.lastLocation?.lat) {
          setBusPosition({
            lat: data.busId.lastLocation.lat,
            lng: data.busId.lastLocation.lng,
            speed: 0,
            status: data.busId.status,
          });
        }
        setLastUpdate(new Date());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    if (!trip?.tripId) return;

    const socket = getSocket();
    socket.connect();
    socket.emit('join-trip', { tripId: trip.tripId });

    socket.on('gps-update', (data) => {
      setBusPosition({ lat: data.lat, lng: data.lng, speed: data.speed, status: data.status });
      setProgress(data.progress || 0);
      setStatus(data.status || 'on-route');
      setLastUpdate(new Date());
    });

    socket.on('trip-status-change', (data) => {
      setStatus(data.status);
    });

    return () => {
      socket.off('gps-update');
      socket.off('trip-status-change');
      socket.disconnect();
    };
  }, [trip?.tripId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading live tracking...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="font-heading text-lg font-bold text-slate-800 mb-2">Tracking link not found</h1>
          <p className="text-sm text-slate-500">This link may be invalid or the trip has not started yet.</p>
        </div>
      </div>
    );
  }

  const route = trip?.routeId;
  const waypoints = route?.waypoints || [];
  const passenger = trip?.passengerName;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs font-medium">SafeTrack · Live Tracking</p>
            <h1 className="font-bold text-lg">{passenger}'s Journey</h1>
            {route && (
              <p className="text-blue-200 text-sm">{route.origin} → {route.destination}</p>
            )}
          </div>
          <div className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLES[status] || 'bg-white text-blue-800'}`}>
            {STATUS_LABELS[status] || status}
          </div>
        </div>
      </header>

      {/* Alert banner */}
      {status === 'alert' && (
        <div className="bg-red-600 text-white text-center py-2.5 px-4 font-semibold text-sm">
          Emergency alert triggered — operator has been notified
        </div>
      )}

      {status === 'arrived' && (
        <div className="bg-emerald-600 text-white text-center py-2.5 px-4 font-semibold text-sm">
          {passenger} has arrived at {route?.destination}
        </div>
      )}

      {/* Map */}
      <div style={{ height: '55vh' }}>
        <LiveMap
          busPosition={busPosition}
          waypoints={waypoints}
          origin={route?.origin}
          destination={route?.destination}
          height="100%"
        />
      </div>

      {/* Info panel */}
      <div className="bg-white border-t border-slate-200 px-4 py-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{route?.origin}</span>
            <span>{progress}% of journey complete</span>
            <span>{route?.destination}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Passenger</p>
            <p className="font-semibold text-slate-800">{trip?.passengerName}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Seat</p>
            <p className="font-semibold text-slate-800">{trip?.seatNumber}</p>
          </div>
          {trip?.busId?.plateNumber && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-1">Bus</p>
              <p className="font-semibold text-slate-800">{trip.busId.plateNumber}</p>
            </div>
          )}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Last Update</p>
            <p className="font-semibold text-slate-800 text-xs">
              {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Waiting...'}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Powered by SafeTrack · No account needed
        </p>
      </div>
    </div>
  );
}
