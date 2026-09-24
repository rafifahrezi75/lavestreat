# AGENTS.md — Lave Streat

Instruksi ini untuk AI coding agent (Claude Code, Cursor, dll.) yang mengerjakan repo ini. Baca dulu sebelum menulis kode. Detail lengkap ada di `prd-lavestreat.md`, `design-brief-lavestreat.md`, dan `style-reference-lavestreat.md` — file ini adalah ringkasan operasional supaya agent tidak perlu baca ulang seluruh dokumen tiap kali.

## Ringkasan Proyek
Website untuk **Lave Streat** (L.A.V.E Treatment) — jasa cuci sepatu, repaint sepatu, layanan antar-jemput, dan penjualan sabun/produk perawatan sepatu, area Sidoarjo–Surabaya. Terdiri dari dua sisi:
1. **Landing page publik** — company profile, katalog layanan, galeri before-after, testimoni, lokasi, promosi, dan form pemesanan.
2. **Admin panel** — kelola isi landing page (tanpa perlu deploy ulang kode), kelola pesanan masuk (terima/tolak/ubah status), kelola layanan, galeri, dan testimoni.

Tidak ada akun/login untuk customer (guest order) — hanya admin yang login. Form pemesanan publik wajib pakai captcha karena tidak ada autentikasi di sisi user.

## Stack
- **Frontend:** React (Vite, SPA), Tailwind CSS untuk styling.
- **Backend/data:** Firebase — Firestore (data), Firebase Auth (login admin), Cloud Functions (verifikasi captcha server-side, kirim email dari form kontak, hitung ulang harga order).
- **Media/gambar:** Cloudinary (upload & hosting foto galeri, layanan, testimoni, dan konten landing page) — **bukan** Firebase Storage. Upload dilakukan langsung dari browser admin panel ke Cloudinary (unsigned upload preset); Firestore hanya menyimpan `secure_url` hasil upload, tidak menyimpan file.
- **Peta & rute:** Leaflet.js + tile OpenStreetMap. Rute dari titik lokasi outlet (disimpan di Pengaturan admin) ke titik lokasi customer — pakai Leaflet Routing Machine + OSRM public demo server untuk MVP (lihat catatan reliabilitas di Open Questions PRD sebelum production).
- **Captcha:** Google reCAPTCHA (v2 checkbox atau v3 invisible — lihat Open Questions PRD). Verifikasi token WAJIB terjadi di Cloud Function saat submit order, bukan hanya validasi di client.
- **Hosting:** Firebase Hosting.

