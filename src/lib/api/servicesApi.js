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

const STORAGE_KEY = 'lavestreat_services_data_v10';

function getLocalServices() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data || !data.includes('srv-easy')) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialServices));
    return initialServices;
  }
  return JSON.parse(data);
}

function saveLocalServices(services) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

const defaultPhotoMap = {
  'srv-easy': '/services/medium-clean.jpg',
  'srv-medium': '/services/medium-clean.jpg',
  'srv-deep': '/services/deep-clean.jpg',
  'srv-white': '/services/white-clean.jpg',
  'srv-leather': '/services/deep-clean.jpg',
  'srv-suede': '/services/suede-clean.jpg',
  'srv-boots': '/services/deep-clean.jpg',
  'srv-kids': '/services/medium-clean.jpg',
  'srv-express': '/services/white-clean.jpg',
  'srv-shoe-cleaner': '/services/shoe-cleaner.jpg'
};

function normalizeService(service) {
  if (!service) return service;
  let foto = service.foto;
  if (!foto || typeof foto !== 'string' || foto.includes('images.unsplash.com')) {
    foto = defaultPhotoMap[service.id] || '/services/deep-clean.jpg';
  }
  return {
    ...service,
    foto
  };
}

function sortServices(list) {
  const orderMap = {
    'srv-easy': 1,
    'srv-medium': 2,
    'srv-deep': 3,
    'srv-white': 4,
    'srv-leather': 5,
    'srv-suede': 6,
    'srv-boots': 7,
    'srv-kids': 8,
    'srv-express': 9,
    'srv-shoe-cleaner': 10
  };
  return [...list].sort((a, b) => {
    const ordA = a.urutan || orderMap[a.id] || 99;
    const ordB = b.urutan || orderMap[b.id] || 99;
    return ordA - ordB;
  });
}

export const servicesApi = {
  async getServices(onlyActive = true) {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, 'services');
        const q = onlyActive ? query(colRef, where('aktif', '==', true)) : colRef;
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map(d => normalizeService({ id: d.id, ...d.data() }));
          return sortServices(list);
        }
      } catch (err) {
        console.warn('Firestore services fallback:', err.message);
      }
    }

    const services = getLocalServices();
    if (onlyActive) {
      return sortServices(services.filter(s => s.aktif).map(normalizeService));
    }
    return sortServices(services.map(normalizeService));
  },

  async getServiceById(id) {
    if (isFirebaseConfigured) {
      const snap = await getDoc(doc(db, 'services', id));
      return snap.exists() ? normalizeService({ id: snap.id, ...snap.data() }) : null;
    }

    const services = getLocalServices();
    const found = services.find(s => s.id === id) || null;
    return normalizeService(found);
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
