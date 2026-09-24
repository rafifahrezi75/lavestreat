import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Path, Clock, MapPin } from '@phosphor-icons/react';

const createCustomIcon = (color = '#0A3D66', label = 'O') => {
  return L.divIcon({
    className: 'custom-route-marker',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
      ${label}
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export function RouteMap({
  origin = { lat: -7.4478, lng: 112.7183, address: 'Outlet Lave Streat' },
  destination,
  height = '360px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [routeInfo, setRouteInfo] = useState({
    distanceKm: null,
    durationMin: null,
    loading: true,
    error: false
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!destination || !destination.lat || !destination.lng) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const originMarker = L.marker([origin.lat, origin.lng], {
      icon: createCustomIcon('#0A3D66', 'O')
    }).addTo(map).bindPopup(`<b>Outlet Lave Streat</b><br/>${origin.address || ''}`);

    const destMarker = L.marker([destination.lat, destination.lng], {
      icon: createCustomIcon('#2F6FED', 'T')
    }).addTo(map).bindPopup(`<b>Tujuan Pelanggan</b><br/>${destination.teks || ''}`);

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

            const polyline = L.polyline(coordinates, {
              color: '#2F6FED',
              weight: 5,
              opacity: 0.85,
              smoothFactor: 1
            }).addTo(map);

            map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

            setRouteInfo({
              distanceKm: (route.distance / 1000).toFixed(1),
              durationMin: Math.ceil(route.duration / 60),
              loading: false,
              error: false
            });
            return;
          }
        }
      } catch {
      }

      const straightLine = L.polyline([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      ], {
        color: '#8ED1F0',
        weight: 4,
        dashArray: '8, 8'
      }).addTo(map);

      map.fitBounds(straightLine.getBounds(), { padding: [40, 40] });

      const distM = L.latLng(origin.lat, origin.lng).distanceTo(L.latLng(destination.lat, destination.lng));
      setRouteInfo({
        distanceKm: (distM / 1000).toFixed(1),
        durationMin: Math.ceil((distM / 1000) * 3),
        loading: false,
        error: true
      });
    };

    fetchRoute();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [origin, destination]);

  if (!destination || !destination.lat || !destination.lng) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-card border border-brand-200 bg-brand-100/30 flex flex-col items-center justify-center p-6 text-center text-slate-wet"
      >
        <MapPin size={32} className="text-slate-wet/60 mb-2" />
        <p className="text-sm font-medium">Titik koordinat penjemputan belum tersedia pada pesanan ini.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-brand-100 rounded-card border border-brand-200 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-medium text-brand-900">
          <Path size={18} className="text-brand-600" />
          <span>Jarak Rute: <strong>{routeInfo.distanceKm ? `${routeInfo.distanceKm} km` : 'Menghitung...'}</strong></span>
        </div>
        <div className="flex items-center gap-2 font-medium text-brand-900">
          <Clock size={18} className="text-brand-600" />
          <span>Estimasi Waktu: <strong>{routeInfo.durationMin ? `±${routeInfo.durationMin} menit` : 'Menghitung...'}</strong></span>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full rounded-card border border-brand-200 overflow-hidden shadow-subtle"
      />
    </div>
  );
}
