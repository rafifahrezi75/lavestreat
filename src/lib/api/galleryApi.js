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
import { initialGallery } from './mockData';

const STORAGE_KEY = 'lavestreat_gallery_data_v5';

function getLocalGallery() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data || data.includes('unsplash')) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialGallery));
    return initialGallery;
  }
  return JSON.parse(data);
}

function saveLocalGallery(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const galleryApi = {
  async getGallery(onlyHome = false) {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, 'gallery');
        const q = onlyHome ? query(colRef, where('tampil_di_home', '==', true)) : colRef;
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (err) {
        console.warn('Firestore gallery fallback:', err.message);
      }
    }

    const items = getLocalGallery();
    if (onlyHome) {
      return items.filter(i => i.tampil_di_home);
    }
    return items;
  },

  async createGalleryItem(payload) {
    if (!payload.before_url || !payload.after_url) {
      throw new Error('Kedua foto (Sebelum dan Sesudah) wajib diunggah.');
    }

    const cleanPayload = {
      before_url: payload.before_url,
      after_url: payload.after_url,
      caption: payload.caption || '',
      layanan_terkait: payload.layanan_terkait || '',
      tampil_di_home: payload.tampil_di_home !== false,
      created_at: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, 'gallery'), cleanPayload);
      return { id: docRef.id, ...cleanPayload };
    }

    const items = getLocalGallery();
    const newItem = {
      id: 'gal-' + Date.now(),
      ...cleanPayload
    };
    items.unshift(newItem);
    saveLocalGallery(items);
    return newItem;
  },

  async updateGalleryItem(id, payload) {
    if (!payload.before_url || !payload.after_url) {
      throw new Error('Kedua foto (Sebelum dan Sesudah) wajib diisi.');
    }

    const cleanPayload = {
      before_url: payload.before_url,
      after_url: payload.after_url,
      caption: payload.caption || '',
      layanan_terkait: payload.layanan_terkait || '',
      tampil_di_home: payload.tampil_di_home !== false
    };

    if (isFirebaseConfigured) {
      await updateDoc(doc(db, 'gallery', id), cleanPayload);
      return { id, ...cleanPayload };
    }

    const items = getLocalGallery();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...cleanPayload };
      saveLocalGallery(items);
      return items[index];
    }
    throw new Error('Item galeri tidak ditemukan');
  },

  async deleteGalleryItem(id) {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'gallery', id));
      return true;
    }

    const items = getLocalGallery();
    const filtered = items.filter(i => i.id !== id);
    saveLocalGallery(filtered);
    return true;
  }
};
