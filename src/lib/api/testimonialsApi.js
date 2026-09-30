import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { initialTestimonials } from './mockData';

const STORAGE_KEY = 'lavestreat_testimonials_data_v16';

function getLocalTestimonials() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTestimonials));
    return initialTestimonials;
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTestimonials));
    return initialTestimonials;
  }
}

function saveLocalTestimonials(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const testimonialsApi = {
  async getTestimonials(onlyVisible = true) {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, 'testimonials');
        const q = onlyVisible ? query(colRef, where('tampil', '==', true)) : colRef;
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn('Firestore testimonials fallback:', err.message);
      }
    }

    const items = getLocalTestimonials();
    if (onlyVisible) {
      return items.filter(t => t.tampil);
    }
    return items;
  },

  async createTestimonial(payload) {
    const cleanPayload = {
      nama_pelanggan: payload.nama_pelanggan,
      isi: payload.isi,
      rating: Number(payload.rating) || 5,
      foto_url: payload.foto_url || '',
      tampil: payload.tampil !== false,
      is_anonymous: Boolean(payload.is_anonymous || payload.anonim),
      order_id: payload.order_id || '',
      created_at: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, 'testimonials'), cleanPayload);
      return { id: docRef.id, ...cleanPayload };
    }

    const items = getLocalTestimonials();
    const newItem = {
      id: 'testi-' + Date.now(),
      ...cleanPayload
    };
    items.unshift(newItem);
    saveLocalTestimonials(items);
    return newItem;
  },

  async updateTestimonial(id, payload) {
    const cleanPayload = {
      nama_pelanggan: payload.nama_pelanggan,
      isi: payload.isi,
      rating: Number(payload.rating) || 5,
      foto_url: payload.foto_url || '',
      tampil: payload.tampil !== false,
      is_anonymous: Boolean(payload.is_anonymous || payload.anonim),
      order_id: payload.order_id || ''
    };

    if (isFirebaseConfigured) {
      await updateDoc(doc(db, 'testimonials', id), cleanPayload);
      return { id, ...cleanPayload };
    }

    const items = getLocalTestimonials();
    const index = items.findIndex(t => t.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...cleanPayload };
      saveLocalTestimonials(items);
      return items[index];
    }
    throw new Error('Testimoni tidak ditemukan');
  },

  async deleteTestimonial(id) {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'testimonials', id));
      return true;
    }

    const items = getLocalTestimonials();
    const filtered = items.filter(t => t.id !== id);
    saveLocalTestimonials(filtered);
    return true;
  }
};