## Aturan Bisnis Wajib (jangan diasumsikan lain)
- Tidak ada endpoint/akses publik ke data admin. Yang publik hanya: baca konten landing page yang berstatus tampil (`published`), baca galeri/testimoni yang `tampil: true`, dan submit form pemesanan/form kontak (keduanya wajib lolos captcha, diverifikasi via Cloud Function).
- **Layanan tidak dihapus permanen** jika sudah pernah dipakai di pesanan mana pun — cukup dinonaktifkan (`aktif: false`) supaya riwayat pesanan lama tidak rusak/hilang konteks harganya. Ini setara dengan aturan "kategori tidak bisa dihapus" — jangan bikin hard delete di sisi layanan.
- **Snapshot harga & nama layanan disimpan di dalam dokumen order** saat order dibuat (bukan hanya reference/id ke `services`). Kalau harga master berubah nanti, order lama tidak boleh ikut berubah.
- **Total harga order dihitung di server (Cloud Function), bukan dipercaya dari client.** Client hanya kirim daftar service_id + qty; total dihitung ulang dari harga master aktif saat itu.
- Harga layanan & harga sabun disimpan sebagai **integer** (Rupiah, tanpa desimal). Input harga di admin pakai pemisah ribuan saat mengetik, dikirim ke Firestore sebagai integer polos.
- Qty harus positif (minimal 1).
- Kalau pelanggan memilih metode **"Dijemput"** untuk layanan cuci/repaint, alamat penjemputan **wajib** diisi (teks alamat + pin titik lokasi di peta). Kalau memilih **"Antar Sendiri ke Outlet"**, alamat tidak wajib.
- Kalau order berisi **hanya pembelian sabun** (tanpa cuci/repaint), metode yang berlaku adalah "Dikirim ke Alamat" atau "Ambil di Outlet" — bukan istilah "dijemput" (karena tidak ada barang yang perlu dijemput dari customer).
- Order **tidak boleh kosong layanan** — minimal satu item (layanan atau produk sabun) sebelum bisa disubmit.
- Status order mengikuti alur tetap (lihat PRD §6) dan **tidak boleh loncat tahap** dari sisi client — perubahan status hanya lewat aksi eksplisit admin di admin panel, dan setiap perubahan dicatat di riwayat status (`status_history`) dengan timestamp.
- Rute peta dihitung **sekali** saat order dikonfirmasi (bukan tracking kurir bergerak real-time — itu di luar scope MVP). Kalau geocoding alamat gagal, order tetap tersimpan; admin bisa input/pindah pin lokasi secara manual di peta.
- Galeri before-after **wajib** dua foto (before & after) per entri — tidak boleh submit dengan hanya satu foto.
- Testimoni diinput manual oleh admin (bukan form publik dari customer) untuk MVP — jangan bikin alur submit testimoni dari sisi publik tanpa diminta eksplisit.
- Konten landing page (hero, tentang kami, keunggulan, promosi, kontak) disimpan di Firestore (koleksi `content` & `settings`) dan bisa diedit admin tanpa redeploy — jangan hardcode teks/gambar section-section ini langsung di komponen React.
- Semua field gambar (`foto`, `before_url`, `after_url`, `foto_url`, gambar hero/promo) berisi **URL Cloudinary**, bukan path Firebase Storage — jangan buat logic yang mengasumsikan file gambar ada di Firebase Storage bucket.

## Design System (Tailwind)
Landing page = energik, hangat, dipercaya (tema air/bersih, terinspirasi promosi asli Lave Streat: gradasi biru, gelembung sabun, speech-bubble). Admin panel = admin dashboard standar (sidebar tetap + topbar + content area), palet sama tapi lebih tenang/fungsional. Token & detail lengkap ada di `style-reference-lavestreat.md` §Tokens; jangan pakai warna di luar palet berikut kecuali warna sistem yang sudah didefinisikan (`danger`, `success`):

```
brand.light = #EAF7FE   (page background)
brand.100   = #BEE7FA   (card/surface alt, highlight band)
brand.200   = #8ED1F0   (border, secondary button, badge)
brand.600   = #2F6FED   (primary action — tombol, link aktif)
brand.900   = #0A3D66   (dark section, sidebar admin, heading text)
accent.gold = #FDB813   (aksen "punctuation" — badge promo/new, sparkle, dipakai kecil & jarang)
sand.100    = #EFE7D8   (surface hangat alternatif, dari warna sepatu di foto promosi)
danger      = #D8402C
success     = #1E9E6B
```

Font: `Baloo 2` (bold, rounded) khusus headline/hero di landing page (`font-display`), `Inter` untuk semua UI, body text, tabel, admin panel, dan angka. Jangan pakai font lain. Detail lengkap termasuk do's/don'ts, tone visual, dan referensi brand serupa ada di `style-reference-lavestreat.md`.

Komponen harus konsisten dengan pola di design brief §7 (button, card, badge, modal, toast, speech-bubble callout) — jangan reinvent kelas Tailwind ad-hoc per halaman; kalau butuh varian baru, tambahkan ke komponen shared, bukan inline sekali pakai.

