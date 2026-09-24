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
      outlet_lat: Number(payload.outlet_lat) || initialSettings.outlet_lat,
      outlet_lng: Number(payload.outlet_lng) || initialSettings.outlet_lng,
      outlet_address: payload.outlet_address || initialSettings.outlet_address,
      contact_email: payload.contact_email || initialSettings.contact_email,
      contact_phone: payload.contact_phone || initialSettings.contact_phone,
      instagram: payload.instagram || initialSettings.instagram,
      jam_operasional: payload.jam_operasional || initialSettings.jam_operasional,
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
