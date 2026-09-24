import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Pencil, Star } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { testimonialsApi } from '../../lib/api';

export function TestimonialsManagePage() {
  const { showToast } = useToast();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTestimonials = async () => {
    try {
      const list = await testimonialsApi.getTestimonials(false);
      setTestimonials(list);
    } catch {
      showToast('Gagal memuat testimoni', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus testimoni ini?')) return;
    try {
      await testimonialsApi.deleteTestimonial(id);
      showToast('Testimoni berhasil dihapus.');
      loadTestimonials();
    } catch {
      showToast('Gagal menghapus testimoni', 'danger');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-wet">
          Testimoni pelanggan diinput manual dari percakapan WhatsApp atau media sosial.
        </p>

        <Link to="/admin/testimonials/new">
          <Button size="sm" className="flex items-center gap-1.5 shrink-0">
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Testimoni</span>
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden w-full border-brand-200">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-100/60 border-b border-brand-200 text-brand-900 font-semibold">
              <tr>
                <th scope="col" className="px-4 py-3">Nama Pelanggan</th>
                <th scope="col" className="px-4 py-3">Isi Testimoni</th>
                <th scope="col" className="px-4 py-3">Rating</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-200/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-wet text-xs">
                    Memuat data testimoni...
                  </td>
                </tr>
              ) : testimonials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-wet text-xs">
                    Belum ada testimoni tersimpan.
                  </td>
                </tr>
              ) : (
                testimonials.map((testi) => (
                  <tr key={testi.id} className="hover:bg-brand-100/25 transition-colors">
                    <td className="px-4 py-3 font-bold text-brand-900 whitespace-nowrap">
                      {testi.nama_pelanggan}
                    </td>
                    <td className="px-4 py-3 max-w-md text-ink-deep text-xs leading-relaxed">
                      <p className="line-clamp-2">"{testi.isi}"</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (testi.rating || 5)
                                ? 'fill-accent-gold text-accent-gold'
                                : 'text-slate-wet/30'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {testi.tampil ? (
                        <Badge variant="success" size="sm">Ditampilkan</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Disembunyikan</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/admin/testimonials/${testi.id}/edit`}
                          className="p-1.5 rounded-md bg-brand-100 text-brand-900 hover:bg-brand-600 hover:text-white transition-colors inline-flex items-center justify-center"
                          aria-label="Edit testimoni"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(testi.id)}
                          className="p-1.5 rounded-md bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
                          aria-label="Hapus testimoni"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
