# Dokumentasi Arsitektur dan Kebijakan Keamanan Sistem — Lave Streat

| Metadata | Keterangan |
|---|---|
| **Nama Sistem** | Lave Streat — Landing Page & Admin Panel (Jasa Cuci Sepatu, Repaint, Antar-Jemput, Penjualan Sabun) |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 23 September 2026 |
| **Status** | Draft — untuk ditinjau sebelum implementasi |
| **Disusun sebagai** | Acuan keamanan bagi tim pengembang (termasuk AI coding agent) — pelengkap `AGENTS.md`, `prd-lavestreat.md`, `design-brief-lavestreat.md` |

> **Catatan ruang lingkup:** Dokumen ini disusun mengikuti kerangka standar dokumentasi keamanan sistem berbasis React + Firebase, namun seluruh contoh, skema koleksi, dan aturan di dalamnya disesuaikan sepenuhnya dengan arsitektur nyata Lave Streat — bukan sistem presensi karyawan. Tidak ada modul presensi/fingerprint di Lave Streat; entitas kritis yang setara secara risiko adalah **data pesanan (`orders`)**, **data pelanggan di dalamnya**, dan **konten publik yang bisa diedit admin**.

---

## 1. Ringkasan Eksekutif Keamanan

Lave Streat adalah aplikasi web dua sisi: **landing page publik** yang diakses siapa saja tanpa login (termasuk form pemesanan & form kontak yang menerima input dari internet terbuka), dan **admin panel** yang hanya diakses satu (atau beberapa, ke depannya) akun pemilik/staf terautentikasi. Karakteristik ini membuat permukaan serangan (attack surface) sistem berbeda dari aplikasi internal biasa: mayoritas trafik justru datang dari pengguna anonim yang tidak dikenal, sehingga setiap input publik harus diperlakukan sebagai berpotensi berbahaya sampai terbukti sebaliknya.

Pendekatan keamanan sistem ini dibangun di atas dua prinsip utama:

1. **Least Privilege (Hak Akses Minimum).** Setiap komponen — baik pengguna publik, akun admin, maupun Cloud Function — hanya diberi izin akses data yang benar-benar dibutuhkan untuk menjalankan fungsinya. Pengguna publik tidak pernah memiliki izin baca/tulis langsung ke data pesanan; akun admin memiliki akses penuh ke data operasional tetapi tidak menyimpan kredensial pihak ketiga (Cloudinary, reCAPTCHA) di sisi klien.
2. **Zero Trust di Sisi Klien.** Kode yang berjalan di browser (React SPA) **tidak pernah dipercaya** sebagai penentu keputusan keamanan akhir. Setiap permintaan — baik ke Firestore maupun ke Cloud Functions — divalidasi ulang di sisi server (Firestore Security Rules dan/atau Cloud Functions dengan Admin SDK), terlepas dari apakah UI di browser "terlihat" sudah membatasi aksi tersebut. Asumsi dasarnya: siapa pun bisa membuka DevTools, memodifikasi JavaScript yang sudah termuat, atau memanggil API secara langsung tanpa lewat UI sama sekali.

Konsekuensi praktis dari dua prinsip ini dijabarkan di seluruh bagian dokumen: harga pesanan dihitung ulang di backend (bukan dipercaya dari client), status pesanan tidak bisa diubah langsung dari browser, kredensial rahasia (Cloudinary API secret, reCAPTCHA secret key) tidak pernah masuk ke bundle JavaScript publik, dan setiap koleksi Firestore memiliki aturan baca/tulis eksplisit — bukan default terbuka.

---

## 2. Keamanan Sisi Klien (Frontend — React.js)

### 2.1 Kebijakan Environment Variables (`.env`)

Vite (build tool React yang dipakai) hanya mengekspos variabel environment ke bundle JavaScript publik jika diberi prefix `VITE_`. Ini adalah sumber kesalahan keamanan paling umum di proyek React+Vite: developer mengira `.env` "aman" karena tidak di-commit ke Git, padahal begitu variabel berprefix `VITE_` dipakai dalam kode, nilainya **ikut ter-bundle secara plain-text ke dalam file JavaScript yang dikirim ke setiap pengunjung** dan bisa dibaca siapa saja lewat "View Source" atau DevTools.

**Aturan wajib:**

