# PRD — Lave Streat (Website Jasa Cuci Sepatu, Repaint & Antar-Jemput)
**Versi:** 1 — draft awal berdasarkan brief pemilik
**Stack:** React (Vite, SPA) + Firebase (Firestore, Auth, Cloud Functions) + Cloudinary (upload & hosting gambar) + Tailwind CSS + Leaflet.js
**Auth:** Login hanya untuk admin (Firebase Auth). Customer tidak perlu akun — pemesanan guest checkout.
**Mata uang:** Rupiah (IDR), tanpa desimal
**Area layanan:** Sidoarjo — Surabaya dan sekitarnya

---

## 1. Problem Statement
Lave Streat adalah jasa cuci & repaint sepatu dengan opsi antar-jemput, plus jualan sabun perawatan sepatu. Saat ini promosi & pemesanan masih mengandalkan media sosial (Instagram) dan chat manual — belum ada satu tempat yang menampilkan profil usaha, katalog layanan dengan contoh hasil (before-after), testimoni, lokasi, dan promosi sekaligus memungkinkan calon pelanggan memesan langsung dengan alur yang jelas. Pemilik juga butuh cara mengelola pesanan masuk (terima/tolak/proses) dan mengubah isi halaman promosi kapan saja tanpa bergantung ke developer setiap kali ada perubahan teks atau foto.

## 2. Target User & Persona
- **Persona 1 — Budi, pekerja kantoran sibuk.** Sepatu kerja/sneakers kotor tapi tidak sempat ke outlet. Butuh opsi antar-jemput yang jelas prosesnya dan bisa dipesan online kapan saja.
- **Persona 2 — Sari, kolektor sneakers.** Peduli hasil detailing/repaint — sebelum percaya, dia mau lihat bukti before-after dan testimoni asli, baru berani pesan.
- **Persona 3 — Admin/Owner Lave Streat.** Perlu satu dashboard untuk menerima pesanan, update status pekerjaan, dan mengganti konten promosi (banner promo, foto galeri, testimoni) tanpa minta bantuan developer.

## 3. Goals & Non-Goals

**Goals**
- Landing page company profile yang meyakinkan: tentang kami, layanan + contoh hasil, galeri before-after, keunggulan, testimoni, lokasi, promosi.
- Form pemesanan publik yang jelas alurnya, dengan captcha anti-spam.
- Admin bisa menerima/menolak/memproses pesanan dan melihat rute dari outlet ke lokasi pelanggan di peta.
- Admin bisa mengubah isi landing page (teks & gambar) sendiri tanpa deploy ulang.
- Data pesanan & konten tersimpan di Firebase — konsisten, real-time, tidak hilang.

**Non-Goals (MVP)**
- Pembayaran online / payment gateway (transfer manual/COD, dikonfirmasi CS).
- Akun/login untuk customer (order tetap guest, tanpa riwayat login).
- Tracking kurir real-time (live location bergerak saat penjemputan/pengantaran).
- Multi-cabang/multi-outlet.
- Notifikasi otomatis (WA/email) saat status pesanan berubah.
- Form testimoni yang bisa diisi publik (testimoni diinput admin dari chat/review asli).

## 4. User Stories

**Publik / Customer**
- Sebagai calon pelanggan, saya ingin melihat daftar layanan beserta contoh hasil before-after, supaya saya yakin sebelum memesan.
- Sebagai calon pelanggan, saya ingin melihat testimoni pelanggan lain, supaya saya lebih percaya.
- Sebagai calon pelanggan, saya ingin memesan cuci/repaint sepatu dan memilih apakah dijemput atau antar sendiri, supaya sesuai kenyamanan saya.
- Sebagai calon pelanggan, saya ingin membeli sabun tanpa harus memesan cuci sepatu, supaya saya bisa belanja produk saja.
- Sebagai calon pelanggan, saya ingin melihat lokasi outlet di peta dan cara menghubungi (email), supaya saya bisa tanya-tanya dulu.

**Admin**
- Sebagai admin, saya ingin melihat semua pesanan masuk beserta detail & rute lokasinya di peta, supaya saya bisa atur penjemputan.
- Sebagai admin, saya ingin menerima/menolak pesanan dan mengubah statusnya seiring progres pekerjaan, supaya pelanggan tahu progres (lewat kontak manual) dan saya punya catatan rapi.
- Sebagai admin, saya ingin mengubah teks & foto di landing page (hero, promosi, tentang kami, keunggulan) kapan saja, supaya tidak tergantung developer.
- Sebagai admin, saya ingin menambah/menonaktifkan layanan dan mengatur harganya, supaya katalog selalu up to date.
- Sebagai admin, saya ingin menambah foto galeri before-after dan testimoni, supaya landing page selalu punya bukti hasil terbaru.

