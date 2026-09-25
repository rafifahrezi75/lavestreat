const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const VALID_TRANSITIONS = {
  'Menunggu Konfirmasi': ['Dikonfirmasi', 'Ditolak', 'Dibatalkan'],
  'Dikonfirmasi': ['Sedang Dijemput', 'Diproses', 'Dibatalkan'],
  'Sedang Dijemput': ['Diproses', 'Dibatalkan'],
  'Diproses': ['Siap Diantar', 'Siap Diambil', 'Dikirim', 'Dibatalkan'],
  'Siap Diantar': ['Selesai', 'Dibatalkan'],
  'Siap Diambil': ['Selesai', 'Dibatalkan'],
  'Dikirim': ['Selesai', 'Dibatalkan'],
  'Selesai': [],
  'Ditolak': [],
  'Dibatalkan': []
};

async function verifyRecaptcha(token) {
  if (!token) return false;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) return true;

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`
    });
    const data = await response.json();
    return Boolean(data.success);
  } catch (error) {
    return false;
  }
}

exports.verifyCaptchaAndCreateOrder = functions.https.onCall(async (data, context) => {
  const isCaptchaValid = await verifyRecaptcha(data.captchaToken);
  if (!isCaptchaValid) {
    throw new functions.https.HttpsError('failed-precondition', 'Verifikasi keamanan tidak valid.');
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Pesanan harus berisi minimal satu item.');
  }

  if (data.metode === 'dijemput' && (!data.alamat_jemput || !data.alamat_jemput.teks)) {
    throw new functions.https.HttpsError('invalid-argument', 'Alamat penjemputan wajib diisi.');
  }

  const db = admin.firestore();
  const servicesSnap = await db.collection('services').where('aktif', '==', true).get();
  const serviceMap = new Map();
  servicesSnap.forEach(docSnap => {
    serviceMap.set(docSnap.id, docSnap.data());
  });

  const snappedItems = data.items.map(item => {
    const master = serviceMap.get(item.service_id);
    if (!master) {
      throw new functions.https.HttpsError('not-found', `Layanan tidak ditemukan atau sedang tidak aktif.`);
    }
    const qty = Math.max(1, Math.round(Number(item.qty) || 1));
    return {
      service_id: item.service_id,
      nama_snapshot: master.nama,
      harga_snapshot: master.harga,
      qty: qty
    };
  });

  const totalHarga = snappedItems.reduce((sum, item) => sum + (item.harga_snapshot * item.qty), 0);
  const now = admin.firestore.FieldValue.serverTimestamp();
  const orderNumber = 'ORD-' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + Math.floor(1000 + Math.random() * 9000);

  const orderData = {
    id: orderNumber,
    pelanggan: {
      nama: data.pelanggan.nama,
      telepon: data.pelanggan.telepon,
      email: data.pelanggan.email || ''
    },
    items: snappedItems,
    metode: data.metode,
    alamat_jemput: data.alamat_jemput || null,
    alamat_antar: data.alamat_antar || data.alamat_jemput || null,
    jadwal_tanggal: data.jadwal_tanggal || '',
    jadwal_slot: data.jadwal_slot || 'pagi',
    catatan: data.catatan || '',
    total_harga: totalHarga,
    status: 'Menunggu Konfirmasi',
    status_history: [
      {
        status: 'Menunggu Konfirmasi',
        timestamp: new Date().toISOString(),
        catatan: 'Pesanan baru dibuat'
      }
    ],
    captcha_verified: true,
    created_at: now,
    updated_at: now
  };

  const docRef = await db.collection('orders').add(orderData);
  return { orderId: docRef.id, ...orderData };
});

exports.updateOrderStatus = functions.https.onCall(async (data, context) => {
  if (context.auth?.token?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Hanya admin yang dapat mengubah status pesanan.');
  }

  const { orderId, newStatus, catatan } = data;
  const db = admin.firestore();
  const orderRef = db.collection('orders').doc(orderId);
  const snap = await orderRef.get();

  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'Pesanan tidak ditemukan.');
  }

  const currentOrder = snap.data();
  const currentStatus = currentOrder.status;

  if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `Tidak dapat mengubah status dari "${currentStatus}" menjadi "${newStatus}".`
    );
  }

  const nowIso = new Date().toISOString();
  const historyEntry = {
    status: newStatus,
    timestamp: nowIso,
    catatan: catatan || `Status diubah menjadi ${newStatus} oleh admin`
  };

  await orderRef.update({
    status: newStatus,
    status_history: admin.firestore.FieldValue.arrayUnion(historyEntry),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true, status: newStatus };
});
