# Style Reference — Lave Streat
> soap bubbles on their way to your door

**Theme:** light

Warna diambil langsung dari materi promosi asli Lave Streat (gradasi biru langit → biru tua, gelembung putih, speech-bubble navy); tipografi & komponen adalah interpretasi untuk kebutuhan landing page + admin panel.

Lave Streat memakai bahasa visual "air bersih yang bergerak cepat": kanvas biru muda hangat, section gelap biru-navy untuk kontras dramatis, dan headline tebal-bulat (weight 600–800) yang terasa seperti poster promosi jalanan, bukan admin panel korporat. Palet didominasi keluarga biru (≈80% konten) dengan satu aksen emas cerah (`#FDB813`) yang dipakai sesempit mungkin — hanya untuk badge "Promo"/"Baru" dan sentuhan gelembung/sparkle dekoratif. Bentuk khas: sudut sangat membulat (pill button, card 16px, dan "speech-bubble" bersudut ekor) yang mengutip langsung motif balon percakapan pada materi promosi asli ("Males Keluar?", "Gaada Waktu Buat Ngantar?") — kepercayaan dibangun lewat bukti hasil (before-after) dan testimoni, bukan lewat kemewahan visual.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Ocean Navy | `#0A3D66` | `--color-ocean-navy` | Primary brand color — dark section landing page, sidebar admin, heading text, hover state tombol primer. Biru gelap yang jadi "jangkar" kontras di atas kanvas terang |
| Splash Blue | `#2F6FED` | `--color-splash-blue` | Primary action — semua CTA terisi (tombol "Pesan Sekarang", link aktif, ikon aktif sidebar) |
| Sky Wash | `#8ED1F0` | `--color-sky-wash` | Border, divider, secondary button, badge kategori layanan |
| Foam Blue | `#BEE7FA` | `--color-foam-blue` | Background card/surface alternatif, band highlight, hover state ringan |
| Cloud Canvas | `#EAF7FE` | `--color-cloud-canvas` | Kanvas halaman utama (page bg) — biru sangat muda, bukan putih polos, supaya tetap terasa "air bersih" |
| Bubble Gold | `#FDB813` | `--color-bubble-gold` | Aksen fungsional tunggal — badge "Promo"/"Baru", sparkle dekoratif, elemen kecil yang perlu "berteriak". Dipakai sesempit mungkin |
| Sand Warm | `#EFE7D8` | `--color-sand-warm` | Surface hangat alternatif (dari warna sepatu di foto promosi) — selang-seling section supaya tidak monoton biru |
| Snow Foam | `#F5FAFF` | `--color-snow-foam` | Teks & elemen di atas Ocean Navy / section gelap; hampir putih, tetap bertona biru dingin |
| Slate Wet | `#5B6B78` | `--color-slate-wet` | Teks sekunder, caption, helper text — satu tingkat de-emphasis di bawah Ink |
| Ink Deep | `#0B1F2E` | `--color-ink-deep` | Body text utama di atas section terang — biru-hitam, bukan hitam pekat, supaya tetap hangat |
| Success Rinse | `#1E9E6B` | `--color-success-rinse` | Konfirmasi, status "Selesai", toast sukses |
| Danger Stain | `#D8402C` | `--color-danger-stain` | Error, hapus, status "Ditolak/Dibatalkan" |

## Tokens — Typography

### Baloo 2 — Typeface display khusus headline landing page (hero, judul section, judul promo). Weight 600–800 di ukuran besar (32–48px) memberi kesan poster/komik yang tebal & ramah — mengutip gaya headline pada materi promosi asli, bukan tipografi admin-panel yang datar. · `--font-baloo`
- **Substitute:** Fredoka atau Baloo Bhaijaan 2
- **Weights:** 500, 600, 700, 800
- **Sizes:** 24px, 32px, 40px, 48px
- **Line height:** 1.05–1.2
- **Letter spacing:** -0.2px pada 40–48px, normal di bawahnya
- **Role:** Headline & judul section landing page saja — tidak dipakai untuk body, tabel, atau UI admin panel.

