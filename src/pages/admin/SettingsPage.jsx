import React, { useState, useEffect } from 'react';
import { Save, Check, RefreshCw, MapPin } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LocationPicker } from '../../components/map/LocationPicker';
import { useToast } from '../../context/ToastContext';
import { settingsApi, seedFirestore } from '../../lib/api';
import { isFirebaseConfigured } from '../../lib/firebase';

export function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showWorkerMap, setShowWorkerMap] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  const [settings, setSettings] = useState({
    outlet_lat: -7.4478,
    outlet_lng: 112.7183,
    outlet_address: '',
    worker_lat: -7.4505,
    worker_lng: 112.7150,
    worker_address: '',
    default_route_origin: 'outlet',
    contact_email: '',
    contact_phone: '',
    instagram: '',
    jam_operasional: ''
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await settingsApi.getSettings();
        if (s) setSettings(prev => ({ ...prev, ...s }));
      } catch {
        showToast('Gagal memuat pengaturan', 'danger');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [showToast]);

  const handleFieldChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocationChange = (loc) => {
    setSettings((prev) => ({
      ...prev,
      outlet_lat: loc.lat,
      outlet_lng: loc.lng,
      outlet_address: loc.teks
    }));
  };

  const handleWorkerLocationChange = (loc) => {
    setSettings((prev) => ({
      ...prev,
      worker_lat: loc.lat,
      worker_lng: loc.lng,
      worker_address: loc.teks
    }));
  };

  const handleDetectWorkerGps = () => {
    if (!navigator.geolocation) {
      showToast('Browser tidak mendukung deteksi lokasi GPS.', 'danger');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSettings((prev) => ({
          ...prev,
          worker_lat: Number(pos.coords.latitude.toFixed(6)),
          worker_lng: Number(pos.coords.longitude.toFixed(6))
        }));
        setDetectingGps(false);
        showToast('Berhasil mendeteksi koordinat GPS worker saat ini.');
      },
      (err) => {
        setDetectingGps(false);
        showToast('Gagal mendeteksi lokasi GPS: ' + err.message, 'danger');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateSettings(settings);
      showToast('Pengaturan outlet berhasil disimpan.');
    } catch {
      showToast('Gagal menyimpan pengaturan', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncFirestore = async () => {
    setSyncing(true);
    try {
      const res = await seedFirestore(true);
      if (res.success) {
        showToast(res.message);
      } else {
        showToast(res.message, 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Gagal sinkronisasi ke Firestore', 'danger');
    } finally {
      setSyncing(false);
    }
  };

  const settingRows = [
    {
      key: 'contact_phone',
      label: 'Nomor WhatsApp / CS',
      desc: 'Kontak penerima chat pemesanan dan konfirmasi',
      value: settings.contact_phone,
      placeholder: '081234567890'
    },
    {
      key: 'contact_email',
      label: 'Alamat Email Outlet',
      desc: 'Email resmi Lave Streat untuk korespondensi',
      value: settings.contact_email,
      placeholder: 'halo@lavestreat.com'
    },
    {
      key: 'instagram',
      label: 'Akun Instagram',
      desc: 'Username Instagram tanpa tanda @',
      value: settings.instagram,
      placeholder: 'lavestreat'
    },
    {
      key: 'jam_operasional',
      label: 'Jam Operasional',
      desc: 'Jadwal buka outlet yang ditampilkan di footer',
      value: settings.jam_operasional,
      placeholder: 'Senin - Sabtu: 09.00 - 20.00 WIB'
    },
    {
      key: 'outlet_address',
      label: 'Alamat Fisik Outlet',
      desc: 'Alamat outlet utama titik asal rute kurir jemput',
      value: settings.outlet_address,
      placeholder: 'Jl. Raya Ponti No. 18, Magersari, Sidoarjo'
    },
    {
      key: 'worker_address',
      label: 'Alamat Pos / Basecamp Worker',
      desc: 'Alamat standby kurir/worker untuk penentuan rute jemput',
      value: settings.worker_address,
      placeholder: 'Jl. Kartini No. 15, Sidoarjo'
    }
  ];

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-brand-900 tracking-tight">
            Pengaturan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola konfigurasi outlet, kontak publik, jam operasional, dan lokasi GPS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSyncFirestore}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-md shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sinkronisasi...' : 'Sinkronkan Firestore'}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-400">
          Memuat data pengaturan...
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <Card noPadding rounded="2xl" className="w-full overflow-hidden border-slate-200/80 bg-white shadow-xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase font-bold text-brand-900 tracking-wider">
                  Koneksi Database Cloud
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Status sinkronisasi backend Firebase Firestore
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Check className="w-3 h-3" />
                  <span>{isFirebaseConfigured ? 'Firebase Terhubung' : 'Penyimpanan Lokal Aktif'}</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-700 font-semibold">
                  <tr>
                    <th scope="col" className="px-4 py-3 w-1/4">Parameter</th>
                    <th scope="col" className="px-4 py-3 w-1/3">Keterangan</th>
                    <th scope="col" className="px-4 py-3">Nilai Konfigurasi (Edit Langsung)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settingRows.map((row) => (
                    <tr key={row.key} className="hover:bg-brand-100/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-brand-900 whitespace-nowrap align-top">
                        {row.label}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-wet align-top">
                        {row.desc}
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          value={row.value || ''}
                          onChange={(e) => handleFieldChange(row.key, e.target.value)}
                          placeholder={row.placeholder}
                          className="w-full px-3 py-1.5 rounded-md border border-brand-200 bg-white text-xs sm:text-sm text-brand-900 focus:outline-hidden focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="hover:bg-brand-100/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand-900 whitespace-nowrap align-top">
                      Default Titik Asal Rute
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-wet align-top">
                      Menentukan titik awal saat membuka kalkulasi rute jalan tercepat ke pelanggan
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={settings.default_route_origin || 'outlet'}
                        onChange={(e) => handleFieldChange('default_route_origin', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-brand-200 bg-white text-xs sm:text-sm text-brand-900 focus:outline-hidden focus:ring-2 focus:ring-brand-600 cursor-pointer"
                      >
                        <option value="outlet">Dari Alamat Outlet Toko Utama</option>
                        <option value="worker">Dari Alamat Pos / Basecamp Worker</option>
                        <option value="gps">Otomatis Deteksi GPS Lokasi Worker Saat Ini</option>
                      </select>
                    </td>
                  </tr>

                  <tr className="hover:bg-brand-100/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand-900 whitespace-nowrap align-top">
                      Titik GPS Outlet Toko
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-wet align-top">
                      Latitude & Longitude outlet utama untuk rute OSRM
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          value={settings.outlet_lat ?? ''}
                          onChange={(e) => handleFieldChange('outlet_lat', parseFloat(e.target.value))}
                          placeholder="Lat (-7.4478)"
                          className="w-1/2 px-3 py-1.5 rounded-md border border-brand-200 bg-white text-xs sm:text-sm text-brand-900 focus:outline-hidden focus:ring-2 focus:ring-brand-600"
                        />
                        <input
                          type="number"
                          step="any"
                          value={settings.outlet_lng ?? ''}
                          onChange={(e) => handleFieldChange('outlet_lng', parseFloat(e.target.value))}
                          placeholder="Lng (112.7183)"
                          className="w-1/2 px-3 py-1.5 rounded-md border border-brand-200 bg-white text-xs sm:text-sm text-brand-900 focus:outline-hidden focus:ring-2 focus:ring-brand-600"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowMap(!showMap)}
                          className="shrink-0 flex items-center gap-1"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{showMap ? 'Tutup Peta' : 'Peta Outlet'}</span>
                        </Button>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-brand-100/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand-900 whitespace-nowrap align-top">
                      Titik GPS Worker / Kurir
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-wet align-top">
                      Latitude & Longitude basecamp worker standby
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <input
                          type="number"
                          step="any"
                          value={settings.worker_lat ?? ''}
                          onChange={(e) => handleFieldChange('worker_lat', parseFloat(e.target.value))}
                          placeholder="Lat (-7.4505)"
                          className="w-1/2 px-3 py-1.5 rounded-md border border-brand-200 bg-white text-xs sm:text-sm text-brand-900 focus:outline-hidden focus:ring-2 focus:ring-brand-600"
                        />
                        <input
                          type="number"
                          step="any"
                          value={settings.worker_lng ?? ''}
                          onChange={(e) => handleFieldChange('worker_lng', parseFloat(e.target.value))}
                          placeholder="Lng (112.7150)"
                          className="w-1/2 px-3 py-1.5 rounded-md border border-brand-200 bg-white text-xs sm:text-sm text-brand-900 focus:outline-hidden focus:ring-2 focus:ring-brand-600"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDetectWorkerGps}
                          disabled={detectingGps}
                          className="shrink-0 text-xs font-semibold"
                        >
                          <span>{detectingGps ? 'Mendeteksi...' : 'GPS Saya'}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowWorkerMap(!showWorkerMap)}
                          className="shrink-0 flex items-center gap-1"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{showWorkerMap ? 'Tutup Peta' : 'Peta Worker'}</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {showMap && (
            <Card className="p-4 border-brand-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-900">
                  Pilih Titik Lokasi Outlet di Peta Leaflet
                </span>
                <span className="text-xs text-slate-wet">
                  Klik pada peta untuk memindahkan pin outlet
                </span>
              </div>
              <LocationPicker
                value={{
                  lat: settings.outlet_lat,
                  lng: settings.outlet_lng,
                  teks: settings.outlet_address
                }}
                onChange={handleLocationChange}
                height="320px"
              />
            </Card>
          )}

          {showWorkerMap && (
            <Card className="p-4 border-brand-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-900">
                  Pilih Titik Lokasi Worker / Kurir di Peta Leaflet
                </span>
                <span className="text-xs text-slate-wet">
                  Klik pada peta untuk memindahkan pin posisi worker
                </span>
              </div>
              <LocationPicker
                value={{
                  lat: settings.worker_lat,
                  lng: settings.worker_lng,
                  teks: settings.worker_address
                }}
                onChange={handleWorkerLocationChange}
                height="320px"
              />
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Menyimpan Pengaturan...' : 'Simpan Semua Pengaturan'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