## 5. Daftar Fitur

**MVP**
- Landing page: Home (hero, tentang kami singkat, galeri before-after singkat, keunggulan, testimoni, lokasi+peta, promosi), Tentang Kami (sejarah berdirinya Lave Streat, visi & misi), Layanan (daftar layanan + contoh hasil), Kontak (form hubungi via email + peta lokasi outlet).
- Form Pemesanan (halaman/modal terpisah) dengan captcha, mendukung: pilih layanan (cuci/repaint/gabungan) + metode antar-jemput/antar-sendiri, atau pilih beli sabun + metode kirim/ambil sendiri.
- Peta lokasi (Leaflet) di halaman Kontak & di detail pesanan admin (rute outlet → lokasi customer).
- Admin: Login, Dashboard ringkas (jumlah pesanan per status), Kelola Pesanan (list, detail, ubah status, lihat rute), Kelola Layanan (CRUD + nonaktifkan), Kelola Galeri (CRUD before-after), Kelola Testimoni (CRUD), Kelola Konten Landing Page (hero, tentang kami, promosi, kontak), Pengaturan (titik lokasi outlet, kontak, jam operasional).

**v2**
- Cetak/export detail pesanan (invoice/struk) ke PDF.
- Notifikasi WA/email otomatis saat status pesanan berubah.
- Multi-admin dengan role (admin vs staff/kurir).
- Statistik sederhana (jumlah pesanan & pendapatan per bulan/layanan).
- Form testimoni yang bisa disubmit pelanggan (dengan moderasi admin sebelum tampil).

**Nanti / belum prioritas**
- Payment gateway, akun customer, tracking kurir real-time, multi-cabang, aplikasi mobile native.

## 6. Functional Requirements — Detail MVP

**6.1 Landing Page & Konten**
- Semua teks & gambar section (hero, tentang kami, keunggulan, promosi, kontak) diambil dari Firestore (`content/home`, `content/about`, `settings/general`), bukan hardcode — admin edit lewat admin panel, perubahan langsung tampil tanpa deploy.
- Promosi (`content/home.promo`) punya flag aktif/nonaktif dan periode tampil opsional.

**6.2 Layanan**
- Data layanan: nama, kategori (Cuci / Repaint / Sabun & Perawatan), deskripsi, harga (integer, Rupiah), satuan (per pasang / per item), foto, contoh before-after (opsional, bisa ambil dari koleksi `gallery`), status `aktif`.
- Layanan yang sudah pernah dipakai di pesanan **tidak boleh dihapus permanen** — hanya bisa dinonaktifkan (`aktif: false`), tetap tersimpan supaya riwayat order lama valid.

**6.3 Form Pemesanan**
- Pelanggan pilih satu atau lebih item: layanan cuci/repaint (qty = jumlah pasang sepatu) dan/atau produk sabun (qty = jumlah unit).
- Jika ada item cuci/repaint: wajib pilih metode **"Dijemput"** (isi alamat + pin lokasi di peta) atau **"Antar Sendiri ke Outlet"** (alamat tidak wajib).
- Jika order hanya berisi sabun: wajib pilih metode **"Dikirim ke Alamat"** (isi alamat) atau **"Ambil di Outlet"**.
- Data pelanggan: nama, nomor WA/telpon (wajib untuk koordinasi), email (opsional), catatan tambahan (opsional).
- Jadwal diminta: tanggal + slot waktu kasar (pagi/siang/sore), bukan jam presisi.
- Captcha (reCAPTCHA) wajib lolos sebelum order tersimpan — verifikasi token terjadi di Cloud Function, bukan hanya di client.
- `total_harga` dihitung ulang di backend dari harga master layanan/sabun yang aktif saat order dibuat — **tidak boleh percaya nilai total dari client**. Nama & harga tiap item di-snapshot ke dalam dokumen order.
- Order tidak boleh kosong (minimal satu item) sebelum bisa disubmit.

