export const SERVICE_CATEGORIES = [
  { id: 'all', label: 'Semua Layanan' },
  { id: 'cuci', label: 'Cuci & Perawatan' },
  { id: 'sabun', label: 'Sabun & Produk' }
];

export const ORDER_METHODS = {
  DIJEMPUT: 'dijemput',
  ANTAR_SENDIRI: 'antar_sendiri',
  DIKIRIM: 'dikirim',
  AMBIL_SENDIRI: 'ambil_sendiri'
};

export const ORDER_STATUSES = [
  'Menunggu Konfirmasi',
  'Dikonfirmasi',
  'Sedang Dijemput',
  'Diproses',
  'Siap Diantar',
  'Siap Diambil',
  'Dikirim',
  'Selesai',
  'Ditolak',
  'Dibatalkan'
];

export const STATUS_TRANSITIONS = {
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

export const DEFAULT_OUTLET_LOCATION = {
  lat: -7.4338,
  lng: 112.7214,
  address: 'Perumahan Jl. Pd. Jati No.2 BM 55, Sidoarjo, Jawa Timur'
};
