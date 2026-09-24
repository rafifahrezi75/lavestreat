export const SERVICE_CATEGORIES = [
  { id: 'all', label: 'Semua Layanan' },
  { id: 'cuci', label: 'Cuci Sepatu' },
  { id: 'repaint', label: 'Repaint Sepatu' },
  { id: 'sabun', label: 'Sabun & Perawatan' }
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
  lat: -7.4478,
  lng: 112.7183,
  address: 'Jl. Raya Ponti No. 18, Magersari, Sidoarjo, Jawa Timur'
};
