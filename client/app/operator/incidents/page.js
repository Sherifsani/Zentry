'use client';

import { useState, useEffect, useCallback } from 'react';
import OperatorLayout from '@/components/operator/OperatorLayout';
import api from '@/lib/api';

const TYPE_LABELS = {
  'suspicious-stop': 'Suspicious Stop',
  'armed-attack': 'Armed Attack',
  'accident': 'Accident',
  'feeling-unsafe': 'Feeling Unsafe',
  'other': 'Other',
  'auto-anomaly': 'Auto Anomaly (AI)',
  'gps-loss': 'GPS Loss (AI)',
  'route-deviation': 'Route Deviation (AI)',
};

const SOURCE_BADGE = {
  'passenger': 'bg-red-100 text-red-800',
  'ai': 'bg-purple-100 text-purple-800',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/incidents');
      setIncidents(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolve = async (id) => {
    try {
      await api.patch(`/api/incidents/${id}/resolve`, { note: resolveNote });
      setResolvingId(null);
      setResolveNote('');
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.status === filter);

  return (
    <OperatorLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Incident Log</h1>
            <p className="text-slate-400 text-sm">
              {incidents.filter(i => i.status === 'active').length} active · {incidents.length} total
            </p>
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400 text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((incident) => (
              <div
                key={incident._id}
                className={`bg-slate-800 rounded-xl p-4 border ${incident.status === 'active' ? 'border-red-800/50' : 'border-slate-700'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-white">
                        {TYPE_LABELS[incident.type] || incident.type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_BADGE[incident.source] || 'bg-slate-100 text-slate-700'}`}>
                        {incident.source}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${incident.status === 'active' ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                        {incident.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 text-sm text-slate-400 mb-2">
                      {incident.busId?.plateNumber && (
                        <span>Bus: <strong className="text-slate-300">{incident.busId.plateNumber}</strong></span>
                      )}
                      {incident.routeId && (
                        <span>Route: <strong className="text-slate-300">{incident.routeId.origin}→{incident.routeId.destination}</strong></span>
                      )}
                      {incident.tripId && (
                        <span>Trip: <strong className="text-slate-300">{incident.tripId}</strong></span>
                      )}
                      <span>Time: <strong className="text-slate-300">{new Date(incident.createdAt).toLocaleString()}</strong></span>
                    </div>

                    {incident.gps?.lat && (
                      <a
                        href={`https://maps.google.com/?q=${incident.gps.lat},${incident.gps.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                      >
                        View on map ({incident.gps.lat.toFixed(4)}, {incident.gps.lng.toFixed(4)})
                      </a>
                    )}

                    {incident.resolvedNote && (
                      <p className="text-xs text-slate-500 mt-1 italic">Note: {incident.resolvedNote}</p>
                    )}
                  </div>

                  {incident.status === 'active' && (
                    <div>
                      {resolvingId === incident._id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Resolution note (optional)"
                            value={resolveNote}
                            onChange={(e) => setResolveNote(e.target.value)}
                            className="bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1 w-48 focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => resolve(incident._id)}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-semibold transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => { setResolvingId(null); setResolveNote(''); }}
                              className="text-xs text-slate-400 px-2 py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResolvingId(incident._id)}
                          className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-slate-500 text-center py-12">No incidents found</p>
            )}
          </div>
        )}
      </div>
    </OperatorLayout>
  );
}
