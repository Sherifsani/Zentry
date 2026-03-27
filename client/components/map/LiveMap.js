'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const busIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#1d4ed8;
    color:white;
    border-radius:50%;
    width:32px;
    height:32px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:18px;
    border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
  ">🚌</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const originIcon = L.divIcon({
  className: '',
  html: `<div style="background:#16a34a;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">A</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const destIcon = L.divIcon({
  className: '',
  html: `<div style="background:#dc2626;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">B</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function LiveMap({ busPosition, waypoints, origin, destination, height = '400px' }) {
  const defaultCenter = busPosition
    ? [busPosition.lat, busPosition.lng]
    : waypoints?.length
    ? [waypoints[0].lat, waypoints[0].lng]
    : [9.0765, 7.3986]; // Abuja default

  const routeLine = waypoints?.map((wp) => [wp.lat, wp.lng]) || [];

  return (
    <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer
        center={defaultCenter}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route line */}
        {routeLine.length > 1 && (
          <Polyline positions={routeLine} color="#1d4ed8" weight={4} opacity={0.7} dashArray="8 4" />
        )}

        {/* Origin marker */}
        {waypoints?.[0] && (
          <Marker position={[waypoints[0].lat, waypoints[0].lng]} icon={originIcon}>
            <Popup>{origin || waypoints[0].name}</Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {waypoints?.length > 1 && (
          <Marker
            position={[waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lng]}
            icon={destIcon}
          >
            <Popup>{destination || waypoints[waypoints.length - 1].name}</Popup>
          </Marker>
        )}

        {/* Bus position */}
        {busPosition && (
          <>
            <Marker position={[busPosition.lat, busPosition.lng]} icon={busIcon}>
              <Popup>
                <strong>Bus</strong><br />
                Speed: {busPosition.speed || 0} km/h<br />
                {busPosition.status && `Status: ${busPosition.status}`}
              </Popup>
            </Marker>
            <MapUpdater center={[busPosition.lat, busPosition.lng]} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