### Inter — Typeface utama untuk semua UI: body text, tombol, form, tabel admin, angka harga. Netral & sangat legible di ukuran kecil, kontras sengaja dengan Baloo 2 yang tebal-bulat di headline. · `--font-inter`
- **Substitute:** ui-sans-serif, system-ui
- **Weights:** 400, 500, 600
- **Sizes:** 12px, 14px, 16px, 18px, 20px, 24px
- **Line height:** 1.3–1.6
- **Letter spacing:** normal
- **Role:** Semua teks UI/body/tabel/angka, di landing page maupun admin panel.

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | Inter | 400 | 12px | 1.4 | 0px | `--text-caption` |
| body-sm | Inter | 400 | 14px | 1.5 | 0px | `--text-body-sm` |
| body | Inter | 400 | 16px | 1.5 | 0px | `--text-body` |
| body-lg | Inter | 500 | 18px | 1.4 | 0px | `--text-body-lg` |
| subheading | Inter | 600 | 20px | 1.3 | 0px | `--text-subheading` |
| heading-sm | Baloo 2 | 600 | 24px | 1.2 | 0px | `--text-heading-sm` |
| heading | Baloo 2 | 700 | 32px | 1.15 | 0px | `--text-heading` |
| heading-lg | Baloo 2 | 700 | 40px | 1.1 | -0.2px | `--text-heading-lg` |
| display | Baloo 2 | 800 | 48px | 1.05 | -0.2px | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 8px

**Density:** comfortable (landing page), compact (admin table)

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 48 | 48px | `--spacing-48` |
| 64 | 64px | `--spacing-64` |
| 96 | 96px | `--spacing-96` |

### Border Radius

| Element | Value |
|---------|-------|
| inputs | 8px |
| cards | 16px |
| speech-bubble callout | 24px (+ ekor kecil via pseudo-element) |
| buttons / badges / pills | 9999px |

### Layout

- **Page max-width:** 1200px (landing page)
- **Section gap:** 64px (landing page)
- **Card padding:** 16px
- **Element gap:** 8px
- **Admin sidebar width:** 256px (full), 64px (collapsed)

## Components

### Primary CTA Button
**Role:** Aksi utama — "Pesan Sekarang", "Simpan", "Konfirmasi Pesanan"

Pill (radius 9999px), background Splash Blue (`#2F6FED`), teks Snow Foam (`#F5FAFF`), Inter 16px/600. Padding 12px vertikal × 24px horizontal. Hover → background Ocean Navy. Tidak pakai shadow tebal, cukup `shadow-sm` tipis.

### Secondary Outline Button
**Role:** Aksi kedua di atas kanvas terang

Background transparan, border 1.5px Sky Wash, teks Ocean Navy, radius 9999px, padding sama dengan primary. Hover → background Foam Blue.

### Speech-Bubble Callout
**Role:** Testimoni & highlight kutipan — elemen paling khas brand, mengutip langsung motif balon percakapan di materi promosi asli

Background putih (atau Ocean Navy untuk varian gelap/highlight), radius 24px dengan "ekor" segitiga kecil di salah satu sudut, border 1px Sky Wash (varian terang) atau tanpa border (varian gelap), padding 20px. Isi: kutipan testimoni + nama pelanggan kecil di bawah.

### Promo Badge
**Role:** Penanda "Promo" / "Baru" pada card layanan atau banner

Pill (radius 9999px), background Bubble Gold (`#FDB813`), teks Ocean Navy, Inter 12px/600, padding 4px vertikal × 10px horizontal. Satu-satunya komponen yang boleh memakai warna aksen emas sebagai background solid.

### Service / Gallery Card
**Role:** Menampilkan layanan atau pasangan foto before-after

Background putih, radius 16px, border 1px Sky Wash, tanpa shadow berat (`shadow-sm` saja). Untuk galeri: dua foto (before/after) bersisian dengan label kecil "Sebelum"/"Sesudah", caption di bawah.

### Status Badge (Admin)
**Role:** Menunjukkan status pesanan di tabel & detail admin

