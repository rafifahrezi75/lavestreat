import { 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { initialSettings } from './mockData';

const SETTINGS_KEY = 'lavestreat_settings_general';

export const settingsApi = {
  async getSettings() {
    if (isFirebaseConfigured) {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) return snap.data();
    }

    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(initialSettings));
      return initialSettings;
    }
    return JSON.parse(data);
  },

  async updateSettings(payload) {
    const cleanPayload = {
      outlet_lat: Number(payload.outlet_lat) || -7.4478,
      outlet_lng: Number(payload.outlet_lng) || 112.7183,
      outlet_address: payload.outlet_address || 'Jl. Raya Ponti No. 18, Magersari, Sidoarjo',
      worker_lat: Number(payload.worker_lat) || -7.4505,
      worker_lng: Number(payload.worker_lng) || 112.7150,
      worker_address: payload.worker_address || 'Pos / Basecamp Kurir Lave Streat, Sidoarjo',
      default_route_origin: payload.default_route_origin || 'outlet',
      contact_email: payload.contact_email || 'halo@lavestreat.com',
      contact_phone: payload.contact_phone || '081234567890',
      instagram: payload.instagram || 'lavestreat',
      jam_operasional: payload.jam_operasional || 'Senin - Sabtu: 09.00 - 20.00 WIB',
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