| Jenis Kredensial | Boleh di `VITE_*` (client)? | Lokasi Penyimpanan yang Benar |
|---|---|---|
| Firebase Web Config (`apiKey`, `authDomain`, `projectId`, dst.) | Ya — ini **bukan rahasia** menurut desain Firebase, proteksi sesungguhnya ada di Security Rules & App Check (lihat §4 & §6.3) | `.env` dengan prefix `VITE_`, tetap masuk `.gitignore` sebagai praktik baik |
| Cloudinary **Cloud Name** & **Unsigned Upload Preset name** | Ya, tapi lihat catatan §5.3 — preset harus dikonfigurasi ketat (folder, format, ukuran maksimum) di dashboard Cloudinary | `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` |
| Cloudinary **API Secret** | **Tidak, dilarang keras** | Environment Cloud Functions (`functions/.env` atau Secret Manager) — hanya dipakai untuk signed upload (§5.3) |
| reCAPTCHA **Site Key** | Ya — site key memang didesain publik | `VITE_RECAPTCHA_SITE_KEY` |
| reCAPTCHA **Secret Key** | **Tidak, dilarang keras** | Environment Cloud Functions — dipakai untuk verifikasi token di server (§5.1) |
| Kredensial pengiriman email (form kontak) | **Tidak, dilarang keras** | Environment Cloud Functions |
| Kredensial provider routing berbayar (jika kelak mengganti OSRM demo server) | **Tidak, dilarang keras** | Environment Cloud Functions |

Prinsip pemeriksaannya sederhana: **jika sebuah nilai, bila diketahui orang lain, memungkinkan mereka melakukan aksi merugikan atas nama sistem (kirim email atas nama Lave Streat, upload tak terbatas ke akun Cloudinary, memalsukan verifikasi captcha) — nilai itu tidak boleh pernah ada di kode/bundle yang dikirim ke browser.**

### 2.2 Mitigasi Cross-Site Scripting (XSS)

React secara default melakukan escaping terhadap semua nilai yang dirender lewat `{}` di JSX, sehingga XSS "klasik" (menyuntik `<script>` lewat teks biasa) sudah tertangani otomatis. Risiko yang tetap perlu ditangani secara eksplisit di Lave Streat:

- **`dangerouslySetInnerHTML` untuk konten landing page.** Jika fitur "Kelola Konten" di admin panel memakai rich-text editor (mis. untuk bagian "Tentang Kami"/promosi) yang menghasilkan HTML, HTML tersebut **wajib disanitasi** dengan pustaka seperti `DOMPurify` sebelum dirender di landing page publik — baik saat disimpan maupun saat ditampilkan. Tanpa ini, satu admin yang akunnya diretas (atau kesalahan input) bisa menyuntikkan script yang dieksekusi di browser setiap pengunjung landing page.

  ```jsx
  import DOMPurify from 'dompurify';

  function AboutContent({ html }) {
    const safeHtml = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['b','i','p','a','ul','li','br'] });
    return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }
  ```

- **Input bebas dari publik (form pemesanan & form kontak).** Field seperti `catatan` pada order atau `pesan` pada form kontak adalah teks bebas dari pengguna anonim yang nantinya **ditampilkan kembali di admin panel**. Ini adalah kandidat klasik *stored XSS* jika suatu saat admin panel merender field tersebut lewat `dangerouslySetInnerHTML`. Kebijakan: field-field ini **hanya boleh dirender sebagai plain text** (`{catatan}` biasa di JSX), tidak pernah lewat `dangerouslySetInnerHTML`, kecuali benar-benar dibutuhkan — dan jika dibutuhkan, wajib melalui sanitasi yang sama seperti di atas.
- **Validasi & pembatasan panjang input** dilakukan di client (UX, mencegah kesalahan tidak sengaja) **dan** diulang di Cloud Function saat order dibuat (keamanan sesungguhnya) — lihat §5.1.

### 2.3 Role-Based Access Control (RBAC) di Sisi UI

Untuk MVP, sistem hanya memiliki satu peran: **Admin** (pemilik usaha). Arsitektur tetap disiapkan agar bisa diperluas ke peran tambahan (mis. **Staff/Kurir** dengan akses terbatas hanya untuk melihat & mengubah status pesanan, tanpa akses ke harga/konten) — sesuai catatan roadmap v2 di `prd-lavestreat.md` §10.

