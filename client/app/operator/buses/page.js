'use client';

import { useState, useEffect, useCallback } from 'react';
import OperatorLayout from '@/components/operator/OperatorLayout';
import api from '@/lib/api';

export default function BusesPage() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plateNumber: '', driverName: '', currentRouteId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [busRes, routeRes] = await Promise.all([
        api.get('/api/buses'),
        api.get('/api/routes'),
      ]);
      setBuses(busRes.data);
      setRoutes(routeRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/buses', form);
      setForm({ plateNumber: '', driverName: '', currentRouteId: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add bus');
    } finally {
      setSubmitting(false);
    }
  };

  const STATUS_BADGE = {
    'on-route': 'bg-green-100 text-green-800',
    'idle': 'bg-slate-100 text-slate-600',
    'stopped': 'bg-orange-100 text-orange-800',
    'alert': 'bg-red-100 text-red-800',
    'arrived': 'bg-blue-100 text-blue-800',
    'offline': 'bg-slate-200 text-slate-500',
  };

  return (
    <OperatorLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Buses</h1>
            <p className="text-slate-400 text-sm">{buses.length} registered buses</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + Add Bus
          </button>
        </div>

        {/* Add bus form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 mb-6 space-y-3">
            <h2 className="font-semibold text-white">New Bus</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Plate Number</label>
                <input
                  type="text"
                  value={form.plateNumber}
                  onChange={(e) => setForm(f => ({ ...f, plateNumber: e.target.value }))}
                  required
                  placeholder="e.g. ABJ-001-GIG"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Driver Name</label>
                <input
                  type="text"
                  value={form.driverName}
                  onChange={(e) => setForm(f => ({ ...f, driverName: e.target.value }))}
                  required
                  placeholder="e.g. Chidi Okonkwo"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Assigned Route</label>
              <select
                value={form.currentRouteId}
                onChange={(e) => setForm(f => ({ ...f, currentRouteId: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {routes.map((r) => (
                  <option key={r._id} value={r._id}>{r.origin} → {r.destination}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60"
              >
                {submitting ? 'Saving...' : 'Save Bus'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 text-sm px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Bus table */}
        {loading ? (
          <div className="text-slate-400 text-center py-12">Loading...</div>
        ) : (
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 text-slate-400 font-medium">Plate</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Driver</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Route</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
                  <th className="px-4 py-3 text-slate-400 font-medium">Last Ping</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => (
                  <tr key={bus._id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-white font-mono font-semibold">{bus.plateNumber}</td>
                    <td className="px-4 py-3 text-slate-300">{bus.driverName}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {bus.currentRouteId
                        ? `${bus.currentRouteId.origin}→${bus.currentRouteId.destination}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[bus.status] || 'bg-slate-100 text-slate-600'}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {bus.lastPingAt ? new Date(bus.lastPingAt).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))}
                {buses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-500 py-8">No buses registered</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </OperatorLayout>
  );
}
