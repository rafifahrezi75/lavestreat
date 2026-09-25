import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Layers } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';
import { servicesApi } from '../../lib/api';

export function ServicesManagePage() {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  const loadServices = async () => {
    try {
      const list = await servicesApi.getServices(false);
      setServices(list);
    } catch {
      showToast('Gagal memuat daftar layanan', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleToggleActive = async (service) => {
    try {
      const nextState = !service.aktif;
      await servicesApi.toggleActive(service.id, nextState);
      showToast(`Layanan ${service.nama} berhasil ${nextState ? 'diaktifkan' : 'dinonaktifkan'}.`);
      loadServices();
    } catch {
      showToast('Gagal mengubah status layanan', 'danger');
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const totalPages = Math.ceil(services.length / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedServices = services.slice((validCurrentPage - 1) * pageSize, validCurrentPage * pageSize);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-wet">
          Daftar harga dan master layanan. Layanan yang pernah digunakan di pesanan dinonaktifkan secara aman.
        </p>

        <Link to="/admin/services/new">
          <Button size="sm" className="flex items-center gap-1.5 shrink-0">
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Layanan Baru</span>
          </Button>
        </Link>
      </div>

      <Card noPadding rounded={false} className="w-full border-brand-200 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-100/60 border-b border-brand-200 text-brand-900 font-semibold">
              <tr>
                <th scope="col" className="px-4 py-3">Foto</th>
                <th scope="col" className="px-4 py-3">Nama Layanan / Produk</th>
                <th scope="col" className="px-4 py-3">Kategori</th>
                <th scope="col" className="px-4 py-3">Harga</th>
                <th scope="col" className="px-4 py-3">Satuan</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-200/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-wet text-xs">
                    Memuat layanan...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-wet text-xs">
                    Belum ada layanan yang tersimpan.
                  </td>
                </tr>
              ) : (
                paginatedServices.map((service) => (
                  <tr key={service.id} className="hover:bg-brand-100/25 transition-colors">
                    <td className="px-4 py-3">
                      {service.foto ? (
                        <img
                          src={service.foto}
                          alt={service.nama}
                          className="w-12 h-12 rounded-lg object-cover bg-brand-100 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                          <Layers className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-900">
                      <div className="text-sm font-bold text-brand-900">{service.nama}</div>
                      <div className="text-xs font-normal text-slate-wet line-clamp-1 max-w-sm mt-0.5">
                        {service.deskripsi}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize font-medium text-slate-wet text-xs whitespace-nowrap">
                      {service.kategori}
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-900 text-sm whitespace-nowrap">
                      {formatPrice(service.harga)}
                    </td>
                    <td className="px-4 py-3 text-slate-wet text-xs whitespace-nowrap">
                      {service.satuan}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {service.aktif ? (
                        <Badge variant="success" size="sm">Aktif</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Nonaktif</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(service)}
                          className="text-xs font-medium px-2.5 py-1 rounded-md border border-brand-200 hover:bg-brand-100 transition-colors text-brand-900"
                        >
                          {service.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>

                        <Link
                          to={`/admin/services/${service.id}/edit`}
                          className="p-1.5 rounded-md bg-brand-100 text-brand-900 hover:bg-brand-600 hover:text-white transition-colors inline-flex items-center justify-center"
                          aria-label={`Edit ${service.nama}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={validCurrentPage}
          totalItems={services.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}
