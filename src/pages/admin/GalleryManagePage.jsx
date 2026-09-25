import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Pencil, Receipt, User, ExternalLink } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Pagination } from '../../components/common/Pagination';
import { BeforeAfterCompare } from '../../features/gallery/BeforeAfterCompare';
import { useToast } from '../../context/ToastContext';
import { galleryApi } from '../../lib/api';

export function GalleryManagePage() {
  const { showToast } = useToast();
  const [gallery, setGallery] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 9;

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

  const sampleCustomers = [
    'Dimas Pratama',
    'Siti Rahmawati',
    'Rian Hidayat',
    'Ahmad Fauzi',
    'Kevin Sanjaya',
    'Dewi Lestari',
    'Budi Santoso',
    'Indah Permata'
  ];

  const totalPages = Math.ceil(gallery.length / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedGallery = gallery.slice((validCurrentPage - 1) * pageSize, validCurrentPage * pageSize);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-wet">
          Setiap entri galeri wajib memiliki pasangan foto sebelum dan sesudah treatment beserta referensi pesanan/invoice.
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
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            {paginatedGallery.map((item, index) => {
              const globalIndex = (validCurrentPage - 1) * pageSize + index;
              const invoiceNum = item.invoice || item.order_id || `INV-2607-${String(globalIndex + 1).padStart(3, '0')}`;
              const custName = item.customer_name || item.pelanggan?.nama || sampleCustomers[globalIndex % sampleCustomers.length];

              return (
                <BeforeAfterCompare
                  key={item.id}
                  beforeUrl={item.before_url}
                  afterUrl={item.after_url}
                  caption={item.caption}
                  serviceTag={item.layanan_terkait}
                  header={
                    <div className="flex items-center justify-between gap-2 text-xs border-b border-brand-200/60 pb-2 mb-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-brand-900">
                        <Receipt className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        {item.order_id ? (
                          <Link
                            to={`/admin/orders/${item.order_id}`}
                            className="hover:text-brand-600 hover:underline flex items-center gap-1"
                            title="Buka detail pesanan"
                          >
                            <span>{invoiceNum}</span>
                            <ExternalLink className="w-3 h-3 text-brand-600" />
                          </Link>
                        ) : (
                          <span>{invoiceNum}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-wet">
                        <User className="w-3.5 h-3.5 text-slate-wet/80 shrink-0" />
                        <span className="font-medium truncate max-w-[130px]">{custName}</span>
                      </div>
                    </div>
                  }
                  footer={
                    <div className="flex items-center justify-between pt-2.5 mt-0.5 border-t border-brand-200/60">
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
                          className="p-1.5 rounded-md bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors inline-flex items-center justify-center"
                          aria-label="Hapus foto galeri"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>

          <Card noPadding rounded={false} className="w-full border-brand-200 overflow-hidden shadow-subtle">
            <Pagination
              currentPage={validCurrentPage}
              totalItems={gallery.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