Pill kecil, radius 9999px, padding 4px/10px, Inter 12px/500. Warna mengikuti status: Menunggu → Bubble Gold 20% + teks Ocean Navy; Diproses → Sky Wash + teks Ocean Navy; Selesai → Success Rinse 15% + teks Success Rinse; Ditolak/Dibatalkan → Danger Stain 15% + teks Danger Stain.

### Admin Sidebar
**Role:** Navigasi utama admin panel

Full-height, background Ocean Navy, teks Snow Foam. Item nav default `text-snow-foam/80`, aktif → background Splash Blue + teks putih penuh, radius 8px pada item aktif.

### Map Panel (Leaflet)
**Role:** LocationPicker (form pemesanan/pengaturan) & RouteMap (detail pesanan admin)

Container radius 16px, border 1px Sky Wash, tinggi minimum 320px. Marker outlet pakai warna Ocean Navy, marker tujuan pelanggan pakai Splash Blue, garis rute Splash Blue solid 4px.

### Input Field
**Role:** Form pemesanan & form admin

Background putih, border 1.5px Sky Wash, radius 8px, padding 10px/14px, Inter 14–16px. Focus → ring 2px Splash Blue. Error → border Danger Stain + teks kecil Danger Stain di bawah field.

## Do's and Don'ts

### Do
- Gunakan Splash Blue (`#2F6FED`) hanya untuk aksi utama (CTA, link aktif) — jangan pakai untuk background besar yang bukan tombol.
- Pakai radius penuh (9999px) untuk semua tombol, badge, dan pill — bentuk sangat bulat adalah signature visual brand ini.
- Batasi Bubble Gold (`#FDB813`) hanya untuk badge kecil dan aksen dekoratif — jangan jadi warna background section.
- Pakai Baloo 2 hanya untuk headline/judul section (≥24px) — body text, tabel, dan angka tetap Inter supaya tetap terbaca rapi di admin panel.
- Selingi kanvas biru dengan Sand Warm (`#EFE7D8`) di 1–2 section (mis. Tentang Kami/testimoni) supaya halaman tidak monoton biru dari atas ke bawah.
- Manfaatkan bentuk speech-bubble untuk testimoni — ini elemen yang secara langsung mengutip identitas visual materi promosi asli.

### Don't
- Jangan gunakan pure white (`#ffffff`) untuk kanvas utama — selalu pakai Cloud Canvas (`#EAF7FE`) supaya tetap terasa "air", bukan putih polos ala dokumen.
- Jangan pakai sudut tajam (radius 0–4px) pada tombol atau badge — bertentangan dengan bentuk bulat yang jadi ciri khas.
- Jangan pakai warna saturasi tinggi di luar keluarga biru + satu aksen emas (mis. merah/ungu/hijau terang) kecuali warna sistem (`danger`, `success`) yang sudah ditentukan.
- Jangan pakai Baloo 2 untuk teks panjang (paragraf, deskripsi layanan) — hanya untuk judul pendek.
- Jangan tambahkan gradient rumit di banyak tempat — cukup satu gradient halus di hero landing page, sisanya flat color sesuai token.
- Jangan pakai shadow tebal/berlapis pada card — cukup `shadow-sm` tipis, supaya tetap terasa ringan seperti gelembung, bukan berat seperti admin-panel korporat.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Page Canvas | `#EAF7FE` | Background utama landing page & content area admin panel |
| 1 | Card Surface | `#FFFFFF` | Card layanan, galeri, stat card, form — kontras jelas di atas Cloud Canvas |
| 1-alt | Warm Surface | `#EFE7D8` | Section alternatif (Tentang Kami, testimoni) untuk variasi ritme |
| 2 | Dark Section | `#0A3D66` | Footer, CTA band, sidebar admin — flip kontras penuh |
| 3 | Accent Highlight | `#FDB813` | Badge Promo/Baru, sparkle dekoratif |

## Elevation

Elevation dijaga sangat ringan — landing page memakai analogi "gelembung", bukan "kertas bertumpuk". Hierarki visual dicapai lewat kontras warna (Ocean Navy vs Cloud Canvas), bentuk (radius penuh vs radius 16px), dan bobot tipografi (Baloo 2 tebal vs Inter reguler) — shadow hanya `shadow-sm` tipis pada card, tidak ada shadow berlapis atau efek melayang dramatis.

