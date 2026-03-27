'use client';

import { useState, useEffect, useCallback } from 'react';
import OperatorLayout from '@/components/operator/OperatorLayout';
import api from '@/lib/api';

const RISK_COLORS = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-red-100 text-red-800',
};

const EMPTY_WAYPOINT = { name: '', lat: '', lng: '' };

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    price: '',
    departureTime: '',
    estimatedDuration: '',
  });
  const [waypoints, setWaypoints] = useState([
    { ...EMPTY_WAYPOINT },
    { ...EMPTY_WAYPOINT },
  ]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/routes');
      setRoutes(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateWaypoint = (idx, field, value) => {
    setWaypoints((prev) => prev.map((wp, i) => i === idx ? { ...wp, [field]: value } : wp));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const parsedWaypoints = waypoints
        .filter((wp) => wp.name && wp.lat && wp.lng)
        .map((wp) => ({ name: wp.name, lat: parseFloat(wp.lat), lng: parseFloat(wp.lng) }));

      await api.post('/api/routes', {
        ...form,
        price: parseFloat(form.price),
        estimatedDuration: form.estimatedDuration ? parseInt(form.estimatedDuration) : undefined,
        waypoints: parsedWaypoints,
      });
      setForm({ origin: '', destination: '', price: '', departureTime: '', estimatedDuration: '' });
      setWaypoints([{ ...EMPTY_WAYPOINT }, { ...EMPTY_WAYPOINT }]);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add route');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OperatorLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Routes</h1>
            <p className="text-slate-400 text-sm">{routes.length} routes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + Add Route
          </button>
        </div>

        {/* Add route form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 mb-6 space-y-3">
            <h2 className="font-semibold text-white">New Route</h2>
            <div className="grid grid-cols-2 gap-3">
              {[['origin', 'Origin City'], ['destination', 'Destination City'], ['price', 'Price (NGN)'], ['departureTime', 'Departure Time (HH:MM)'], ['estimatedDuration', 'Duration (minutes)']].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs text-slate-400 mb-1">{label}</label>
                  <input
                    type={field === 'price' || field === 'estimatedDuration' ? 'number' : 'text'}
                    value={form[field]}
                    onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                    required={['origin', 'destination', 'price'].includes(field)}
                    placeholder={label}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-400">Waypoints (name, lat, lng)</label>
                <button
                  type="button"
                  onClick={() => setWaypoints(prev => [...prev, { ...EMPTY_WAYPOINT }])}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  + Add stop
                </button>
              </div>
              {waypoints.map((wp, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    placeholder={i === 0 ? 'Origin name' : i === waypoints.length - 1 ? 'Dest name' : `Stop ${i}`}
                    value={wp.name}
                    onChange={(e) => updateWaypoint(i, 'name', e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    placeholder="Latitude"
                    value={wp.lat}
                    onChange={(e) => updateWaypoint(i, 'lat', e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    placeholder="Longitude"
                    value={wp.lng}
                    onChange={(e) => updateWaypoint(i, 'lng', e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save Route'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        {/* Routes list */}
        {loading ? (
          <div className="text-slate-400 text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-3">
            {routes.map((route) => (
              <div key={route._id} className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{route.origin}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-white">{route.destination}</span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      ₦{route.price?.toLocaleString()}
                      {route.departureTime && ` · ${route.departureTime}`}
                      {route.estimatedDuration && ` · ~${Math.round(route.estimatedDuration / 60)}h`}
                    </p>
                    {route.riskSummary && (
                      <p className="text-slate-500 text-xs mt-1 italic">{route.riskSummary}</p>
                    )}
                    {route.waypoints?.length > 0 && (
                      <p className="text-slate-500 text-xs mt-1">
                        Stops: {route.waypoints.map(w => w.name).join(' → ')}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${RISK_COLORS[route.riskScore] || RISK_COLORS.Low}`}>
                    {route.riskScore} Risk
                  </span>
                </div>
              </div>
            ))}
            {routes.length === 0 && (
              <p className="text-slate-500 text-center py-12">No routes yet</p>
            )}
          </div>
        )}
      </div>
    </OperatorLayout>
  );
}
