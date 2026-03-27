'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import OperatorLayout from '@/components/operator/OperatorLayout';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { getOperator } from '@/lib/auth';

const FleetMap = dynamic(() => import('@/components/map/FleetMap'), { ssr: false });

const STATUS_COLORS = {
  'on-route': 'bg-green-500',
  'idle': 'bg-slate-400',
  'stopped': 'bg-orange-500',
  'alert': 'bg-red-600 animate-pulse',
  'arrived': 'bg-blue-500',
  'offline': 'bg-slate-600',
  'delayed': 'bg-yellow-500',
};

export default function DashboardPage() {
  const [buses, setBuses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [busPositions, setBusPositions] = useState({});

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/buses');
      setBuses(data);
      // Build initial positions
      const positions = {};
      data.forEach((b) => {
        if (b.lastLocation?.lat) {
          positions[b._id] = { lat: b.lastLocation.lat, lng: b.lastLocation.lng, status: b.status };
        }
      });
      setBusPositions(positions);
    } catch (err) {
      console.error('Failed to load buses:', err);
    }
  }, []);

  const loadIncidents = useCallback(async () => {
    try {
      const { data } = await api.get('/api/incidents');
      setAlerts(data.slice(0, 20));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
    loadIncidents();
  }, [load, loadIncidents]);

  useEffect(() => {
    const operator = getOperator();
    if (!operator) return;

    const socket = getSocket();
    socket.connect();
    socket.emit('join-operator', { operatorId: operator.id });

    socket.on('bus-location', (data) => {
      setBusPositions((prev) => ({
        ...prev,
        [data.busId]: { lat: data.lat, lng: data.lng, status: data.status, plateNumber: data.plateNumber },
      }));
      setBuses((prev) =>
        prev.map((b) =>
          b._id === data.busId
            ? { ...b, status: data.status, lastLocation: { lat: data.lat, lng: data.lng }, lastPingAt: data.timestamp }
            : b
        )
      );
    });

    socket.on('sos-alert', (data) => {
      setAlerts((prev) => [{ ...data, _id: Date.now(), createdAt: new Date(), status: 'active' }, ...prev]);
    });

    socket.on('anomaly-alert', (data) => {
      setAlerts((prev) => [{ ...data, _id: Date.now(), createdAt: new Date(), status: 'active' }, ...prev]);
    });

    return () => {
      socket.off('bus-location');
      socket.off('sos-alert');
      socket.off('anomaly-alert');
      socket.disconnect();
    };
  }, []);

  const resolveIncident = async (incidentId) => {
    try {
      await api.patch(`/api/incidents/${incidentId}/resolve`, { note: 'Resolved from dashboard' });
      setAlerts((prev) =>
        prev.map((a) => (a._id === incidentId || a.incidentId === incidentId ? { ...a, status: 'resolved' } : a))
      );
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  const busMarkersForMap = Object.entries(busPositions).map(([busId, pos]) => ({
    busId,
    ...pos,
    plateNumber: buses.find((b) => b._id === busId)?.plateNumber || busId,
  }));

  return (
    <OperatorLayout>
      <div className="flex flex-col md:flex-row h-full md:h-screen">
        {/* Left: Map */}
        <div className="flex-1 flex flex-col min-h-[50vh] md:min-h-0">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-700">
            <h2 className="font-heading font-semibold text-white">Fleet Overview</h2>
            <p className="text-slate-400 text-xs">{buses.length} buses · {buses.filter(b => b.status === 'on-route').length} on route</p>
          </div>
          <div className="flex-1 min-h-0">
            <FleetMap
              buses={busMarkersForMap}
              onBusClick={(busId) => setSelectedBus(buses.find((b) => b._id === busId))}
              height="100%"
            />
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-full md:w-80 bg-slate-800 flex flex-col border-t md:border-t-0 md:border-l border-slate-700 overflow-hidden md:max-h-screen">
          {/* Bus list */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2 bg-slate-700 text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Buses
            </div>
            {buses.map((bus) => (
              <div
                key={bus._id}
                onClick={() => setSelectedBus(bus)}
                className={`px-3 py-3 border-b border-slate-700 cursor-pointer hover:bg-slate-700/50 transition ${selectedBus?._id === bus._id ? 'bg-slate-700' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-white">{bus.plateNumber}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[bus.status] || 'bg-slate-400'}`} />
                </div>
                <p className="text-xs text-slate-400">{bus.driverName}</p>
                {bus.currentRouteId && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {bus.currentRouteId.origin}→{bus.currentRouteId.destination}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  {bus.lastPingAt ? `Last ping: ${new Date(bus.lastPingAt).toLocaleTimeString()}` : 'No ping yet'}
                </p>
              </div>
            ))}
          </div>

          {/* Alert feed */}
          <div className="h-72 flex flex-col border-t border-slate-600">
            <div className="px-3 py-2 bg-slate-700 text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center justify-between">
              <span>Alert Feed</span>
              {alerts.filter((a) => a.status === 'active').length > 0 && (
                <span className="bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {alerts.filter((a) => a.status === 'active').length}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">No alerts</p>
              ) : (
                alerts.map((alert, idx) => (
                  <div
                    key={alert._id || idx}
                    className={`px-3 py-2 border-b border-slate-700 ${alert.status === 'active' ? 'bg-red-900/20' : 'opacity-60'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-400 capitalize">
                          {alert.type?.replace(/-/g, ' ') || 'Alert'}
                        </p>
                        <p className="text-xs text-slate-300 truncate">
                          {alert.message || (alert.plateNumber ? `Bus ${alert.plateNumber}` : `Trip ${alert.tripId}`)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : 'Now'}
                        </p>
                      </div>
                      {alert.status === 'active' && alert._id && typeof alert._id === 'string' && (
                        <button
                          onClick={() => resolveIncident(alert._id)}
                          className="text-xs text-green-400 hover:text-green-300 shrink-0"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                    {alert.gps?.lat && (
                      <a
                        href={`https://maps.google.com/?q=${alert.gps.lat},${alert.gps.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                      >
                        View location
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bus detail modal */}
      {selectedBus && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
          <div className="bg-slate-800 border border-slate-600 rounded-t-2xl p-5 w-full max-w-lg pointer-events-auto shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">{selectedBus.plateNumber}</h3>
              <button onClick={() => setSelectedBus(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Driver</p>
                <p className="text-white">{selectedBus.driverName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Status</p>
                <p className="text-white capitalize">{selectedBus.status}</p>
              </div>
              {selectedBus.currentRouteId && (
                <div className="col-span-2">
                  <p className="text-slate-400 text-xs">Route</p>
                  <p className="text-white">
                    {selectedBus.currentRouteId.origin} → {selectedBus.currentRouteId.destination}
                  </p>
                </div>
              )}
              {selectedBus.lastPingAt && (
                <div className="col-span-2">
                  <p className="text-slate-400 text-xs">Last Ping</p>
                  <p className="text-white">{new Date(selectedBus.lastPingAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </OperatorLayout>
  );
}
