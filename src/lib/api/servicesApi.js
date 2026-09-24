import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { initialServices } from './mockData';

const STORAGE_KEY = 'lavestreat_services_data_v5';

function getLocalServices() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialServices));
    return initialServices;
  }
  return JSON.parse(data);
}

function saveLocalServices(services) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

export const servicesApi = {
  async getServices(onlyActive = true) {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, 'services');
        const q = onlyActive ? query(colRef, where('aktif', '==', true)) : colRef;
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (err) {
        console.warn('Firestore services fallback:', err.message);
      }
    }

    const services = getLocalServices();
    if (onlyActive) {
      return services.filter(s => s.aktif);
    }
    return services;
  },

  async getServiceById(id) {
    if (isFirebaseConfigured) {
      const snap = await getDoc(doc(db, 'services', id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    }

    const services = getLocalServices();
    return services.find(s => s.id === id) || null;
  },

  async createService(payload) {
    const cleanPayload = {
      nama: payload.nama,
      kategori: payload.kategori,
      deskripsi: payload.deskripsi,
      harga: Math.round(Number(payload.harga) || 0),
      satuan: payload.satuan || 'per pasang',
      foto: payload.foto || '',
      aktif: payload.aktif !== false,
      created_at: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, 'services'), cleanPayload);
      return { id: docRef.id, ...cleanPayload };
    }

    const services = getLocalServices();
    const newService = {
      id: 'srv-' + Date.now(),
      ...cleanPayload
    };
    services.unshift(newService);
    saveLocalServices(services);
    return newService;
  },

  async updateService(id, payload) {
    const cleanPayload = {
      nama: payload.nama,
      kategori: payload.kategori,
      deskripsi: payload.deskripsi,
      harga: Math.round(Number(payload.harga) || 0),
      satuan: payload.satuan || 'per pasang',
      foto: payload.foto || '',
      aktif: payload.aktif !== false,
      updated_at: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      await updateDoc(doc(db, 'services', id), cleanPayload);
      return { id, ...cleanPayload };
    }

    const services = getLocalServices();
    const index = services.findIndex(s => s.id === id);
    if (index !== -1) {
      services[index] = { ...services[index], ...cleanPayload };
      saveLocalServices(services);
      return services[index];
    }
    throw new Error('Layanan tidak ditemukan');
  },

  async toggleActive(id, aktifState) {
    if (isFirebaseConfigured) {
      await updateDoc(doc(db, 'services', id), { aktif: aktifState });
      return true;
    }

    const services = getLocalServices();
    const index = services.findIndex(s => s.id === id);
    if (index !== -1) {
      services[index].aktif = aktifState;
      saveLocalServices(services);
      return true;
    }
    throw new Error('Layanan tidak ditemukan');
  }
};
