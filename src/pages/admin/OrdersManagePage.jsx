import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { ordersApi } from '../../lib/api';

export function OrdersManagePage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  useEffect(() => {
    async function loadOrders() {
      try {
        const list = await ordersApi.getOrders();
        setOrders(list);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filterTabs = [
    { id: 'ALL', label: 'Semua' },
    { id: 'Menunggu Konfirmasi', label: 'Menunggu' },
    { id: 'PROCESS', label: 'Diproses' },
    { id: 'Selesai', label: 'Selesai' },
    { id: 'CANCELLED', label: 'Batal/Tolak' }
  ];

  const handleTabChange = (tabId) => {
    setStatusFilter(tabId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.id && order.id.toLowerCase().includes(search.toLowerCase())) ||
      (order.invoice_number && order.invoice_number.toLowerCase().includes(search.toLowerCase())) ||
      (order.invoice && order.invoice.toLowerCase().includes(search.toLowerCase())) ||
      (order.pelanggan?.nama && order.pelanggan.nama.toLowerCase().includes(search.toLowerCase())) ||
      (order.pelanggan?.telepon && order.pelanggan.telepon.includes(search));

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'Menunggu Konfirmasi') return order.status === 'Menunggu Konfirmasi';
    if (statusFilter === 'Selesai') return order.status === 'Selesai';
    if (statusFilter === 'CANCELLED') return order.status === 'Ditolak' || order.status === 'Dibatalkan';
    if (statusFilter === 'PROCESS') {
      return (
        order.status === 'Dikonfirmasi' ||
        order.status === 'Sedang Dijemput' ||
        order.status === 'Diproses' ||
        order.status === 'Siap Diantar' ||
        order.status === 'Siap Diambil' ||
        order.status === 'Dikirim'
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((validCurrentPage - 1) * pageSize, validCurrentPage * pageSize);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    if (status === 'Menunggu Konfirmasi') return <Badge variant="waiting">{status}</Badge>;
    if (status === 'Selesai') return <Badge variant="success">{status}</Badge>;
    if (status === 'Ditolak' || status === 'Dibatalkan') return <Badge variant="danger">{status}</Badge>;
    return <Badge variant="process">{status}</Badge>;
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-brand-900 tracking-tight">
            Kelola Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pantau status pengerjaan, verifikasi tiket, dan atur jadwal antar-jemput.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-brand-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-brand-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari no. tiket, nama, telepon..."
            className="w-full pl-9 pr-3.5 py-2 bg-white rounded-md border border-slate-200/90 text-xs text-brand-900 placeholder:text-slate-400 focus:outline-hidden focus:border-brand-600 shadow-xs"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <Card noPadding rounded="2xl" className="w-full border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-700 font-semibold">
              <tr>
                <th scope="col" className="px-4 py-3">No. Tiket</th>
                <th scope="col" className="px-4 py-3">Pelanggan</th>
                <th scope="col" className="px-4 py-3">Item Pesanan</th>
                <th scope="col" className="px-4 py-3">Metode</th>
                <th scope="col" className="px-4 py-3">Total Biaya</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Memuat pesanan...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-wet text-xs">
                    Tidak ada pesanan yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-100/25 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-brand-900 text-xs sm:text-sm">
                        {order.invoice_number || order.invoice || order.id}
                      </div>
                      {order.id && order.id !== order.invoice_number && (
                        <div className="text-[10px] text-slate-wet font-mono truncate max-w-[130px]" title={order.id}>
                          {order.id}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-brand-900 text-xs sm:text-sm">{order.pelanggan?.nama}</div>
                      <div className="text-xs text-slate-wet">{order.pelanggan?.telepon}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-xs truncate">
                        {order.items?.map(i => `${i.qty}x ${i.nama_snapshot}`).join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-wet text-xs whitespace-nowrap">
                      {order.metode?.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-900 text-xs sm:text-sm whitespace-nowrap">
                      {formatPrice(order.total_harga)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-brand-100 text-brand-900 hover:bg-brand-600 hover:text-white transition-colors text-xs font-semibold"
                      >
                        Rute & Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={validCurrentPage}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}
