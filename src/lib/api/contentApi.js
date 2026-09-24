import { 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { initialHomeContent, initialAboutContent } from './mockData';

const HOME_KEY = 'lavestreat_content_home';
const ABOUT_KEY = 'lavestreat_content_about_v3';

export const contentApi = {
  async getHomeContent() {
    if (isFirebaseConfigured) {
      const snap = await getDoc(doc(db, 'content', 'home'));
      if (snap.exists()) return snap.data();
    }

    const data = localStorage.getItem(HOME_KEY);
    if (!data) {
      localStorage.setItem(HOME_KEY, JSON.stringify(initialHomeContent));
      return initialHomeContent;
    }
    return JSON.parse(data);
  },

  async updateHomeContent(payload) {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'content', 'home'), payload, { merge: true });
      return payload;
    }

    localStorage.setItem(HOME_KEY, JSON.stringify(payload));
    return payload;
  },

  async getAboutContent() {
    if (isFirebaseConfigured) {
      const snap = await getDoc(doc(db, 'content', 'about'));
      if (snap.exists()) return snap.data();
    }

    const data = localStorage.getItem(ABOUT_KEY);
    if (!data) {
      localStorage.setItem(ABOUT_KEY, JSON.stringify(initialAboutContent));
      return initialAboutContent;
    }
    return JSON.parse(data);
  },

  async updateAboutContent(payload) {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'content', 'about'), payload, { merge: true });
      return payload;
    }

    localStorage.setItem(ABOUT_KEY, JSON.stringify(payload));
    return payload;
  }
};