| Peran | Dashboard | Kelola Pesanan (lihat) | Kelola Pesanan (ubah status) | Kelola Layanan/Harga | Kelola Konten | Pengaturan |
|---|---|---|---|---|---|---|
| **Admin** (MVP) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Staff/Kurir** (rencana v2) | ✅ (terbatas) | ✅ | ✅ | ❌ | ❌ | ❌ |

Implementasi di React berupa *route guard* yang membaca status login dan **custom claim** peran dari token Firebase Auth (lihat §3.1), menyembunyikan menu/halaman yang tidak relevan dengan peran pengguna:

```jsx
function AdminRoute({ allowedRoles, children }) {
  const { user, role, loading } = useAuth(); // role diambil dari custom claim token

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/admin/unauthorized" replace />;

  return children;
}
```

**Penegasan penting — ini adalah bagian paling krusial dari keseluruhan model keamanan sistem:**

> Proteksi RBAC di atas **murni lapisan pengalaman pengguna (UX layer)**. Menyembunyikan tombol "Hapus Layanan" dari peran Staff, atau me-redirect ke halaman "Unauthorized", **tidak mencegah** seseorang yang memahami cara kerja aplikasi untuk memanggil Firestore SDK atau Cloud Function secara langsung dari console browser dan mencoba aksi yang sama. **Satu-satunya penentu izin akhir yang sah adalah Firestore Security Rules (§4) dan validasi di dalam Cloud Functions (§5).** Route guard di atas boleh dianggap tidak ada sama sekali dari sudut pandang keamanan — fungsinya murni supaya pengguna yang sah tidak bingung melihat menu yang bukan haknya.

---

## 3. Autentikasi dan Manajemen Sesi

### 3.1 Implementasi Firebase Authentication

- Login admin memakai **Firebase Authentication (Email/Password)**. Tidak ada endpoint registrasi publik — akun admin dibuat manual oleh pemilik/developer (lewat Firebase Console atau skrip inisialisasi sekali-jalan), konsisten dengan sifat Lave Streat yang bukan platform multi-tenant.
- Peran (`role: 'admin'`, dan kelak `role: 'staff'`) disimpan sebagai **Custom Claims** pada token pengguna Firebase Auth — bukan sebagai dokumen tambahan di Firestore. Alasan: custom claims otomatis ikut terlampir di setiap ID Token (JWT) yang dikirim ke Firestore Security Rules maupun Cloud Functions, tanpa perlu query tambahan, dan tidak bisa dimodifikasi dari sisi client.

  ```js
  // Cloud Function — hanya dijalankan manual oleh developer/pemilik saat setup akun admin baru
  exports.setAdminRole = functions.https.onCall(async (data, context) => {
    // Fungsi ini sendiri harus diproteksi ketat (mis. hanya bisa dipanggil oleh
    // admin yang sudah ada, atau dijalankan sekali via Firebase CLI/Admin SDK offline)
    await admin.auth().setCustomUserClaims(data.uid, { role: 'admin' });
  });
  ```

- Alur autentikasi: pengguna login → Firebase Auth SDK menerbitkan **ID Token berformat JWT** yang berisi `uid` dan custom claims → SDK otomatis melampirkan token ini di setiap permintaan ke Firestore, dan otomatis tersedia sebagai `context.auth` pada **Cloud Functions bertipe `onCall`**. Untuk Cloud Functions bertipe `onRequest` (HTTPS biasa, mis. webhook), token **wajib diverifikasi manual** dengan `admin.auth().verifyIdToken(token)` sebelum permintaan diproses — tidak boleh diasumsikan valid hanya karena header `Authorization: Bearer <token>` ada.

### 3.2 Diagram Alur Verifikasi Sesi

```
[Browser Admin]                [Firebase Auth]              [Firestore / Cloud Functions]
      |  1. login(email, pass)       |                                |
      |----------------------------->|                                |
      |  2. ID Token (JWT, berisi    |                                |
      |     uid + custom claims)     |                                |
      |<-----------------------------|                                |
      |                                                                |
      |  3. Setiap request (otomatis via SDK, membawa ID Token)        |
      |--------------------------------------------------------------->|
      |                                4. Verifikasi signature JWT      |
      |                                   & baca custom claims          |
      |                                5. Evaluasi Security Rules /     |
      |                                   pengecekan role di function   |
      |<---------------------------------------------------------------|
      |  6. Data / hasil (hanya jika lolos verifikasi + otorisasi)      |
```

