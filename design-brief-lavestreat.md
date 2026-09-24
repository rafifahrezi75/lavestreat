# Design Brief — Lave Streat (Landing Page + Admin Panel, Tailwind CSS)
Dua mode visual dalam satu design system: **landing page publik** yang energik & hangat (terinspirasi materi promosi asli Lave Streat — gradasi biru, gelembung sabun, speech-bubble, headline tebal), dan **admin panel** dengan struktur dashboard standar (sidebar + topbar + content) yang tenang & fungsional, memakai palet warna yang sama.

## 1. Design Principles
1. **Landing page = bersih & meyakinkan, bukan norak.** Palet biru air + gelembung dipakai untuk kesan segar/terpercaya, tapi tetap rapi — bukti hasil (before-after) dan testimoni jadi pusat perhatian, bukan dekorasi.
2. **Admin panel = fungsional dulu, gaya belakangan.** Sidebar + table + card konsisten, prioritas kecepatan input & kejelasan status pesanan, bukan eksplorasi visual.
3. **Satu elemen khas jadi jembatan dua mode:** bentuk **speech-bubble** (dari materi promosi asli — "Males Keluar?", "Gaada Waktu Buat Ngantar?") dipakai ulang sebagai gaya khas untuk testimoni & badge status, supaya landing page dan identitas brand tetap terasa menyatu.

## 2. Visual Direction
**Mood:** segar, hangat, terpercaya — air bersih + gelembung sabun + energi biru cerah, dengan headline tebal bergaya komik/poster (mengikuti gaya font pada materi promosi asli), tapi tata letak tetap rapi ala landing page modern (bukan flyer promosi yang penuh sesak).

**Dihindari:** biru generic ala tech-SaaS dingin (harus terasa "air bersih", bukan "korporat fintech"), terlalu banyak gradient besar yang membebani performa, ikon 3D/gradient berlebihan, kontras teks putih di atas biru muda yang gagal AA.

## 3. Palet Warna
Diambil dari materi promosi asli Lave Streat (gradasi biru langit → biru tua, gelembung putih, speech-bubble biru gelap).

| Token Tailwind | Hex | Peran |
|---|---|---|
| `brand-light` | `#EAF7FE` | Background utama landing page (page bg), area konten admin panel |
| `brand-100` | `#BEE7FA` | Background card/surface alt, highlight band, hover state ringan |
| `brand-200` | `#8ED1F0` | Border, divider, secondary button, badge |
| `brand-600` | `#2F6FED` | Primary action (tombol CTA, link aktif, ikon aktif sidebar) |
| `brand-900` | `#0A3D66` | Sidebar admin / dark section landing page, teks heading, hover tombol primer |

Warna tambahan (dipakai lebih jarang, untuk aksen & sistem):
- `accent-gold`: `#FDB813` (aksen "punctuation" — badge Promo/Baru, sparkle dekoratif; jangan dipakai untuk area besar)
- `sand-100`: `#EFE7D8` (surface hangat alternatif — dari warna sepatu di foto, dipakai selang-seling di section "Tentang Kami"/testimoni supaya tidak monoton biru)
- `text-primary`: `#0B1F2E` (hampir hitam kebiruan, untuk body text di atas bg terang)
- `text-onDark`: `#F5FAFF` (teks di atas `brand-900`)
- `danger`: `#D8402C` (error/hapus/tolak)
- `success`: `#1E9E6B` (konfirmasi/selesai)