**6.4 Alur Status Pesanan**
- Untuk order dengan komponen cuci/repaint + dijemput: `Menunggu Konfirmasi` → `Dikonfirmasi` → `Sedang Dijemput` → `Diproses` → `Siap Diantar` → `Selesai`. (Atau `Ditolak` / `Dibatalkan` dari tahap manapun sebelum `Selesai`.)
- Untuk order dengan antar-sendiri/ambil-sendiri: `Menunggu Konfirmasi` → `Dikonfirmasi` → `Diproses` → `Siap Diambil` → `Selesai`.
- Untuk order sabun dikirim tanpa proses cuci: `Menunggu Konfirmasi` → `Dikonfirmasi` → `Dikirim` → `Selesai`.
- Setiap perubahan status dicatat di `status_history` (status, timestamp, opsional catatan admin) — status tidak boleh diubah lompat tahap dari sisi client, hanya lewat aksi admin di admin panel.

**6.5 Peta & Rute (Leaflet)**
- Titik asal rute = lokasi outlet, disimpan tetap di `settings/general` (lat, lng, alamat), diatur admin di halaman Pengaturan.
- Titik tujuan = alamat penjemputan/pengantaran pelanggan (dari pin di form pemesanan, atau geocoding dari teks alamat sebagai fallback).
- Rute ditampilkan sebagai garis rute jalan (bukan garis lurus) memakai Leaflet Routing Machine + OSRM, dihitung sekali saat pesanan dibuat/dikonfirmasi — bukan tracking real-time kurir bergerak.
- Jika geocoding/pencarian rute gagal, order tetap tersimpan; halaman detail pesanan admin menampilkan pesan "lokasi belum bisa dipetakan" dan admin bisa menggeser pin manual.

**6.6 Kontak**
- Halaman Kontak menampilkan peta lokasi outlet (Leaflet) + info kontak (email, WA/telpon, Instagram — dari `settings/general`) + form "Hubungi Kami" (nama, email, pesan).
- Form kontak mengirim isi pesan ke email admin lewat Cloud Function (bukan mailto langsung), juga wajib lolos captcha.

**6.7 Galeri Before-After**
- Tiap entri galeri wajib dua foto: before & after (tidak boleh submit hanya satu).
- Field: caption singkat, nama layanan terkait (teks bebas, tidak perlu relasi/FK ke `services`), flag tampil di homepage.

**6.8 Testimoni**
- Diinput manual oleh admin (nama pelanggan, isi testimoni, rating opsional 1–5, foto opsional, flag tampil).
- Tidak ada form submit testimoni dari sisi publik di MVP.

**6.9 Media (Gambar)**
- Semua gambar (foto layanan, before-after galeri, foto testimoni, gambar hero/promo di konten landing page) diupload ke **Cloudinary** langsung dari admin panel (unsigned upload preset) — **bukan** Firebase Storage.
- Firestore hanya menyimpan `secure_url` hasil upload Cloudinary (string), tidak menyimpan file gambar itu sendiri.
- Validasi ukuran & tipe file (mis. maks 5MB, jpg/png/webp) dilakukan di sisi client sebelum upload; kalau upload ke Cloudinary gagal, form tidak boleh tersimpan seolah gambar ada (jangan simpan URL kosong/placeholder ke Firestore).
- Transformasi gambar (resize/crop thumbnail untuk grid galeri & card layanan) memanfaatkan fitur transformasi URL Cloudinary (on-the-fly), bukan diproses manual di backend.

## 7. Sketsa Data Model (Firestore)

**settings/general** (dokumen tunggal)
| Field | Tipe | Keterangan |
|---|---|---|
| outlet_lat, outlet_lng | number | titik asal rute Leaflet |
| outlet_address | string | alamat teks outlet |
| contact_email | string | tujuan form kontak & pemesanan |
| contact_phone | string | nomor WA/telpon ditampilkan publik |
| instagram | string | handle IG |
| jam_operasional | string/map | jam buka per hari |

**content/home, content/about** (dokumen)
| Field | Tipe | Keterangan |
|---|---|---|
| hero_title, hero_subtitle | string | teks hero |
| keunggulan | array of {icon, title, desc} | section keunggulan |
| promo | {aktif, judul, deskripsi, gambar (URL Cloudinary), periode} | banner promosi |
| sejarah, visi, misi | string / array string | khusus `content/about` |

**services** (koleksi)
| Field | Tipe | Keterangan |
|---|---|---|
| id | string | |
| nama | string | |
| kategori | enum: cuci / repaint / sabun | |
| deskripsi | string | |
| harga | integer | Rupiah, tanpa desimal |
| satuan | string | mis. "per pasang", "per botol" |
| foto | string (URL Cloudinary) | |
| aktif | boolean | soft delete flag, default true |
| created_at / updated_at | timestamp | |