### 3.3 Pengelolaan Sesi & Pencegahan Akses Tanpa Izin

- Persistensi sesi memakai `browserLocalPersistence` (bawaan Firebase SDK) sehingga admin tidak perlu login ulang setiap kunjungan — namun admin panel **wajib** menyediakan tombol "Logout" yang eksplisit memanggil `signOut()`, mengingat perangkat yang dipakai untuk mengakses admin panel bisa jadi perangkat bersama.
- ID Token Firebase memiliki masa berlaku pendek (default 1 jam) dan **di-refresh otomatis** oleh SDK selama sesi aktif — tidak perlu implementasi manual, tapi tim pengembang harus memakai Firebase SDK resmi (bukan menyalin token dan menyimpannya manual di `localStorage`), karena token yang disalin manual tidak ikut mekanisme refresh/revoke otomatis.
- Jika suatu akun admin perlu segera dicabut aksesnya (mis. staf resign), gunakan `admin.auth().revokeRefreshTokens(uid)` — ini memaksa token lama tidak valid lagi pada validasi berikutnya, lebih cepat daripada menunggu token lama kedaluwarsa sendiri.
- Tidak ada mekanisme sesi untuk pengguna publik (pemesan) karena sistem sengaja didesain **guest checkout** — order tidak terikat akun, sehingga tidak ada "sesi" yang perlu diamankan di sisi pelanggan. Ini menyederhanakan permukaan serangan terkait sesi, tapi berarti seluruh validasi keabsahan order harus bertumpu pada captcha + App Check (§6.3), bukan pada identitas pengguna.

---

## 4. Keamanan Akses Data (Firebase Security Rules)

### 4.1 Klasifikasi Data per Koleksi

| Koleksi | Klasifikasi | Baca Publik? | Tulis dari Client? |
|---|---|---|---|
| `content/home`, `content/about` | Publik (materi promosi) | Ya | Tidak — hanya Admin |
| `settings/general` | Publik (lokasi outlet, kontak) | Ya | Tidak — hanya Admin |
| `services` | Publik jika `aktif: true` | Ya (terfilter) | Tidak — hanya Admin |
| `gallery` | Publik jika `tampil_di_home: true` | Ya (terfilter) | Tidak — hanya Admin |
| `testimonials` | Publik jika `tampil: true` | Ya (terfilter) | Tidak — hanya Admin |
| `orders` | **Sensitif — berisi PII pelanggan** (nama, telepon, alamat) | **Tidak** | **Tidak sama sekali** — hanya lewat Cloud Function (Admin SDK) |

### 4.2 Contoh Firestore Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && request.auth.token.role == 'admin';
    }

    // --- Konten landing page: publik baca, admin tulis ---
    match /content/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /settings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // --- Layanan: publik hanya lihat yang aktif ---
    match /services/{serviceId} {
      allow read: if resource.data.aktif == true || isAdmin();
      allow create, update, delete: if isAdmin();
    }

    // --- Galeri before-after: publik hanya lihat yang ditampilkan ---
    match /gallery/{galleryId} {
      allow read: if resource.data.tampil_di_home == true || isAdmin();
      allow create, update, delete: if isAdmin();
    }

    // --- Testimoni: publik hanya lihat yang ditampilkan ---
    match /testimonials/{testiId} {
      allow read: if resource.data.tampil == true || isAdmin();
      allow create, update, delete: if isAdmin();
    }

    // --- Pesanan: data paling sensitif, TIDAK ADA akses langsung dari client ---
    match /orders/{orderId} {
      allow read: if isAdmin();
      // create sengaja diblok total dari client SDK — lihat §4.3 & §5.1
      allow create: if false;
      // update/delete juga diblok — perubahan status wajib lewat Cloud Function terkontrol
      allow update, delete: if false;
    }

    // Default deny — apapun yang tidak match rule eksplisit di atas, ditolak
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 4.3 Larangan Mutasi Langsung untuk Data Kritis

