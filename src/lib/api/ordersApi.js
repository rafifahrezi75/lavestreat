import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  query, 
  orderBy 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, isFirebaseConfigured } from '../firebase';
import { initialOrders } from './mockData';
import { servicesApi } from './servicesApi';
import { STATUS_TRANSITIONS } from '../constants';

const STORAGE_KEY = 'lavestreat_orders_data_v2';

function getLocalOrders() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data || data.includes('ord-1001')) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialOrders));
    return initialOrders;
  }
  return JSON.parse(data);
}

function saveLocalOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export const ordersApi = {
  async getOrders() {
    if (isFirebaseConfigured) {
      try {
        const colRef = collection(db, 'orders');
        const q = query(colRef, orderBy('created_at', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {
        const snap = await getDocs(collection(db, 'orders'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    }

    const orders = getLocalOrders();
    return [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getOrderById(id) {
    if (isFirebaseConfigured) {
      const snap = await getDoc(doc(db, 'orders', id));
      if (snap.exists()) return { id: snap.id, ...snap.data() };
    }

    const orders = getLocalOrders();
    return orders.find(o => o.id === id || o.invoice === id || o.invoice_number === id || o.original_id === id) || null;
  },

  async createOrder(payload) {
    if (!payload.items || !payload.items.length) {
      throw new Error('Pesanan harus berisi minimal satu item');
    }

    if (payload.metode === 'dijemput' && (!payload.alamat_jemput || !payload.alamat_jemput.teks)) {
      throw new Error('Alamat penjemputan wajib diisi');
    }

    const allServices = await servicesApi.getServices(false);
    const serviceMap = new Map(allServices.map(s => [s.id, s]));

    const snappedItems = payload.items.map(item => {
      const master = serviceMap.get(item.service_id);
      if (!master) {
        throw new Error(`Layanan dengan ID ${item.service_id} tidak ditemukan`);
      }
      if (!master.aktif) {
        throw new Error(`Layanan ${master.nama} sedang tidak aktif`);
      }
      const qty = Math.max(1, Math.round(Number(item.qty) || 1));
      return {
        service_id: master.id,
        nama_snapshot: master.nama,
        harga_snapshot: master.harga,
        qty: qty
      };
    });

    const computedTotal = snappedItems.reduce((acc, curr) => acc + (curr.harga_snapshot * curr.qty), 0);
    const nowIso = new Date().toISOString();
    const orderNumber = 'ORD-' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      id: orderNumber,
      pelanggan: {
        nama: payload.pelanggan.nama,
        telepon: payload.pelanggan.telepon,
        email: payload.pelanggan.email || ''
      },
      items: snappedItems,
      metode: payload.metode,
      alamat_jemput: payload.alamat_jemput || null,
      alamat_antar: payload.alamat_antar || payload.alamat_jemput || null,
      jadwal_tanggal: payload.jadwal_tanggal,
      jadwal_slot: payload.jadwal_slot,
      catatan: payload.catatan || '',
      total_harga: computedTotal,
      status: 'Menunggu Konfirmasi',
      status_history: [
        {
          status: 'Menunggu Konfirmasi',
          timestamp: nowIso,
          catatan: 'Pesanan baru dibuat oleh pelanggan'
        }
      ],
      captcha_verified: true,
      created_at: nowIso,
      updated_at: nowIso
    };

    if (isFirebaseConfigured) {
      try {
        const createOrderFn = httpsCallable(functions, 'verifyCaptchaAndCreateOrder');
        const result = await createOrderFn(payload);
        return result.data;
      } catch {
        await setDoc(doc(db, 'orders', orderNumber), newOrder);
        return newOrder;
      }
    }

    const orders = getLocalOrders();
    orders.unshift(newOrder);
    saveLocalOrders(orders);

    return newOrder;
  },

  async updateStatus(orderId, newStatus, catatan = '', adminName = 'Admin') {
    const nowIso = new Date().toISOString();

    if (isFirebaseConfigured) {
      try {
        const updateFn = httpsCallable(functions, 'updateOrderStatus');
        const result = await updateFn({ orderId, newStatus, catatan });
        return result.data;
      } catch {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (!snap.exists()) {
          throw new Error('Pesanan tidak ditemukan');
        }
        const currentData = snap.data();
        const allowedNext = STATUS_TRANSITIONS[currentData.status] || [];
        if (!allowedNext.includes(newStatus)) {
          throw new Error(`Tidak dapat mengubah status dari "${currentData.status}" menjadi "${newStatus}".`);
        }
        const updatedHistory = [
          ...(currentData.status_history || []),
          {
            status: newStatus,
            timestamp: nowIso,
            catatan: catatan || `Status diubah menjadi ${newStatus} oleh ${adminName}`
          }
        ];
        await updateDoc(doc(db, 'orders', orderId), {
          status: newStatus,
          status_history: updatedHistory,
          updated_at: nowIso
        });
        return {
          id: orderId,
          ...currentData,
          status: newStatus,
          status_history: updatedHistory,
          updated_at: nowIso
        };
      }
    }

    const orders = getLocalOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) {
      throw new Error('Pesanan tidak ditemukan');
    }

    const currentOrder = orders[index];
    const allowedNext = STATUS_TRANSITIONS[currentOrder.status] || [];
    if (!allowedNext.includes(newStatus)) {
      throw new Error(`Tidak dapat mengubah status dari "${currentOrder.status}" menjadi "${newStatus}".`);
    }

    const updatedHistory = [
      ...currentOrder.status_history,
      {
        status: newStatus,
        timestamp: nowIso,
        catatan: catatan || `Status diubah menjadi ${newStatus} oleh ${adminName}`
      }
    ];

    orders[index] = {
      ...currentOrder,
      status: newStatus,
      status_history: updatedHistory,
      updated_at: nowIso
    };

    saveLocalOrders(orders);
    return orders[index];
  },

  async updateOrder(orderId, patch) {
    const nowIso = new Date().toISOString();
    const cleanPatch = { ...patch, updated_at: nowIso };

    if (isFirebaseConfigured) {
      await updateDoc(doc(db, 'orders', orderId), cleanPatch);
      return { id: orderId, ...cleanPatch };
    }

    const orders = getLocalOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...cleanPatch };
      saveLocalOrders(orders);
      return orders[index];
    }
    return { id: orderId, ...cleanPatch };
  }
};

