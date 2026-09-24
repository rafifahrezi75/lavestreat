import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { BeforeAfterCompare } from '../../features/gallery/BeforeAfterCompare';
import { useToast } from '../../context/ToastContext';
import { galleryApi } from '../../lib/api';

export function GalleryManagePage() {
  const { showToast } = useToast();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadGallery = async () => {
    try {
      const list = await galleryApi.getGallery(false);
      setGallery(list);
    } catch {
      showToast('Gagal memuat foto galeri', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus foto galeri ini?')) return;
    try {
      await galleryApi.deleteGalleryItem(id);
      showToast('Foto galeri berhasil dihapus.');
      loadGallery();
    } catch {
      showToast('Gagal menghapus foto galeri', 'danger');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-wet">
          Setiap entri galeri wajib memiliki pasangan foto sebelum dan sesudah treatment.
        </p>

        <Link to="/admin/gallery/new">
          <Button size="sm" className="flex items-center gap-1.5 shrink-0">
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Before-After</span>
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-wet text-xs">Memuat galeri...</div>
      ) : gallery.length === 0 ? (
        <Card className="text-center py-12 text-slate-wet border-brand-200 text-xs">
          Belum ada foto galeri tersimpan. Klik tombol di atas untuk menambahkan.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {gallery.map((item) => (
            <div key={item.id} className="flex flex-col gap-2">
              <BeforeAfterCompare
                beforeUrl={item.before_url}
                afterUrl={item.after_url}
                caption={item.caption}
                serviceTag={item.layanan_terkait}
              />
              <div className="flex items-center justify-between px-1 pt-1">
                <div>
                  {item.tampil_di_home ? (
                    <Badge variant="success" size="sm">Tampil di Beranda</Badge>
                  ) : (
                    <Badge variant="default" size="sm">Disembunyikan</Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/admin/gallery/${item.id}/edit`}
                    className="p-1.5 rounded-md bg-brand-100 text-brand-900 hover:bg-brand-600 hover:text-white transition-colors inline-flex items-center justify-center"
                    aria-label="Edit foto galeri"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-md bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
                    aria-label="Hapus foto galeri"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
