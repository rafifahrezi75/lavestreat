---
name: Lave Streat Design System
description: Perawatan & Restorasi Sepatu Spesialis Sidoarjo-Surabaya
colors:
  primary: "#0A3D66"
  action: "#2F6FED"
  border: "#8ED1F0"
  surface-alt: "#BEE7FA"
  background: "#EAF7FE"
  accent-gold: "#FDB813"
  sand: "#EFE7D8"
  text-light: "#F5FAFF"
  text-muted: "#5B6B78"
  text-main: "#0B1F2E"
  success: "#1E9E6B"
  danger: "#D8402C"
typography:
  display:
    fontFamily: "Baloo 2, cursive, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Baloo 2, cursive, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
  micro:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
---

# Design System: Lave Streat

## Overview

**Creative North Star: "Water in Swift Motion (Gelembung Air Bersih Cepat & Hangat)"**

Lave Streat memancarkan bahasa visual air bersih yang energik dan ramah: kanvas biru muda hangat (*Cloud Canvas*), panel navy pekat (*Ocean Navy*) untuk kontras jangkar, dan headline tebal-bulat berkarakter (*Baloo 2*) yang mengadopsi estetika poster promosi jalanan. Desain menonjolkan bukti pengerjaan riil melalui komparasi Before-After interaktif berkualitas tinggi dan micro-interaction taktil.

### Key Characteristics
- Didominasi keluarga biru bertingkat (≈80% antarmuka) dengan aksen emas Bubble Gold yang digunakan sangat selektif.
- Sudut membulat organik (*rounded-2xl* dan pill) yang mencerminkan gelembung sabun pembersih.
- Dualitas tipografi tegas: `Baloo 2` untuk display headline emosional dan `Inter` untuk seluruh fungsionalitas UI, tabel data, serta angka.

## Colors

Palet warna terinspirasi dari proses pembersihan sepatu manual: buih sabun lembut, air bilasan segar, dan presisi warna alas kaki.

### Primary
- **Ocean Navy** (`#0A3D66`): Jangkar kontras utama untuk section gelap landing page, sidebar admin panel, dan judul tebal berbobot.
- **Splash Blue** (`#2F6FED`): Warna aksi utama untuk tombol primer (CTA "Pesan Penjemputan"), link aktif, dan elemen navigasi fokus.

### Secondary
- **Sky Wash** (`#8ED1F0`): Garis pembatas (border), divider, badge kategori, dan varian tombol sekunder.
- **Foam Blue** (`#BEE7FA`): Background kartu alternatif, band highlight promosi, dan hover state lembut.
- **Cloud Canvas** (`#EAF7FE`): Kanvas latar belakang halaman utama (*page background*) yang memberikan nuansa kesegaran air bersih.

### Tertiary
- **Bubble Gold** (`#FDB813`): Aksen fungsional tunggal untuk badge promo, penanda "Baru", sparkle ikonik, dan titik crosshair framing.

### Neutral
- **Sand Warm** (`#EFE7D8`): Surface alternatif bernuansa hangat netral untuk mencegah kelelahan visual akibat dominasi warna biru.
- **Snow Foam** (`#F5FAFF`): Teks terang dan latar elemen di atas permukaan Ocean Navy.
- **Slate Wet** (`#5B6B78`): Teks sekunder, label pembantu, dan caption metadata.
- **Ink Deep** (`#0B1F2E`): Teks bodi utama di atas latar terang.
- **Success Rinse** (`#1E9E6B`): Status "Selesai" dan notifikasi keberhasilan.
- **Danger Stain** (`#D8402C`): Indikator kesalahan, pembatalan, dan aksi hapus data.

### Named Rules
**The Bubble Gold Rarity Rule.** Aksen Bubble Gold (`#FDB813`) dibatasi maksimum 5% dari total area viewport. Nilai visualnya berasal dari kelangkaannya sebagai penanda penting.
**The No Pure Black Rule.** Tidak diperkenankan menggunakan warna hitam murni (`#000000`) untuk teks atau surface utama. Selalu gunakan `Ink Deep` (`#0B1F2E`) atau `Ocean Navy` (`#0A3D66`) untuk mempertahankan kehangatan palet.

## Typography

**Display Font:** Baloo 2 (fallback: cursive, sans-serif)  
**Body Font:** Inter (fallback: ui-sans-serif, system-ui, sans-serif)  
**Label/Mono Font:** ui-monospace, SFMono-Regular, monospace (khusus nomor invoice)

**Character:** Headline memancarkan keramahan dan energi poster cuci sepatu profesional, diimbangi oleh body Inter yang sangat jernih dan terstruktur untuk data operasional.