## Imagery

Foto produk: sepatu (before-after cuci/repaint) difoto dengan pencahayaan terang & latar netral, fokus pada detail hasil (sol, warna, kebersihan) — gaya "bukti hasil", bukan gaya lifestyle/editorial. Ilustrasi pendukung: gelembung sabun (lingkaran transparan berbagai ukuran) dipakai sebagai elemen dekoratif di hero & section gelap, mengutip langsung materi promosi asli. Ikon: line icon sederhana monokrom (Ocean Navy di atas terang, Snow Foam di atas gelap), tidak pakai ikon 3D/gradient. Tidak ada foto stok generik orang tersenyum memegang sepatu — utamakan foto asli hasil kerja Lave Streat.

## Layout

Landing page: max-width 1200px, margin horizontal 24px, section bergantian antara Cloud Canvas dan Sand Warm/Ocean Navy untuk ritme visual, gap antar-section 64px. Hero: dua kolom di desktop (teks kiri ~45%, ilustrasi/foto kanan ~55%), satu kolom di mobile (teks di atas). Grid galeri/layanan: 3–4 kolom desktop, 1–2 kolom mobile, gap 16px. Admin panel: sidebar tetap 256px + content area fluid, table/form dalam card putih dengan padding 16–24px, density lebih padat (compact) dibanding landing page.

## Agent Prompt Guide

### Quick Color Reference
- Primary action: `#2F6FED` (Splash Blue)
- Dark/heading/sidebar: `#0A3D66` (Ocean Navy)
- Page canvas: `#EAF7FE` (Cloud Canvas)
- Card surface: `#FFFFFF`
- Accent kecil (badge/sparkle): `#FDB813` (Bubble Gold)
- Warm alt surface: `#EFE7D8` (Sand Warm)

### Example Component Prompts

1. **Primary CTA Button**: Buat tombol pill radius 9999px, background `#2F6FED`, teks `#F5FAFF`, Inter 16px/600, padding 12px vertikal × 24px horizontal, hover ke `#0A3D66`, shadow tipis saja. Dipakai untuk semua CTA utama ("Pesan Sekarang", "Simpan").

2. **Hero Headline**: Set headline display 48px Baloo 2 weight 800, warna `#0A3D66`, line-height 1.05, letter-spacing -0.2px. Body pendamping 16–18px Inter 400 warna `#0B1F2E`, line-height 1.5. Kontras berat font (Baloo 2 tebal vs Inter reguler) adalah signature-nya.

3. **Speech-Bubble Testimoni**: Buat card radius 24px dengan ekor segitiga kecil di sudut kiri bawah, background putih, border 1px `#8ED1F0`, padding 20px, isi kutipan testimoni Inter 16px + nama pelanggan Inter 14px/600 warna `#0A3D66` di bawahnya.

4. **Promo Badge**: Buat badge pill radius 9999px, background `#FDB813`, teks `#0A3D66` Inter 12px/600, padding 4px vertikal × 10px horizontal. Taruh di pojok kiri-atas card layanan yang sedang promo.

5. **Admin Status Badge**: Buat pill kecil radius 9999px padding 4px/10px Inter 12px/500. Status "Selesai" → background `#1E9E6B` opacity 15%, teks `#1E9E6B`. Status "Menunggu" → background `#FDB813` opacity 20%, teks `#0A3D66`.

## Color Philosophy

Palet dibangun dari satu warna dasar (Ocean Navy `#0A3D66`) yang didukung satu keluarga biru bertingkat (Splash Blue, Sky Wash, Foam Blue, Cloud Canvas) dan satu aksen vivid (Bubble Gold). Kedalaman biru gelap memberi bobot & kepercayaan (mirip bagaimana jasa berbasis rumah tangga butuh kesan "aman/terpercaya"), sementara gradasi biru muda di atasnya menjaga kesan ringan & bersih — sesuai materi promosi asli yang penuh gelembung dan langit biru. Bubble Gold sengaja dibatasi ketat (dipakai < 5% dari total area visual) supaya tetap terasa istimewa setiap kali muncul — persis seperti "gelembung yang berkilau" di tengah air biru.