Berbeda dari `services`/`gallery`/`testimonials` (yang cukup diproteksi `isAdmin()` untuk tulis), koleksi **`orders` sengaja diblok total (`allow create/update/delete: if false`) bahkan untuk admin sekalipun** dari Firestore Client SDK. Alasannya:

1. **Saat pembuatan order**, total harga harus dihitung ulang dari harga master `services` yang aktif — logika ini tidak bisa (dan sebaiknya tidak) diekspresikan sepenuhnya dalam Security Rules. Ini didelegasikan ke Cloud Function (§5.1) yang menulis ke Firestore memakai **Admin SDK**, yang secara desain **melewati (bypass) Security Rules sepenuhnya** — sehingga blokir di atas hanya berlaku untuk akses via Client SDK, bukan menghalangi Cloud Function itu sendiri.
2. **Saat perubahan status**, sistem harus memastikan transisi status mengikuti alur yang sah (lihat `prd-lavestreat.md` §6.4 — tidak boleh loncat dari "Menunggu Konfirmasi" langsung ke "Selesai") dan setiap perubahan tercatat rapi di `status_history`. Memvalidasi state machine seperti ini jauh lebih aman dan mudah dirawat sebagai kode di Cloud Function (`updateOrderStatus`) daripada sebagai ekspresi kondisional yang rumit di Security Rules.

Pola ini — **"tutup total akses langsung dari client, wajibkan lewat Cloud Function terkontrol"** — adalah rekomendasi standar untuk setiap data yang: (a) melibatkan perhitungan yang tidak boleh dipercaya dari client, (b) memiliki alur status/state machine, atau (c) berisi data pribadi pelanggan yang tidak boleh terbaca balik oleh siapa pun selain admin.

---

## 5. Pemisahan Logika Sensitif (Server-Side Logic)

Seluruh logika di bawah ini **wajib** berjalan di Cloud Functions dengan Firebase Admin SDK — tidak boleh direplikasi atau "dibantu" oleh kode di React, sekalipun terasa lebih cepat untuk development.

### 5.1 Pembuatan Pesanan (`verifyCaptchaAndCreateOrder`)

```js
exports.verifyCaptchaAndCreateOrder = functions.https.onCall(async (data, context) => {
  // 1. Verifikasi token reCAPTCHA ke Google — secret key HANYA ada di sini,
  //    tidak pernah dikirim ke atau disimpan di client.
  const captchaValid = await verifyRecaptcha(data.captchaToken); // pakai RECAPTCHA_SECRET_KEY dari env
  if (!captchaValid) {
    throw new functions.https.HttpsError('failed-precondition', 'Captcha tidak valid.');
  }

  // 2. Validasi ulang input (jangan percaya validasi client sepenuhnya)
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Pesanan harus berisi minimal satu item.');
  }
  if (data.metode === 'dijemput' && !data.alamatJemput) {
    throw new functions.https.HttpsError('invalid-argument', 'Alamat penjemputan wajib diisi.');
  }

  // 3. Hitung ulang total harga dari harga master `services` yang AKTIF,
  //    abaikan sepenuhnya nilai harga yang mungkin dikirim dari client.
  const itemsWithSnapshot = await recalculatePricesFromMaster(data.items);
  const totalHarga = itemsWithSnapshot.reduce((sum, i) => sum + i.harga_snapshot * i.qty, 0);

  // 4. Tulis ke Firestore memakai Admin SDK (bypass Security Rules by design)
  const orderRef = await admin.firestore().collection('orders').add({
    pelanggan: data.pelanggan,
    items: itemsWithSnapshot,
    metode: data.metode,
    alamat_jemput: data.alamatJemput ?? null,
    total_harga: totalHarga,
    status: 'Menunggu Konfirmasi',
    status_history: [{ status: 'Menunggu Konfirmasi', timestamp: admin.firestore.FieldValue.serverTimestamp() }],
    captcha_verified: true,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { orderId: orderRef.id };
});
```

### 5.2 Perubahan Status Pesanan (`updateOrderStatus`)

