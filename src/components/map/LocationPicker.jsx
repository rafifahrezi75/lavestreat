import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin } from '@phosphor-icons/react';

const createCustomIcon = (color = '#2F6FED') => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export function LocationPicker({
  value,
  onChange,
  defaultCenter = { lat: -7.4478, lng: 112.7183 },
  height = '320px',
  label = 'Pilih Titik Lokasi Penjemputan'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [addressText, setAddressText] = useState(value?.teks || '');
  const [coordinates, setCoordinates] = useState(
    value?.lat && value?.lng
      ? { lat: value.lat, lng: value.lng }
      : defaultCenter
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coordinates.lat, coordinates.lng],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const marker = L.marker([coordinates.lat, coordinates.lng], {
        draggable: true,
        icon: createCustomIcon('#2F6FED')
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCoordinates({ lat: pos.lat, lng: pos.lng });
        reverseGeocode(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoordinates({ lat, lng });
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setAddressText(data.display_name);
          if (onChange) {
            onChange({
              lat,
              lng,
              teks: data.display_name
            });
          }
          return;
        }
      }
    } catch {
    }

    if (onChange) {
      onChange({
        lat,
        lng,
        teks: addressText || `Titik koordinat (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      });
    }
  };

  const handleAddressChange = (e) => {
    const newText = e.target.value;
    setAddressText(newText);
    if (onChange) {
      onChange({
        lat: coordinates.lat,
        lng: coordinates.lng,
        teks: newText
      });
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current && markerRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoordinates({ lat, lng });
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
          reverseGeocode(lat, lng);
        },
        () => {}
      );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-brand-900 flex items-center gap-1.5">
          <MapPin size={18} className="text-brand-600" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="text-xs text-brand-600 hover:text-brand-900 font-medium bg-brand-100 hover:bg-brand-200 px-3.5 py-1.5 rounded-full transition-colors"
        >
          Gunakan Lokasi Saya
        </button>
      </div>

      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full rounded-card border border-brand-200 overflow-hidden shadow-subtle"
      />

      <div className="flex flex-col gap-1">
        <input
          type="text"
          value={addressText}
          onChange={handleAddressChange}
          placeholder="Tulis alamat lengkap atau patokan lokasi..."
          className="w-full rounded-md border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-ink-deep placeholder:text-slate-wet/60 focus:border-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-600/20"
        />
        <span className="text-xs text-slate-wet">
          Klik pada peta atau geser pin biru untuk menentukan titik penjemputan yang presisi.
        </span>
      </div>
    </div>
  );
}