## Typography Philosophy

Baloo 2 di weight 600–800 untuk headline menciptakan efek "poster promosi digital" — tebal, bulat, ramah, mengutip langsung gaya font pada flyer asli Lave Streat, bukan tipografi SaaS yang tipis-elegan. Inter di weight 400–600 untuk semua body/UI menjaga keterbacaan tinggi di tabel admin dan form — kontras berat (Baloo 2 tebal vs Inter reguler) menciptakan sistem dua-suara: poster jalanan yang hangat (headline) bertemu dashboard yang presisi (UI/body).

## Similar Brands

- **Gojek** — Kesamaan pada palet cerah tunggal + tipografi bulat-tebal yang terasa ramah & lokal, bukan korporat kaku.
- **Lemonilo** — Kesamaan pada penggunaan satu warna dasar kuat + aksen tunggal yang dibatasi ketat, dengan nuansa hangat/personal khas brand lokal Indonesia.
- **Fetch (pet care apps)** — Kesamaan pada bentuk sangat bulat (pill button, speech-bubble) untuk kesan ramah & approachable pada layanan berbasis rumah/personal.
- **Dropbox (era ilustrasi flat)** — Kesamaan pada satu warna primer solid dengan ilustrasi gelembung/bentuk organik sebagai elemen dekoratif dominan.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-ocean-navy: #0A3D66;
  --color-splash-blue: #2F6FED;
  --color-sky-wash: #8ED1F0;
  --color-foam-blue: #BEE7FA;
  --color-cloud-canvas: #EAF7FE;
  --color-bubble-gold: #FDB813;
  --color-sand-warm: #EFE7D8;
  --color-snow-foam: #F5FAFF;
  --color-slate-wet: #5B6B78;
  --color-ink-deep: #0B1F2E;
  --color-success-rinse: #1E9E6B;
  --color-danger-stain: #D8402C;

  /* Typography — Font Families */
  --font-baloo: 'Baloo 2', ui-rounded, sans-serif;
  --font-inter: 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* Typography — Scale */
  --text-caption: 12px;
  --text-body-sm: 14px;
  --text-body: 16px;
  --text-body-lg: 18px;
  --text-subheading: 20px;
  --text-heading-sm: 24px;
  --text-heading: 32px;
  --text-heading-lg: 40px;
  --text-display: 48px;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-48: 48px;
  --spacing-64: 64px;
  --spacing-96: 96px;

  /* Border Radius */
  --radius-inputs: 8px;
  --radius-cards: 16px;
  --radius-bubble: 24px;
  --radius-full: 9999px;

  /* Surfaces */
  --surface-page-canvas: #EAF7FE;
  --surface-card: #FFFFFF;
  --surface-warm-alt: #EFE7D8;
  --surface-dark-section: #0A3D66;
  --surface-accent-highlight: #FDB813;
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --color-ocean-navy: #0A3D66;
  --color-splash-blue: #2F6FED;
  --color-sky-wash: #8ED1F0;
  --color-foam-blue: #BEE7FA;
  --color-cloud-canvas: #EAF7FE;
  --color-bubble-gold: #FDB813;
  --color-sand-warm: #EFE7D8;
  --color-snow-foam: #F5FAFF;
  --color-slate-wet: #5B6B78;
  --color-ink-deep: #0B1F2E;
  --color-success-rinse: #1E9E6B;
  --color-danger-stain: #D8402C;

  /* Typography */
  --font-baloo: 'Baloo 2', ui-rounded, sans-serif;
  --font-inter: 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* Typography — Scale */
  --text-caption: 12px;
  --text-body-sm: 14px;
  --text-body: 16px;
  --text-body-lg: 18px;
  --text-subheading: 20px;
  --text-heading-sm: 24px;
  --text-heading: 32px;
  --text-heading-lg: 40px;
  --text-display: 48px;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-48: 48px;
  --spacing-64: 64px;
  --spacing-96: 96px;

  /* Border Radius */
  --radius-inputs: 8px;
  --radius-cards: 16px;
  --radius-bubble: 24px;
  --radius-full: 9999px;
}
```