## 4. Tailwind Config
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#EAF7FE',
          100: '#BEE7FA',
          200: '#8ED1F0',
          600: '#2F6FED',
          900: '#0A3D66',
        },
        accent: { gold: '#FDB813' },
        sand: { 100: '#EFE7D8' },
        danger: '#D8402C',
        success: '#1E9E6B',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Baloo 2', 'ui-rounded', 'sans-serif'], // khusus headline landing page
      },
      borderRadius: {
        card: '16px',
        bubble: '24px', // callout testimoni bergaya speech-bubble
      },
    },
  },
}
```

Contoh kelas utility yang jadi standar dipakai berulang:
- Landing page background: `bg-brand-light`
- Landing page dark section (mis. footer/CTA besar): `bg-brand-900 text-[#F5FAFF]`
- Card (galeri/layanan/stat): `bg-white rounded-card border border-brand-200 shadow-sm p-4`
- Primary button (CTA "Pesan Sekarang"): `bg-brand-600 hover:bg-brand-900 text-white rounded-full px-6 py-3 font-semibold`
- Secondary button: `border border-brand-200 text-brand-900 hover:bg-brand-100 rounded-full px-6 py-3`
- Badge Promo/Baru: `bg-accent-gold text-brand-900 text-xs font-semibold rounded-full px-2.5 py-1`
- Speech-bubble callout (testimoni/status): `bg-brand-900 text-[#F5FAFF] rounded-bubble px-4 py-3` + ekor kecil via pseudo-element
- Admin sidebar: `bg-brand-900 text-[#F5FAFF]`
- Admin table header: `bg-brand-100 text-brand-900 text-sm font-medium`
- Admin sidebar nav aktif: `bg-brand-600 text-white rounded-md`

## 5. Layout — Landing Page (publik)
```
┌──────────────────────────────────────────────────┐
│  Navbar: logo · Home · Tentang Kami · Layanan ·    │
│          Kontak · [Pesan Sekarang]                 │
├──────────────────────────────────────────────────┤
│  Hero (bg-brand-light / gradasi ke brand-100)       │
│   headline font-display besar + CTA + ilustrasi     │
├──────────────────────────────────────────────────┤
│  Section: Tentang Kami singkat                      │
│  Section: Galeri Before-After singkat (carousel)    │
│  Section: Keunggulan (grid ikon)                    │
│  Section: Testimoni (speech-bubble cards, carousel) │
│  Section: Lokasi (peta Leaflet + alamat)            │
│  Section: Promosi (banner, hanya tampil jika aktif) │
├──────────────────────────────────────────────────┤
│  Footer (bg-brand-900): kontak, IG, jam operasional │
└──────────────────────────────────────────────────┘
```
- Navbar sticky, transparan di atas hero lalu solid saat scroll.
- Section dark (`brand-900`) dipakai maksimal di footer + satu CTA band sebelum footer, supaya rombak biru-putih tidak monoton.
- Section "Tentang Kami" (halaman penuh) & "Layanan" (halaman penuh) pakai layout yang sama dengan versi singkat di Home, hanya lebih lengkap.

## 6. Layout — Admin Panel
```
┌─────────────┬────────────────────────────────────────┐
│             │  Topbar: judul halaman · profil/logout   │
│  Sidebar    ├────────────────────────────────────────┤
│  (fixed)    │                                          │
│  - Dashboard│  Content area (bg-brand-light, padding)  │
│  - Pesanan  │   - stat card (grid)                     │
│  - Layanan  │   - table / form / peta (card putih)     │
│  - Galeri   │                                          │
│  - Testimoni│                                          │
│  - Konten   │                                          │
│  - Pengaturan│                                         │
└─────────────┴────────────────────────────────────────┘
```
- Sidebar `w-64`, fixed, collapsible jadi icon-only di tablet; mobile jadi drawer via hamburger di topbar.
- Topbar `h-16`, sticky, breadcrumb/judul halaman kiri, profil+logout kanan.
- Detail Pesanan dibuka sebagai halaman/drawer dengan dua kolom: info pesanan (kiri) + peta rute Leaflet outlet→pelanggan (kanan).

## 7. Screen Inventory & Layout per Screen

**Publik**
| Screen | Isi Content Area |
|---|---|
| Home | Hero, Tentang Kami singkat, Galeri before-after singkat, Keunggulan, Testimoni, Lokasi+peta, Promosi |
| Tentang Kami | Sejarah berdirinya Lave Streat, Visi & Misi (layout dua kolom teks + ilustrasi/foto) |
| Layanan | List/grid layanan per kategori (Cuci, Repaint, Sabun & Perawatan), tiap kartu ada contoh before-after |
| Kontak | Peta lokasi outlet (Leaflet) + info kontak (email/WA/IG/jam) + form "Hubungi Kami" |
| Form Pemesanan | Card form multi-step: pilih layanan/produk → metode (dijemput/antar sendiri/kirim/ambil) → data pelanggan+jadwal → captcha → ringkasan & kirim |

**Admin**
| Screen | Isi Content Area |
|---|---|
| Login | Card terpusat di atas `bg-brand-light`, tanpa sidebar |
| Dashboard | Stat card (Pesanan Menunggu, Diproses, Selesai bulan ini) + tabel pesanan terbaru |
| Kelola Pesanan | Filter (status, tanggal) + table (No. Order/Pelanggan/Layanan/Metode/Status/Total) → klik baris buka Detail Pesanan |
| Detail Pesanan | Dua kolom: info pesanan & item (kiri), peta rute Leaflet + tombol ubah status (kanan) |
| Kelola Layanan | Table (Nama, Kategori, Harga, Status Aktif, Aksi) + form tambah/edit |
| Kelola Galeri | Grid card before-after + form tambah (wajib upload 2 foto) |
| Kelola Testimoni | Table/list testimoni + form tambah/edit + toggle tampil |
| Kelola Konten | Form per section (Hero, Tentang Kami, Keunggulan, Promosi, Kontak) dengan preview singkat |
| Pengaturan | Form lokasi outlet (pin di peta Leaflet + alamat teks), kontak, jam operasional |

## 8. Component Library (Tailwind-based)
| Komponen | Kelas dasar | Variant |
|---|---|---|
| Stat card (admin) | `bg-white rounded-card border border-brand-200 p-4` | label kecil `text-brand-900/70`, angka besar `text-2xl font-semibold text-brand-900` |
| Speech-bubble card (testimoni) | `bg-white rounded-bubble border border-brand-200 p-5 relative` + ekor kecil via `::after` | varian dark: `bg-brand-900 text-[#F5FAFF]` untuk highlight testimoni pilihan |
| Sidebar nav item (admin) | `flex items-center gap-2 px-3 py-2 rounded-md text-sm` | default `text-[#F5FAFF]/80 hover:bg-brand-600/30`, aktif `bg-brand-600 text-white` |
| Table (admin) | `w-full text-sm` | header `bg-brand-100`, row `border-b border-brand-200 hover:bg-brand-light` |
| Status badge (pesanan) | `rounded-full px-2.5 py-1 text-xs font-medium` | `Menunggu` → `bg-accent-gold/20 text-brand-900`; `Diproses` → `bg-brand-200 text-brand-900`; `Selesai` → `bg-success/15 text-success`; `Ditolak/Dibatalkan` → `bg-danger/15 text-danger` |
| Button primary/secondary/danger | lihat §4 | + `disabled:opacity-50` |
| Input | `border border-brand-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-600` | error: `border-danger` + teks kecil `text-danger` di bawah |
| ImageUploader (Cloudinary) | `border-2 border-dashed border-brand-200 rounded-card p-6 text-center` saat kosong, preview thumbnail + tombol "Ganti Foto" saat sudah ada gambar | dipakai di Kelola Layanan, Kelola Galeri (2 slot: before & after), Kelola Testimoni, Kelola Konten; upload langsung ke Cloudinary, progress bar tipis `bg-brand-600` saat mengunggah |
| LocationPicker (Leaflet) | peta interaktif, klik untuk taruh pin, field alamat teks di bawahnya | dipakai di Form Pemesanan & Pengaturan |
| RouteMap (Leaflet) | peta read-only, garis rute outlet→pelanggan + estimasi jarak | dipakai di Detail Pesanan |
| Modal (hapus/konfirmasi) | `bg-white rounded-card shadow-lg p-6` di atas overlay `bg-brand-900/40` | |
| Toast | `bg-success text-white` / `bg-danger text-white`, `rounded-md px-4 py-2` | |
| Empty state | ikon garis + `text-brand-900/60 text-sm` + tombol primary | |

## 9. State per Screen Kunci
- **Kelola Pesanan — kosong:** ilustrasi gelembung + teks "Belum ada pesanan masuk".
- **Kelola Pesanan — loading:** skeleton `animate-pulse bg-brand-200/50` menggantikan baris table.
- **Form Pemesanan — captcha gagal:** pesan error jelas di bawah captcha, tombol submit tetap disabled sampai captcha lolos ulang.
- **Form Pemesanan — geocoding alamat gagal:** peta tetap tampil dengan pin default outlet + pesan "geser pin ke lokasimu", tidak blocking submit.
- **Galeri — upload kurang dari 2 foto:** pesan error inline, tombol simpan disabled.
- **Testimoni — search/filter tanpa hasil:** state di tengah grid, sama pola empty state.
- **Sesi admin expired:** banner kuning-emas (`bg-accent-gold/15 border-l-4 border-accent-gold`) di atas content area, form yang sedang diisi dipertahankan di local state.

## 10. Responsive Behaviour
- **Landing page — Desktop:** hero dua kolom (teks kiri, ilustrasi/foto kanan), grid galeri/layanan 3–4 kolom.
- **Landing page — Mobile:** hero satu kolom (teks di atas, gambar di bawah), grid galeri/layanan 1–2 kolom, navbar jadi hamburger drawer.
- **Admin — Desktop:** sidebar fixed terbuka penuh (`w-64`), table pesanan full kolom, detail pesanan dua kolom (info + peta).
- **Admin — Tablet:** sidebar collapse jadi icon-only (`w-16`), detail pesanan jadi satu kolom (peta di bawah info).
- **Admin — Mobile:** sidebar jadi drawer overlay, table pesanan jadi stacked list per baris.

## 11. Accessibility
- Kontras teks `#F5FAFF` di atas `#0A3D66` (sidebar/dark section) ≈ AA untuk teks normal.
- Kontras `brand-600` (`#2F6FED`) sebagai tombol dengan teks putih ≈ AA — dipakai untuk teks ≥14px medium/bold; hindari teks kecil/tipis di atas `brand-200` yang lebih terang (kontras kurang).
- Semua tombol & nav sidebar aksesibel keyboard (Tab order mengikuti urutan visual).
- Table admin pakai `<th scope="col">` yang benar, tombol aksi (edit/hapus/ubah status) punya `aria-label` deskriptif, bukan cuma ikon.
- Modal pakai focus-trap + `Esc` untuk close, `aria-modal="true"`.
- Peta Leaflet (LocationPicker) sediakan input alamat teks sebagai alternatif bagi user yang tidak bisa berinteraksi presisi dengan peta (mis. screen reader / mobile kecil).
- Tap target minimum 44×44px untuk item navbar mobile & sidebar admin di mode drawer.
