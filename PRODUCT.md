# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Budi (Pekerja Kantoran Sibuk)**: Sepatu kerja atau sneaker kotor tetapi tidak sempat datang langsung ke outlet fisik. Membutuhkan opsi pemesanan antar-jemput yang jelas alurnya, penjadwalan transparan, dan dapat dipesan secara online tanpa kerumitan.
2. **Sari (Kolektor Sneaker & Pecinta Alas Kaki)**: Sangat memprioritaskan keamanan material dan hasil detailing/repaint restorasi. Memerlukan bukti visual nyata sebelum memutuskan untuk memesan (perbandingan Before-After interaktif dari berbagai sudut serta ulasan pelanggan asli).
3. **Pengelola / Admin Workshop Lave Streat**: Membutuhkan satu dashboard terintegrasi untuk menerima dan memvalidasi order masuk, memantau rute jemput ke lokasi pelanggan di peta, mengatur status pengerjaan, serta memperbarui katalog harga dan konten foto tanpa perlu deploy ulang kode.

## Product Purpose

Lave Streat (L.A.V.E Treatment) adalah platform website resmi jasa cuci sepatu, restorasi warna (repaint), unyellowing, dan penjualan produk sabun perawatan sepatu untuk area Sidoarjo, Surabaya, dan sekitarnya. Platform ini bertujuan menghadirkan pengalaman pemesanan yang profesional, transparan, dan terpercaya dengan menggabungkan company profile interaktif, katalog tarif resmi, bukti dokumentasi pengerjaan manual, dan dashboard operasional workshop.

## Positioning

Perawatan sepatu spesialis berbasis pengerjaan manual 100% (*hand-detailing*) yang didukung fasilitas antar-jemput langsung ke alamat pelanggan di Sidoarjo–Surabaya. Berbeda dari jasa laundry konvensional, Lave Streat menggunakan formula pembersih khusus ramah bahan ber-pH netral, garansi cuci ulang, dan dokumentasi visual multi-sudut Sebelum & Sesudah pengerjaan.

## Operating Context

- **Pemesanan Publik**: Guest order tanpa perlu registrasi akun. Pelanggan memilih paket perawatan atau produk sabun, menentukan metode (Dijemput Kurir / Antar Mandiri), menandai titik penjemputan di peta interaktif, dan memverifikasi pesanan dengan Google reCAPTCHA.
- **Operasional Admin**: Admin login via Firebase Auth untuk memantau tiket masuk, mengonfirmasi pesanan, meninjau rute pengantaran outlet ke customer via peta Leaflet, memperbarui status pengerjaan, serta mengunggah dan mengatur foto sudut dan framing galeri.
- **Penyimpanan Data & Media**: Data disimpan terpusat di Google Cloud Firestore, logika perhitungan harga dan keamanan diverifikasi di Cloud Functions, dan media foto di-host langsung melalui Cloudinary.

## Capabilities and Constraints

- **Pemesanan Guest Checkout**: Tidak ada login untuk customer publik; verifikasi anti-spam wajib melalui Google reCAPTCHA server-side.
- **Snapshot Data Pesanan**: Harga, nama layanan, dan data item di-snapshot ke dalam dokumen order saat transaksi dibuat agar perubahan harga master tidak mengubah riwayat lama.
- **Integritas Layanan**: Layanan master tidak dihapus permanen (*soft delete* via `aktif: false`) untuk menjaga relasi riwayat pesanan.
- **Framing & Sudut Foto**: Galeri mendukung hingga 4 sudut foto per item (Depan, Samping Luar, Samping Dalam, Belakang/Sol) dengan penentuan sudut cover dan posisi crop (X/Y) untuk kartu beranda.
- **Metode Pembayaran**: Pembayaran manual off-platform (transfer bank / COD saat kurir tiba), dikonfirmasi oleh admin/CS. Tidak menggunakan payment gateway otomatis pada versi saat ini.
- **Peta Rute Statis**: Rute outlet menuju customer dihitung saat konfirmasi order menggunakan Leaflet Routing Machine / OSRM, bukan pelacakan kurir bergerak real-time.

## Brand Commitments

- **Identitas**: Lave Streat (L.A.V.E Treatment) — tema air bersih yang bergerak cepat (*soap bubbles on their way to your door*).
- **Palet Warna Inti**: Ocean Navy (`#0A3D66`), Splash Blue (`#2F6FED`), Sky Wash (`#8ED1F0`), Foam Blue (`#BEE7FA`), Cloud Canvas (`#EAF7FE`), dan aksen Bubble Gold (`#FDB813`).
- **Tipografi**: Headline ekspresif menggunakan `Baloo 2` (tebal, membulat, ramah), dan seluruh antarmuka teks UI/body/tabel menggunakan `Inter`.
- **Tone of Voice**: Ramah, hangat, transparan, berorientasi pada bukti pengerjaan nyata (*result-driven*).

## Evidence on Hand

- **Data Transaksi Asli**: 20 pesanan riil dengan total 42 pasang sepatu dan omset tercatat Rp 1.260.000 tersimpan di Firestore.
- **Dokumentasi Galeri Riil**: 41 pasang foto Before-After beresolusi tinggi yang ter-host di Cloudinary mencakup berbagai tipe sneaker (Nike, Adidas, Brodo, NB, Converse, dsb.).
- **Katalog Layanan**: Tarif resmi untuk Deep Clean, White Clean, Fast Clean, Suede Clean, Unyellowing, Repaint, serta produk Shoe Cleaner.

## Product Principles

1. **Bukti Visual Nyata (Proof Over Claims)**: Kepercayaan pelanggan dibangun melalui komparasi Sebelum & Sesudah yang tajam, interaktif, dan multi-sudut, bukan sekadar janji pemasaran.
2. **Kenyamanan Operasional (Low Friction)**: Pemesanan tanpa login berbelit, input alamat dengan bantuan peta interaktif, dan penjadwalan antar-jemput yang jelas.
3. **Integritas Data Workshop (Authentic System)**: Dashboard admin menampilkan data riil dari lapangan tanpa metrik artifisial, mendukung efisiensi teknisi dan kurir.
4. **Keamanan & Skalabilitas (Zero Slop & Strict Bounds)**: Validasi harga dan token captcha di backend server-side, hak akses Firestore terproteksi ketat, dan aset media tersimpan di CDN berkecepatan tinggi.

## Accessibility & Inclusion

- Memenuhi standar WCAG 2.1 Level AA untuk rasio kontras teks utama terhadap background terang maupun gelap.
- Komponen interaktif (slider Before-After, tombol navigasi, tab galeri) mendukung kendali keyboard dan touch gesture yang ramah layar sentuh ponsel.
- Ukuran tap target minimal 44x44px pada viewport perangkat bergerak.
