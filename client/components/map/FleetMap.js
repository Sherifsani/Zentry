'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS = {
  'on-route': '#16a34a',
  'idle': '#64748b',
  'stopped': '#ea580c',
  'alert': '#dc2626',
  'arrived': '#2563eb',
  'offline': '#374151',
  'delayed': '#ca8a04',
};

const makeBusIcon = (status, plateNumber) =>
  L.divIcon({
    className: '',
    html: `<div style="
      background:${STATUS_COLORS[status] || '#64748b'};
      color:white;
      border-radius:8px;
      padding:3px 6px;
      font-size:10px;
      font-weight:700;
      border:2px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      white-space:nowrap;
      min-width:32px;
      text-align:center;
    ">${plateNumber?.split('-')[0] || '🚌'}</div>`,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
  });

export default function FleetMap({ buses = [], onBusClick, height = '100%' }) {
  const center = buses.length > 0
    ? [buses[0].lat || 9.0765, buses[0].lng || 7.3986]
    : [7.5, 5.0]; // Nigeria center

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {buses.map((bus) =>
          bus.lat && bus.lng ? (
            <Marker
              key={bus.busId}
              position={[bus.lat, bus.lng]}
              icon={makeBusIcon(bus.status, bus.plateNumber)}
              eventHandlers={{ click: () => onBusClick?.(bus.busId) }}
            >
              <Popup>
                <strong>{bus.plateNumber}</strong><br />
                Status: {bus.status}<br />
                {bus.tripId && `Trip: ${bus.tripId}`}
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
