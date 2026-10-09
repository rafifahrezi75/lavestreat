import { 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { initialSettings } from './mockData';

const SETTINGS_KEY = 'lavestreat_settings_general';

const defaultWorkers = [
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
];

function normalizeSettings(data) {
  if (!data) return {};
  const workers = Array.isArray(data.workers) && data.workers.length > 0 ? data.workers : defaultWorkers;
  const primaryWorker = workers[0] || defaultWorkers[0];

  return {
    ...data,
    outlet_lat: Number(data.outlet_lat ?? data.outlet?.koordinat?.lat) || -7.4338,
    outlet_lng: Number(data.outlet_lng ?? data.outlet?.koordinat?.lng) || 112.7214,
    outlet_address: data.outlet_address || data.outlet?.alamat || 'Perumahan Jl. Pd. Jati No.2 BM 55, Sidoarjo, Jawa Timur',
    worker_lat: Number(data.worker_lat) || primaryWorker.lat,
    worker_lng: Number(data.worker_lng) || primaryWorker.lng,
    worker_address: data.worker_address || primaryWorker.address,
    contact_phone: data.contact_phone || data.kontak?.whatsapp || '085128024120',
    contact_email: data.contact_email || data.kontak?.email || 'lavestreat@gmail.com',
    instagram: data.instagram || data.kontak?.instagram || 'lave_streat',
    jam_operasional: data.jam_operasional || (data.operasional ? `${data.operasional.hari}: ${data.operasional.jam}` : 'Setiap Hari: 09.00 - 18.00 WIB'),
    default_route_origin: data.default_route_origin || 'outlet',
    workers: workers.map(w => ({
      id: w.id || 'wkr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      nama: w.nama || 'Worker Kurir',
      telepon: w.telepon || '',
      lat: Number(w.lat) || -7.4505,
      lng: Number(w.lng) || 112.7150,
      address: w.address || 'Pos Kurir Lave Streat',
      aktif: w.aktif !== false
    }))
  };
}

export const settingsApi = {
  async getSettings() {
    if (isFirebaseConfigured) {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) return normalizeSettings(snap.data());
    }

    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      const initial = normalizeSettings(initialSettings);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(initial));
      return initial;
    }
    return normalizeSettings(JSON.parse(data));
  },

  async updateSettings(payload) {
    const norm = normalizeSettings(payload);
    const primaryWorker = norm.workers[0] || defaultWorkers[0];

    const cleanPayload = {
      outlet_lat: norm.outlet_lat,
      outlet_lng: norm.outlet_lng,
      outlet_address: norm.outlet_address,
      worker_lat: primaryWorker.lat,
      worker_lng: primaryWorker.lng,
      worker_address: primaryWorker.address,
      workers: norm.workers,
      default_route_origin: payload.default_route_origin || 'outlet',
      contact_email: payload.contact_email || 'lavestreat@gmail.com',
      contact_phone: payload.contact_phone || '085128024120',
      instagram: payload.instagram || 'lave_streat',
      jam_operasional: payload.jam_operasional || 'Setiap Hari: 09.00 - 18.00 WIB',
      updated_at: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'settings', 'general'), cleanPayload, { merge: true });
      return cleanPayload;
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(cleanPayload));
    return cleanPayload;
  }
};