```js
const VALID_TRANSITIONS = {
  'Menunggu Konfirmasi': ['Dikonfirmasi', 'Ditolak'],
  'Dikonfirmasi': ['Sedang Dijemput', 'Diproses', 'Dibatalkan'],
  'Sedang Dijemput': ['Diproses', 'Dibatalkan'],
  'Diproses': ['Siap Diantar', 'Siap Diambil', 'Dikirim'],
  // ...dst sesuai alur di prd-lavestreat.md §6.4
};

exports.updateOrderStatus = functions.https.onCall(async (data, context) => {
  // Hanya admin (custom claim) yang boleh memanggil fungsi ini
  if (context.auth?.token?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Hanya admin yang bisa mengubah status pesanan.');
  }

  const orderRef = admin.firestore().collection('orders').doc(data.orderId);
  const orderSnap = await orderRef.get();
  const currentStatus = orderSnap.data().status;

  // Validasi state machine — tidak boleh loncat tahap
  if (!VALID_TRANSITIONS[currentStatus]?.includes(data.newStatus)) {
    throw new functions.https.HttpsError('failed-precondition', `Tidak bisa mengubah status dari "${currentStatus}" ke "${data.newStatus}".`);
  }

  await orderRef.update({
    status: data.newStatus,
    status_history: admin.firestore.FieldValue.arrayUnion({
      status: data.newStatus,
      timestamp: new Date(),
      oleh: context.auth.uid,
    }),
  });
});
```

### 5.3 Integrasi Pihak Ketiga

| Integrasi | Rahasia yang Terlibat | Ditangani di |
|---|---|---|
| **reCAPTCHA** | Secret Key | Cloud Function (`verifyCaptchaAndCreateOrder`, `sendContactEmail`) — tidak pernah di client |
| **Cloudinary** (upload gambar admin) | API Secret (jika signed upload) | Cloud Function `generateCloudinarySignature` — hanya dipanggil oleh admin terautentikasi; client hanya menerima signature sekali-pakai untuk upload, bukan API secret itu sendiri. **Rekomendasi**: gunakan mode signed upload ini menggantikan unsigned preset, sebagai tindak lanjut open question keamanan Cloudinary yang sebelumnya dicatat di `prd-lavestreat.md` |
| **Pengiriman email** (form kontak) | API key layanan email (mis. SendGrid/Resend) | Cloud Function `sendContactEmail` |
| **Routing (Leaflet + OSRM)** | Tidak ada rahasia untuk demo server publik; jika kelak pindah ke provider berbayar, API key-nya wajib mengikuti pola yang sama (proxy lewat Cloud Function, tidak dipanggil langsung dari browser dengan key tertanam) | Cloud Function proxy (jika sudah pakai provider berbayar) |
| **Kalkulasi harga total pesanan** | Bukan rahasia pihak ketiga, tapi logika bisnis yang tidak boleh dipercaya dari client | Cloud Function `verifyCaptchaAndCreateOrder` (lihat §5.1) |

---

## 6. Keamanan Jaringan dan Hosting

### 6.1 Kebijakan HTTPS Wajib

