import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ordersApi } from '../../lib/api';

export function OrdersManagePage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.pelanggan?.nama?.toLowerCase().includes(search.toLowerCase()) ||
      order.pelanggan?.telepon?.includes(search);

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
    <div className="flex flex-col gap-4 w-full">

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-brand-900 border border-brand-200 hover:bg-brand-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. tiket, nama, telepon..."
            className="w-full pl-9 pr-3 py-1.5 bg-white rounded-md border border-brand-200 text-xs text-ink-deep placeholder:text-slate-wet/60 focus:outline-hidden focus:border-brand-600"
          />
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-wet" />
        </div>
      </div>

      <Card className="p-0 overflow-hidden w-full border-brand-200">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-100/60 border-b border-brand-200 text-brand-900 font-semibold">
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
            <tbody className="divide-y divide-brand-200/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-wet text-xs">
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
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-100/25 transition-colors">
                    <td className="px-4 py-3 font-bold text-brand-900 whitespace-nowrap">
                      {order.id}
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
      </Card>
    </div>
  );
}