### Hierarchy
- **Display** (800, clamp(2rem, 5vw, 3rem), 1.1): Hero headline utama landing page.
- **Headline** (700, 1.75rem - 2.25rem, 1.15): Judul section publik (Bukti Pengerjaan, Layanan, Mengapa Kami).
- **Title** (600, 1.125rem - 1.25rem, 1.3): Judul kartu layanan, nama modal sepatu, dan sub-header dashboard.
- **Body** (400, 0.875rem - 1rem, 1.5): Paragraf penjelas, deskripsi layanan, dan catatan ulasan.
- **Label** (600, 0.75rem, 1.4, tracking-wider): Badge status, tag sudut foto, dan header kolom tabel.

### Named Rules
**The Headline Isolation Rule.** Font Baloo 2 khusus diperuntukkan bagi judul besar landing page. Seluruh teks antarmuka admin, formulir, tabel, dan body copy wajib menggunakan Inter demi keterbacaan teknis.

## Layout

- Grid responsif berbasis 12 kolom untuk desktop, 2 kolom untuk tablet, dan 1 kolom untuk ponsel cerdas.
- Kontainer utama dibatasi `max-w-7xl` (1280px) dengan padding lateral horizontal `px-4 sm:px-6 lg:px-8`.
- Modal interaktif publik menggunakan jangkar area konten di bawah navbar (`top-[70px] sm:top-[76px]`) untuk memastikan centering vertikal yang seimbang terhadap sisa ruang visual.

## Elevation & Depth

Desain mengutamakan *tonal layering* dengan bayangan halus fungsional (*subtle drop-shadow*).

### Shadow Vocabulary
- **Shadow 2xs / Subtle** (`box-shadow: 0 1px 2px 0 rgba(10, 61, 102, 0.05)`): Batas pemisah kartu normal di atas latar kanvas.
- **Shadow Card Hover** (`box-shadow: 0 10px 25px -5px rgba(10, 61, 102, 0.1)`): Efek hover kartu layanan dan kartu Before-After.
- **Shadow Modal Overlay** (`box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35)`): Dialog popup modal perbandingan foto.

## Shapes

- Radius dasar kartu umum: `rounded-2xl` (16px) untuk komponen landing page dan `rounded-xl` (12px) untuk antarmuka admin.
- Tombol aksi: `rounded-lg` (8px) hingga `rounded-full` untuk badge pill dan slider handle.
- Border stroke: Konsisten `1px` menggunakan warna `Sky Wash` (`#8ED1F0`) pada latar terang dan `border-white/15` pada section gelap.

## Components

### Buttons
- **Shape:** `rounded-lg` (8px) atau `rounded-xl` (12px).
- **Primary:** Background `Splash Blue` (`#2F6FED`), teks putih, transisi `hover:bg-brand-500 hover:shadow-md`.
- **Secondary:** Border `brand-200`, background putih, teks `brand-900`, transisi `hover:bg-brand-100`.
- **Glass:** Section gelap menggunakan `bg-white/10 backdrop-blur-md border-white/20 text-white`.

### Before-After Compare
- **Divider:** Garis vertikal putih berbayangan tajam dengan handle bulat 36px berisi ikon chevron ganda taktil.
- **Badges:** Badge "Sebelum" (dark pill translucent) dan "Sesudah" (brand blue beraksen sparkle).
- **Interaksi:** Unified pointer capture untuk pergeseran mulus di desktop mouse maupun layar sentuh ponsel.

### Cards
- **Latar:** Putih bersih (`#FFFFFF`) dengan border `brand-200/90` dan padding `p-4 sm:p-6`.
- **Hover:** Peningkatan elevasi bayangan halus tanpa pergeseran tata letak yang mengganggu.

## Do's and Don'ts

### Do:
- **Do** gunakan rasio 4:3 untuk kartu gambar sampel sepatu agar konsisten dengan frame crop workshop.
- **Do** tampilkan snapshot nama dan harga layanan dalam detail tiket pesanan.
- **Do** sediakan kontrol pointer dragging pada alat framing posisi foto.
- **Do** pertahankan padding vertikal yang seimbang antara batas atas modal ke navbar dan batas bawah modal ke layar.

### Don't:
- **Don't** menutupi navbar dengan modal jika kontainer modal berjangkar pada area konten.
- **Don't** menggunakan data grafik dummy mingguan; selalu kalkulasikan metrik dari pesanan riil.
- **Don't** menghapus layanan secara permanen jika sudah pernah terikat pada transaksi (*soft delete only*).
- **Don't** menambahkan emoji dalam kode program maupun commit message.
