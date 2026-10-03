import React, { useState, useEffect } from 'react';
import { Save, Check, RefreshCw, MapPin, Plus, Trash2, Navigation } from 'lucide-react';
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
  const [showOutletMap, setShowOutletMap] = useState(false);
  const [activeWorkerMapId, setActiveWorkerMapId] = useState(null);
  const [detectingWorkerGpsId, setDetectingWorkerGpsId] = useState(null);

  const [settings, setSettings] = useState({
    outlet_lat: -7.4478,
    outlet_lng: 112.7183,
    outlet_address: '',
    worker_lat: -7.4505,
    worker_lng: 112.7150,
    worker_address: '',
    workers: [
      {
        id: 'wkr-1',
        nama: 'Kurir 1 - Sidoarjo Kota',
        telepon: '085128024120',
        lat: -7.4505,
        lng: 112.7150,
        address: 'Pos Standby Alun-Alun Sidoarjo',
        aktif: true
      },
      {
        id: 'wkr-2',
        nama: 'Kurir 2 - Waru & Surabaya',
        telepon: '081234567891',
        lat: -7.3550,
        lng: 112.7300,
        address: 'Pos Standby Bundaran Waru, Sidoarjo Utara',
        aktif: true
      }
    ],
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
        if (s) {
          setSettings(prev => ({
            ...prev,
            ...s,
            workers: Array.isArray(s.workers) && s.workers.length > 0 ? s.workers : prev.workers
          }));
        }
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

  const handleAddWorker = () => {
    const nextIndex = (settings.workers?.length || 0) + 1;
    const newWorker = {
      id: 'wkr-' + Date.now(),
      nama: `Kurir ${nextIndex}`,
      telepon: '',
      lat: -7.4505,
      lng: 112.7150,
      address: 'Pos Standby Baru',
      aktif: true
    };
    setSettings(prev => ({
      ...prev,
      workers: [...(prev.workers || []), newWorker]
    }));
    setActiveWorkerMapId(newWorker.id);
    showToast('Titik worker baru berhasil ditambahkan.');
  };

  const handleRemoveWorker = (id) => {
    if ((settings.workers || []).length <= 1) {
      showToast('Minimal harus ada 1 titik worker / kurir.', 'danger');
      return;
    }
    setSettings(prev => ({
      ...prev,
      workers: (prev.workers || []).filter(w => w.id !== id)
    }));
    if (activeWorkerMapId === id) setActiveWorkerMapId(null);
    showToast('Titik worker telah dihapus.');
  };

  const handleWorkerFieldChange = (id, field, value) => {
    setSettings(prev => ({
      ...prev,
      workers: (prev.workers || []).map(w => w.id === id ? { ...w, [field]: value } : w)
    }));
  };

  const handleDetectWorkerGps = (id) => {
    if (!navigator.geolocation) {
      showToast('Browser tidak mendukung deteksi lokasi GPS.', 'danger');
      return;
    }
    setDetectingWorkerGpsId(id);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setSettings(prev => ({
          ...prev,
          workers: (prev.workers || []).map(w => w.id === id ? { ...w, lat, lng } : w)
        }));
        setDetectingWorkerGpsId(null);
        showToast('Berhasil mendeteksi koordinat GPS worker saat ini.');
      },
      (err) => {
        setDetectingWorkerGpsId(null);
        showToast('Gagal mendeteksi lokasi GPS: ' + err.message, 'danger');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleWorkerMapLocationChange = (loc) => {
    if (!activeWorkerMapId) return;
    setSettings(prev => ({
      ...prev,
      workers: (prev.workers || []).map(w => w.id === activeWorkerMapId ? {
        ...w,
        lat: loc.lat,
        lng: loc.lng,
        address: loc.teks || w.address
      } : w)
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateSettings(settings);
      showToast('Pengaturan outlet dan data kurir berhasil disimpan.');
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
    }
  ];

  const activeWorkerForMap = (settings.workers || []).find(w => w.id === activeWorkerMapId);

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-brand-900 tracking-tight">
            Pengaturan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola konfigurasi outlet, kontak publik, jam operasional, dan titik GPS multi-kurir.
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
                        <option value="worker">Dari Titik Pos Worker / Kurir Terpilih</option>
                        <option value="gps">Otomatis Deteksi GPS Lokasi Perangkat Saat Ini</option>
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
                          onClick={() => setShowOutletMap(!showOutletMap)}
                          className="shrink-0 flex items-center gap-1 rounded-md"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{showOutletMap ? 'Tutup Peta' : 'Peta Outlet'}</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {showOutletMap && (
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

          <Card noPadding rounded="2xl" className="w-full overflow-hidden border-slate-200/80 bg-white shadow-xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase font-bold text-brand-900 tracking-wider">
                  Daftar Titik GPS Worker / Kurir Standby
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola multi-titik pangkalan / kurir standby untuk pilihan titik awal rute penjemputan dan pengantaran sepatu
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddWorker}
                className="flex items-center gap-1.5 rounded-md self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Titik Kurir</span>
              </Button>
            </div>

            <div className="divide-y divide-slate-100">
              {(settings.workers || []).map((worker, index) => (
                <div key={worker.id || index} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={worker.nama || ''}
                        onChange={(e) => handleWorkerFieldChange(worker.id, 'nama', e.target.value)}
                        placeholder="Nama Kurir / Pos Standby"
                        className="font-bold text-sm text-brand-900 px-2 py-1 rounded-md border border-transparent hover:border-brand-200 focus:border-brand-600 focus:bg-white focus:outline-hidden transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-medium mr-2">
                        <input
                          type="checkbox"
                          checked={worker.aktif !== false}
                          onChange={(e) => handleWorkerFieldChange(worker.id, 'aktif', e.target.checked)}
                          className="rounded text-brand-600 focus:ring-brand-600"
                        />
                        <span>Aktif</span>
                      </label>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDetectWorkerGps(worker.id)}
                        disabled={detectingWorkerGpsId === worker.id}
                        className="text-xs flex items-center gap-1 rounded-md"
                      >
                        <Navigation className={`w-3 h-3 ${detectingWorkerGpsId === worker.id ? 'animate-spin' : ''}`} />
                        <span>{detectingWorkerGpsId === worker.id ? 'Mendeteksi...' : 'GPS Saya'}</span>
                      </Button>

                      <Button
                        type="button"
                        variant={activeWorkerMapId === worker.id ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveWorkerMapId(activeWorkerMapId === worker.id ? null : worker.id)}
                        className="text-xs flex items-center gap-1 rounded-md"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{activeWorkerMapId === worker.id ? 'Tutup Peta' : 'Peta Pos'}</span>
                      </Button>

                      {(settings.workers || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWorker(worker.id)}
                          className="p-1.5 text-slate-400 hover:text-danger rounded-md hover:bg-red-50 transition-colors"
                          title="Hapus Titik Kurir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                    <div className="md:col-span-3 flex flex-col gap-1">
                      <label className="text-slate-500 font-medium">Nomor Telepon / WA Kurir</label>
                      <input
                        type="text"
                        value={worker.telepon || ''}
                        onChange={(e) => handleWorkerFieldChange(worker.id, 'telepon', e.target.value)}
                        placeholder="Contoh: 085128024120"
                        className="px-3 py-1.5 rounded-md border border-brand-200 bg-white text-brand-900 focus:outline-hidden focus:ring-1 focus:ring-brand-600"
                      />
                    </div>

                    <div className="md:col-span-5 flex flex-col gap-1">
                      <label className="text-slate-500 font-medium">Alamat Pos / Basecamp Standby</label>
                      <input
                        type="text"
                        value={worker.address || ''}
                        onChange={(e) => handleWorkerFieldChange(worker.id, 'address', e.target.value)}
                        placeholder="Alamat standby atau nama area pangkalan"
                        className="px-3 py-1.5 rounded-md border border-brand-200 bg-white text-brand-900 focus:outline-hidden focus:ring-1 focus:ring-brand-600"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-slate-500 font-medium">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={worker.lat ?? ''}
                        onChange={(e) => handleWorkerFieldChange(worker.id, 'lat', parseFloat(e.target.value))}
                        placeholder="-7.4505"
                        className="px-3 py-1.5 rounded-md border border-brand-200 bg-white text-brand-900 focus:outline-hidden focus:ring-1 focus:ring-brand-600 font-mono"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-slate-500 font-medium">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={worker.lng ?? ''}
                        onChange={(e) => handleWorkerFieldChange(worker.id, 'lng', parseFloat(e.target.value))}
                        placeholder="112.7150"
                        className="px-3 py-1.5 rounded-md border border-brand-200 bg-white text-brand-900 focus:outline-hidden focus:ring-1 focus:ring-brand-600 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {activeWorkerForMap && (
            <Card className="p-4 border-brand-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-brand-900">
                    Pilih Titik Lokasi {activeWorkerForMap.nama || 'Worker / Kurir'} di Peta Leaflet
                  </span>
                  <p className="text-xs text-slate-wet mt-0.5">
                    Klik pada peta untuk menetapkan koordinat standby kurir ini
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveWorkerMapId(null)}
                  className="text-xs rounded-md"
                >
                  Selesai
                </Button>
              </div>
              <LocationPicker
                value={{
                  lat: activeWorkerForMap.lat,
                  lng: activeWorkerForMap.lng,
                  teks: activeWorkerForMap.address
                }}
                onChange={handleWorkerMapLocationChange}
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
              className="flex items-center gap-1.5 rounded-md"
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