## Struktur Data Kunci (Firestore)
- `settings/general` — lokasi outlet (lat, lng, alamat teks — titik asal rute Leaflet), kontak (email, WA/telpon, Instagram), jam operasional.
- `content/home`, `content/about` — teks & gambar landing page yang bisa diedit admin (hero, keunggulan, sejarah, visi-misi, promosi aktif).
- `services` (koleksi) — layanan cuci/repaint/kategori lain + produk sabun, harga, gambar, contoh before-after, `aktif` (soft delete flag).
- `gallery` (koleksi) — pasangan foto before/after, caption, referensi nama layanan (bebas teks, **tidak perlu foreign key/join** — Firestore denormalized), flag tampil di homepage.
- `testimonials` (koleksi) — nama pelanggan, isi, rating opsional, foto opsional, flag tampil, diinput admin.
- `orders` (koleksi) — data pelanggan, item layanan/produk (dengan snapshot nama+harga), metode (dijemput/antar sendiri/dikirim/ambil), alamat + koordinat jemput & antar (nullable sesuai metode), jadwal diminta, status, `status_history`, total_harga (computed backend), flag captcha_verified.
- Referensi skema lengkap: `prd-lavestreat.md` §7.

## Konvensi Kode
- Frontend: komponen shared di `src/components/`, per-fitur di `src/features/` (`orders`, `services`, `gallery`, `testimonials`, `content`, `auth`), halaman publik & admin dipisah di `src/pages/public/` dan `src/pages/admin/` mengikuti Screen Inventory di design brief §6.
- Peta: bungkus Leaflet di `src/components/map/` (komponen `LocationPicker` untuk pilih pin alamat, `RouteMap` untuk tampilkan rute outlet→customer) — jangan panggil Leaflet langsung dari halaman.
- Firebase: konfigurasi & init di `src/lib/firebase.js`; semua akses Firestore lewat fungsi di `src/lib/api/` (per koleksi), jangan query Firestore langsung dari komponen UI.
- Cloudinary: bungkus logic upload di `src/lib/cloudinary.js` (fungsi `uploadImage(file)` → return `secure_url`), dipakai lewat komponen shared `ImageUploader` — jangan panggil endpoint upload Cloudinary langsung dari tiap halaman form.
- Cloud Functions (di `functions/`): `verifyCaptchaAndCreateOrder`, `sendContactEmail`, dan fungsi hitung ulang total harga — logic bisnis sensitif (harga, captcha) **harus** di sini, bukan di client.
- Nama variabel/komponen dalam bahasa Inggris; teks yang tampil ke user dalam Bahasa Indonesia (sesuai PRD).

## Yang TIDAK Boleh Dikerjakan Tanpa Konfirmasi
- Menambah payment gateway / pembayaran online — MVP pembayaran off-platform (transfer/COD, dikonfirmasi manual oleh admin/CS).
- Menambah tracking kurir real-time (live location bergerak) — scope MVP hanya rute statis + estimasi jarak/waktu, dihitung sekali.
- Menambah akun/login untuk customer (order tetap guest-checkout).
- Mengubah alur status pesanan (urutan tahap) yang sudah diputuskan di PRD §6.
- Mengubah palet warna, font, atau layout dasar tanpa update ke `design-brief-lavestreat.md` dan `style-reference-lavestreat.md` dulu.
- Menambah fitur di luar MVP (lihat "v2" dan "Nanti" di PRD §5) tanpa diminta eksplisit — termasuk multi-cabang/outlet, notifikasi WA/email otomatis, dan form testimoni publik.

## Referensi
- `prd-lavestreat.md` — requirement fungsional lengkap, data model, edge case, open questions.
- `design-brief-lavestreat.md` — layout tiap screen (publik & admin), component library, state, accessibility.
- `style-reference-lavestreat.md` — design tokens mentah (warna, tipografi, spacing, do's/don'ts), siap dipakai agent untuk styling detail.
- `security-architecture-lavestreat.md` — arsitektur & kebijakan keamanan (Firestore Security Rules, pemisahan logika sensitif ke Cloud Functions, App Check, security headers). **Wajib dipatuhi** saat mengimplementasikan autentikasi, order, dan upload gambar — bukan sekadar referensi opsional.