**gallery** (koleksi)
| Field | Tipe | Keterangan |
|---|---|---|
| id | string | |
| before_url, after_url | string (URL Cloudinary) | wajib keduanya diisi |
| caption | string | |
| layanan_terkait | string, nullable | teks bebas, tanpa FK |
| tampil_di_home | boolean | |
| created_at | timestamp | |

**testimonials** (koleksi)
| Field | Tipe | Keterangan |
|---|---|---|
| id | string | |
| nama_pelanggan | string | |
| isi | string | |
| rating | integer 1–5, nullable | |
| foto_url | string (URL Cloudinary), nullable | |
| tampil | boolean | |
| created_at | timestamp | |

**orders** (koleksi)
| Field | Tipe | Keterangan |
|---|---|---|
| id / nomor_order | string | |
| pelanggan | {nama, telepon, email?} | |
| items | array of {service_id, nama_snapshot, harga_snapshot, qty} | snapshot, bukan reference murni |
| metode | enum: dijemput / antar_sendiri / dikirim / ambil_sendiri | |
| alamat_jemput | {teks, lat, lng}, nullable | wajib jika metode = dijemput |
| alamat_antar | {teks, lat, lng}, nullable | default = alamat_jemput bila kosong |
| jadwal_tanggal, jadwal_slot | date, string | |
| catatan | string, nullable | |
| total_harga | integer | computed di backend |
| status | enum (lihat §6.4) | |
| status_history | array of {status, timestamp, catatan?} | |
| captcha_verified | boolean | |
| created_at / updated_at | timestamp | |

*(Tidak ada relasi keras antar koleksi — Firestore denormalized, sesuai pola snapshot di atas.)*

## 8. Edge Case & Failure State
- Order disubmit tanpa item apapun → ditolak validasi frontend & backend.
- Metode "Dijemput" dipilih tapi alamat/pin kosong → wajib diisi, validasi jelas sebelum submit.
- Layanan yang sudah dipakai di order lama dinonaktifkan admin → order lama tetap tampil normal (pakai snapshot), hanya hilang dari pilihan form pemesanan baru.
- Captcha gagal/expired → order tidak tersimpan, pesan error jelas, pelanggan bisa coba ulang.
- Geocoding alamat gagal → order tetap tersimpan, peta tampil pesan "lokasi belum bisa dipetakan", admin bisa set pin manual.
- Galeri disubmit dengan hanya satu foto (before atau after saja) → ditolak validasi.
- Login admin gagal → pesan error generik, tidak membocorkan apakah email terdaftar.
- Perubahan status pesanan dari admin panel tanpa melalui urutan yang sah → ditolak backend dengan pesan jelas.

## 9. Success Metrics
- Calon pelanggan bisa memesan (submit form) tanpa bantuan chat manual dalam < 3 menit.
- Admin bisa mengubah teks/gambar promosi di landing page sendiri tanpa developer, perubahan tampil real-time.
- 0 pesanan spam/bot lolos ke dashboard admin (captcha efektif).
- Admin bisa melihat rute lokasi pelanggan di peta untuk setiap pesanan yang alamatnya valid.
- 0 insiden riwayat order rusak akibat perubahan/nonaktifnya data layanan.

## 10. Open Questions (untuk dikonfirmasi pemilik)
1. **Captcha:** reCAPTCHA v2 (checkbox, lebih terlihat jelas ke user) atau v3 (invisible, lebih mulus tapi butuh threshold tuning)?
2. **Rute Leaflet:** MVP pakai OSRM public demo server (gratis, tanpa API key, tapi best-effort tanpa SLA) — kalau volume order tinggi nanti, perlu pindah ke provider routing berbayar/self-hosted?
3. **Kontak:** apakah cukup email saja untuk form "Hubungi Kami", atau perlu tombol langsung ke WhatsApp juga (mengingat nomor WA sudah tampil di materi promosi)?
4. **Multi-admin:** untuk MVP diasumsikan satu akun admin/owner — apakah sudah ada rencana staff/kurir yang perlu akses terbatas (mis. hanya lihat & update status, tanpa akses kelola konten/harga)?
5. **Branding final:** nama tampil di website "Lave Streat" atau "L.A.V.E Treatment" — dan apakah logo final sudah ada asetnya (vektor) di luar yang ada di materi promosi?
6. **Cloudinary:** pakai akun/plan Cloudinary yang mana (free tier cukup untuk volume galeri & testimoni yang diperkirakan, atau perlu plan berbayar)? Dan apakah unsigned upload preset dibatasi folder/ukuran tertentu supaya tidak disalahgunakan kalau preset-nya sampai bocor?
