import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { contentApi } from '../../lib/api';

export function ContentManagePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [homeContent, setHomeContent] = useState({
    hero_title: '',
    hero_subtitle: '',
    promo: {
      aktif: true,
      judul: '',
      deskripsi: '',
      gambar: '',
      periode: ''
    }
  });

  const [aboutContent, setAboutContent] = useState({
    sejarah: '',
    visi: '',
    misi: ['', '', '']
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [home, about] = await Promise.all([
          contentApi.getHomeContent(),
          contentApi.getAboutContent()
        ]);
        if (home) setHomeContent(home);
        if (about) setAboutContent(about);
      } catch {
        showToast('Gagal memuat data konten', 'danger');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveHome = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await contentApi.updateHomeContent(homeContent);
      showToast('Konten Beranda dan Promosi berhasil disimpan.');
    } catch {
      showToast('Gagal menyimpan konten beranda', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await contentApi.updateAboutContent(aboutContent);
      showToast('Konten Tentang Kami berhasil disimpan.');
    } catch {
      showToast('Gagal menyimpan konten tentang kami', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleMisiChange = (index, value) => {
    const nextMisi = [...(aboutContent.misi || [])];
    nextMisi[index] = value;
    setAboutContent({ ...aboutContent, misi: nextMisi });
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-brand-900 tracking-tight">
            Kelola Konten
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ubah teks hero, promosi, dan profil Tentang Kami tanpa perlu deploy ulang kode aplikasi.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'home'
              ? 'bg-brand-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-brand-900'
          }`}
        >
          Konten Beranda & Promo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'about'
              ? 'bg-brand-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-brand-900'
          }`}
        >
          Halaman Tentang Kami
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-wet text-sm">Memuat form konten...</div>
      ) : activeTab === 'home' ? (
        <form onSubmit={handleSaveHome} className="flex flex-col gap-6 w-full">
          <Card className="flex flex-col gap-4">
            <h3 className="font-display font-bold text-lg text-brand-900 border-b border-brand-200 pb-2">
              Bagian Hero Utama (Beranda)
            </h3>

            <Input
              label="Judul Utama (H1 Hero)"
              value={homeContent.hero_title}
              onChange={(e) => setHomeContent({ ...homeContent, hero_title: e.target.value })}
              placeholder="Contoh: Sepatu Bersih Segar, Siap Dijemput Kapan Saja"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-brand-900">
                Deskripsi Sub-Headline
              </label>
              <textarea
                rows={3}
                value={homeContent.hero_subtitle}
                onChange={(e) => setHomeContent({ ...homeContent, hero_subtitle: e.target.value })}
                placeholder="Penjelasan ringkas layanan penjemputan..."
                required
                className="w-full rounded-lg border border-brand-200 bg-white p-3.5 text-sm text-ink-deep placeholder:text-slate-wet/60 focus:border-brand-600 focus:outline-hidden"
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="md" disabled={saving} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan Konten...' : 'Simpan Perubahan Beranda'}</span>
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveAbout} className="flex flex-col gap-6 w-full">
          <Card className="flex flex-col gap-4">
            <h3 className="font-display font-bold text-lg text-brand-900 border-b border-brand-200 pb-2">
              Sejarah & Latar Belakang
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-brand-900">
                Cerita Berdirinya Lave Streat
              </label>
              <textarea
                rows={5}
                value={aboutContent.sejarah || ''}
                onChange={(e) => setAboutContent({ ...aboutContent, sejarah: e.target.value })}
                placeholder="Kisah awal mula berdirinya Lave Streat..."
                className="w-full rounded-lg border border-brand-200 bg-white p-3.5 text-sm text-ink-deep placeholder:text-slate-wet/60 focus:border-brand-600 focus:outline-hidden"
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <h3 className="font-display font-bold text-lg text-brand-900 border-b border-brand-200 pb-2">
              Visi & Misi Usaha
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-brand-900">
                Visi
              </label>
              <textarea
                rows={2}
                value={aboutContent.visi || ''}
                onChange={(e) => setAboutContent({ ...aboutContent, visi: e.target.value })}
                placeholder="Visi Lave Streat..."
                className="w-full rounded-lg border border-brand-200 bg-white p-3.5 text-sm text-ink-deep placeholder:text-slate-wet/60 focus:border-brand-600 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className="text-sm font-semibold text-brand-900">
                Poin Misi
              </label>
              {[0, 1, 2].map((idx) => (
                <Input
                  key={idx}
                  label={`Misi ${idx + 1}`}
                  value={(aboutContent.misi && aboutContent.misi[idx]) || ''}
                  onChange={(e) => handleMisiChange(idx, e.target.value)}
                  placeholder={`Poin misi ke-${idx + 1}...`}
                />
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="md" disabled={saving} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan Konten...' : 'Simpan Perubahan Tentang Kami'}</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
