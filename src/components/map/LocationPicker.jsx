import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, MagnifyingGlass, X } from '@phosphor-icons/react';
import { useToast } from '../../context/ToastContext';

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
  const { showToast } = useToast();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [addressText, setAddressText] = useState(value?.teks || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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
        minZoom: 10,
        maxZoom: 19,
        maxBounds: [
          [-7.70, 112.35],
          [-7.10, 113.05]
        ],
        maxBoundsViscosity: 0.8,
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
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (value?.teks && value.teks !== addressText) {
      setAddressText(value.teks);
    }
    if (value?.lat && value?.lng && (value.lat !== coordinates.lat || value.lng !== coordinates.lng)) {
      setCoordinates({ lat: value.lat, lng: value.lng });
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([value.lat, value.lng], mapInstanceRef.current.getZoom() || 14);
        markerRef.current.setLatLng([value.lat, value.lng]);
      }
    }
  }, [value?.teks, value?.lat, value?.lng]);

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

  const handleSearch = (query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const bbox = '112.48,-7.15,112.90,-7.62';
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&viewbox=${bbox}&bounded=1&limit=6`;
        let res = await fetch(url, {
          headers: { 'Accept-Language': 'id' }
        });
        let data = res.ok ? await res.json() : [];

        if (!data || data.length === 0) {
          const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Sidoarjo Surabaya')}&countrycodes=id&viewbox=${bbox}&limit=6`;
          const fallbackRes = await fetch(fallbackUrl, {
            headers: { 'Accept-Language': 'id' }
          });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            data = fallbackData.filter((item) => {
              const lat = parseFloat(item.lat);
              const lon = parseFloat(item.lon);
              return lat >= -7.68 && lat <= -7.12 && lon >= 112.45 && lon <= 112.95;
            });
          }
        }

        setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    if (isNaN(lat) || isNaN(lng)) return;

    setCoordinates({ lat, lng });
    setAddressText(item.display_name);
    setSearchQuery(item.display_name.split(',')[0]);
    setSuggestions([]);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
    }

    if (onChange) {
      onChange({
        lat,
        lng,
        teks: item.display_name
      });
    }

    showToast('Titik lokasi berhasil diarahkan.', 'success');
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
    if (!navigator.geolocation) {
      showToast('Perangkat tidak mendukung fitur lokasi.', 'danger');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoordinates({ lat, lng });
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
        }
        reverseGeocode(lat, lng);
        showToast('Titik lokasi berhasil didapatkan.', 'success');
      },
      () => {
        showToast('Gagal mendeteksi lokasi. Pastikan izin lokasi browser aktif.', 'danger');
      }
    );
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
          className="text-xs text-brand-600 hover:text-brand-900 font-medium bg-brand-100 hover:bg-brand-200 px-3.5 py-1.5 rounded-md transition-colors"
        >
          Gunakan Lokasi Saya
        </button>
      </div>

      <div className="relative">
        <div className="relative flex items-center">
          <MagnifyingGlass size={16} className="absolute left-3.5 text-brand-600 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Cari lokasi Sidoarjo & Surabaya (jalan, perumahan, gedung)..."
            className="w-full pl-9 pr-9 py-2.5 rounded-md border border-brand-200 bg-white text-xs sm:text-sm text-brand-900 placeholder:text-slate-wet/60 focus:border-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-600/20 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>

        {isSearching && (
          <div className="absolute right-9 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {suggestions.length > 0 && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setSuggestions([])} />
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-md border border-brand-200 shadow-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-brand-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                >
                  <MapPin size={16} className="text-brand-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-brand-900 line-clamp-1">
                      {item.display_name.split(',')[0]}
                    </p>
                    <p className="text-[11px] text-slate-wet line-clamp-1 mt-0.5">
                      {item.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full rounded-md border border-brand-200 overflow-hidden shadow-subtle"
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
          Cari alamat di atas, klik pada peta, atau geser pin biru untuk menentukan titik penjemputan yang presisi.
        </span>
      </div>
    </div>
  );
}