Firebase Hosting secara otomatis menyediakan sertifikat SSL/TLS gratis (Let's Encrypt terkelola) untuk domain default (`*.web.app`/`*.firebaseapp.com`) maupun custom domain, serta secara otomatis mengalihkan (redirect) setiap permintaan `http://` ke `https://`. Tidak diperlukan konfigurasi tambahan untuk ini, tetapi wajib **dipastikan** setiap URL API pihak ketiga yang dipanggil dari client (Cloudinary, tile OpenStreetMap, OSRM) juga memakai `https://`, bukan `http://`, untuk menghindari *mixed content warning/block* oleh browser.

### 6.2 Konfigurasi HTTP Security Headers

Dikonfigurasi lewat `firebase.json` pada bagian `hosting.headers`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://upload-widget.cloudinary.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com https://*.tile.openstreetmap.org; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://*.cloudfunctions.net https://router.project-osrm.org; frame-src https://www.google.com/recaptcha/; object-src 'none'; base-uri 'self';"
          },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "geolocation=(self), camera=(), microphone=()" }
        ]
      }
    ]
  }
}
```

Penjelasan tiap header dan risiko yang dicegah:

- **`Content-Security-Policy` (CSP).** Membatasi dari domain mana saja script, style, gambar, dan koneksi jaringan boleh dimuat. Whitelist di atas mencakup domain yang benar-benar dipakai Lave Streat: reCAPTCHA, widget upload Cloudinary, tile peta OpenStreetMap, Google Fonts, dan endpoint Firebase/OSRM. Mencegah eksekusi script asing jika suatu saat terjadi celah XSS di tempat lain — CSP jadi lapisan pertahanan kedua (*defense in depth*), bukan pengganti sanitasi input di §2.2.
- **`X-Frame-Options: DENY`.** Mencegah halaman (terutama admin panel) di-embed di dalam `<iframe>` situs lain — mitigasi **Clickjacking**, di mana pengguna dikelabui mengklik tombol tersembunyi (mis. "Konfirmasi Pesanan") yang sebenarnya berada di iframe tersembunyi situs jahat.
- **`X-Content-Type-Options: nosniff`.** Mencegah browser menebak (sniff) tipe MIME suatu file secara berbeda dari header `Content-Type` yang dikirim server — mitigasi serangan yang memanfaatkan file yang diupload (mis. lewat Cloudinary) dieksekusi sebagai HTML/JS oleh browser padahal seharusnya hanya gambar.
- **`Referrer-Policy`.** Membatasi informasi URL asal yang dikirim ke situs lain saat pengguna mengklik tautan keluar, mengurangi kebocoran informasi (mis. parameter di URL admin panel).
- **`Permissions-Policy`.** Menonaktifkan akses ke API browser sensitif (kamera, mikrofon) yang memang tidak dipakai Lave Streat, dan membatasi geolocation hanya untuk origin sendiri (dipakai oleh `LocationPicker` di form pemesanan).

### 6.3 Perlindungan Anti-Abuse dengan Firebase App Check

Captcha (§5.1) mencegah bot otomatis mengisi form pemesanan/kontak, tetapi tidak mencegah **klien tidak sah** (bukan aplikasi Lave Streat yang sebenarnya — mis. skrip yang memanggil Cloud Functions/Firestore API langsung dengan meniru payload) melakukan permintaan atas nama sistem. **Firebase App Check** menutup celah ini dengan mewajibkan setiap permintaan ke Firestore dan Cloud Functions membawa bukti kriptografis bahwa permintaan itu benar-benar berasal dari aplikasi web Lave Streat yang sah, bukan skrip pihak ketiga.

```js
// src/lib/firebase.js
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});
```

**Rekomendasi alur penerapan (bertahap, untuk menghindari memblokir pengguna sah secara tidak sengaja):**

1. Aktifkan App Check di client (kode di atas) dan daftarkan aplikasi di Firebase Console.
2. Set mode **"Monitor"** (belum "Enforce") selama beberapa hari — pantau metrik di Firebase Console untuk memastikan mayoritas trafik sah terverifikasi sebagai *verified requests*, bukan malah tertolak.
3. Setelah yakin tidak ada false-positive signifikan, aktifkan **"Enforce"** untuk Firestore dan Cloud Functions — permintaan tanpa token App Check yang valid akan otomatis ditolak di level infrastruktur Firebase, sebelum bahkan mencapai Security Rules atau kode Cloud Function.

Kombinasi **captcha (anti-bot pada level formulir) + App Check (anti-abuse pada level infrastruktur API)** memberi dua lapis pertahanan independen yang saling melengkapi untuk permukaan sistem yang paling terbuka: form pemesanan dan form kontak publik.

---

## Ringkasan Tindak Lanjut

| # | Item | Prioritas |
|---|---|---|
| 1 | Terapkan Firestore Security Rules sesuai §4.2 sebelum fitur pemesanan live | Wajib sebelum rilis |
| 2 | Pindahkan pembuatan & perubahan status order sepenuhnya ke Cloud Functions (§5.1, §5.2) | Wajib sebelum rilis |
| 3 | Pastikan tidak ada rahasia (Cloudinary API secret, reCAPTCHA secret, email API key) memakai prefix `VITE_` | Wajib sebelum rilis |
| 4 | Konfigurasi CSP & security headers di `firebase.json` (§6.2) | Wajib sebelum rilis |
| 5 | Aktifkan Firebase App Check, mulai mode Monitor lalu Enforce (§6.3) | Direkomendasikan sebelum rilis publik |
| 6 | Evaluasi migrasi Cloudinary unsigned preset → signed upload lewat Cloud Function (§5.3) | Direkomendasikan, bisa menyusul pasca-MVP |
