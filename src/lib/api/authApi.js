import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';

const LOCAL_AUTH_KEY = 'lavestreat_auth_user';

export const authApi = {
  async login(email, password) {
    if (isFirebaseConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          role: 'admin'
        };
      } catch (fbErr) {
        if (email === 'admin@lavestreat.com' && password === 'admin123') {
          const user = {
            uid: 'admin-local-1',
            email: 'admin@lavestreat.com',
            role: 'admin',
            displayName: 'Admin Lave Streat'
          };
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
          return user;
        }

        if (fbErr.code === 'auth/invalid-credential' || fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/wrong-password') {
          throw new Error('Email atau kata sandi tidak sesuai. Pastikan akun terdaftar di Firebase Authentication.');
        }
        throw fbErr;
      }
    }

    if (email === 'admin@lavestreat.com' && password === 'admin123') {
      const user = {
        uid: 'admin-local-1',
        email: 'admin@lavestreat.com',
        role: 'admin',
        displayName: 'Admin Lave Streat'
      };
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
      return user;
    }

    throw new Error('Email atau password tidak sesuai.');
  },

  async logout() {
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (err) {
      }
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
    return true;
  },

  getCurrentUser() {
    if (isFirebaseConfigured) {
      const fbUser = auth.currentUser;
      if (fbUser) {
        return {
          uid: fbUser.uid,
          email: fbUser.email,
          role: 'admin'
        };
      }
    }

    const localData = localStorage.getItem(LOCAL_AUTH_KEY);
    return localData ? JSON.parse(localData) : null;
  },

  onAuthStateChange(callback) {
    if (isFirebaseConfigured) {
      return onAuthStateChanged(auth, (user) => {
        if (user) {
          callback({
            uid: user.uid,
            email: user.email,
            role: 'admin'
          });
        } else {
          const localData = localStorage.getItem(LOCAL_AUTH_KEY);
          callback(localData ? JSON.parse(localData) : null);
        }
      });
    }

    const currentUser = this.getCurrentUser();
    callback(currentUser);
    return () => {};
  }
};
