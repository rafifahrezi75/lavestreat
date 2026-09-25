import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Wrench, 
  CheckCircle2, 
  DollarSign,
  TrendingUp,
  ArrowRight,
  Package,
  Bike
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ordersApi, servicesApi } from '../../lib/api';

export function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [ordersList, servicesList] = await Promise.all([
          ordersApi.getOrders(),
          servicesApi.getServices(false)
        ]);
        setOrders(ordersList);
        setServices(servicesList);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const waitingOrders = orders.filter((o) => o.status === 'Menunggu Konfirmasi');
  const processingOrders = orders.filter((o) => 
    ['Dikonfirmasi', 'Sedang Dijemput', 'Diproses', 'Siap Diantar', 'Siap Diambil', 'Dikirim'].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === 'Selesai');
  const totalRevenue = orders
    .filter((o) => o.status !== 'Ditolak' && o.status !== 'Dibatalkan')
    .reduce((acc, curr) => acc + (Number(curr.total_harga) || 0), 0);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const pickupOrdersCount = orders.filter((o) => o.metode === 'dijemput' || o.metode === 'dikirim').length;
  const dropoffOrdersCount = orders.filter((o) => o.metode === 'antar_sendiri' || o.metode === 'ambil').length;

  const weeklyData = [
    { day: 'Sen', orders: 3, revenue: 110000 },
    { day: 'Sel', orders: 5, revenue: 175000 },
    { day: 'Rab', orders: 4, revenue: 140000 },
    { day: 'Kam', orders: 7, revenue: 265000 },
    { day: 'Jum', orders: 6, revenue: 215000 },
    { day: 'Sab', orders: 9, revenue: 340000 },
    { day: 'Min', orders: 8, revenue: 290000 }
  ];

  const maxWeeklyOrders = Math.max(...weeklyData.map((d) => d.orders), 10);

  const getStatusBadge = (status) => {
    if (status === 'Menunggu Konfirmasi') return <Badge variant="waiting" size="sm">{status}</Badge>;
    if (status === 'Selesai') return <Badge variant="success" size="sm">{status}</Badge>;
    if (status === 'Ditolak' || status === 'Dibatalkan') return <Badge variant="danger" size="sm">{status}</Badge>;
    return <Badge variant="process" size="sm">{status}</Badge>;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-wet">
          Statistik performa pesanan harian, status penjemputan, dan ringkasan omset.
        </p>

        <div className="flex items-center gap-2">
          <Link to="/admin/orders">
            <Button size="sm" className="flex items-center gap-1.5">
              <span>Buka Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 border-brand-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-wet block">Menunggu Konfirmasi</span>
            <span className="text-2xl font-bold font-display text-brand-900 mt-1 block">
              {waitingOrders.length}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Perlu segera ditinjau</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-gold/20 text-brand-900 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-brand-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-wet block">Sedang Dikerjakan</span>
            <span className="text-2xl font-bold font-display text-brand-900 mt-1 block">
              {processingOrders.length}
            </span>
            <span className="text-[11px] text-sky-700 font-medium">Tahap jemput & cuci</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-200/50 text-brand-900 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-brand-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-wet block">Pesanan Selesai</span>
            <span className="text-2xl font-bold font-display text-brand-900 mt-1 block">
              {completedOrders.length}
            </span>
            <span className="text-[11px] text-success font-medium">Treatment tuntas</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-brand-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-wet block">Estimasi Omset</span>
            <span className="text-2xl font-bold font-display text-brand-900 mt-1 block">
              {formatPrice(totalRevenue)}
            </span>
            <span className="text-[11px] text-slate-wet font-medium">Total dari pesanan aktif</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 border-brand-200 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-brand-200/70 pb-3">
            <div>
              <h3 className="text-sm font-bold text-brand-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <span>Tren Volume Pesanan Mingguan</span>
              </h3>
              <p className="text-xs text-slate-wet">
                Aktivitas cuci dan repaint 7 hari terakhir
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-100 text-brand-900">
              7 Hari Terakhir
            </span>
          </div>

          <div className="h-44 w-full flex items-end gap-3 pt-6 pb-2 px-2">
            {weeklyData.map((item, index) => {
              const heightPercent = (item.orders / maxWeeklyOrders) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-wet opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.orders} pasang
                  </div>
                  <div className="w-full max-w-[36px] bg-brand-100 rounded-t-md relative overflow-hidden transition-all duration-300 group-hover:bg-brand-600" style={{ height: `${heightPercent}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-600 to-sky-400 opacity-80" />
                  </div>
                  <span className="text-xs font-semibold text-brand-900">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-wet pt-2 border-t border-brand-200/50">
            <span>Rata-rata: <strong>6 pasang / hari</strong></span>
            <span>Hari puncak: <strong>Sabtu (9 pasang)</strong></span>
          </div>
        </Card>

        <Card className="p-5 border-brand-200 flex flex-col justify-between gap-4">
          <div>
            <div className="border-b border-brand-200/70 pb-3">
              <h3 className="text-sm font-bold text-brand-900">
                Distribusi Metode Layanan
              </h3>
              <p className="text-xs text-slate-wet">
                Perbandingan jemput kurir vs antar mandiri
              </p>
            </div>

            <div className="flex flex-col gap-3.5 mt-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-900 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-brand-600" />
                    <span>Layanan Dijemput Kurir</span>
                  </span>
                  <span className="font-bold text-brand-900">{pickupOrdersCount} Pesanan</span>
                </div>
                <div className="w-full bg-brand-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all"
                    style={{
                      width: orders.length > 0 ? `${(pickupOrdersCount / orders.length) * 100}%` : '50%'
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-900 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-wet" />
                    <span>Antar Langsung ke Outlet</span>
                  </span>
                  <span className="font-bold text-brand-900">{dropoffOrdersCount} Pesanan</span>
                </div>
                <div className="w-full bg-brand-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full transition-all"
                    style={{
                      width: orders.length > 0 ? `${(dropoffOrdersCount / orders.length) * 100}%` : '50%'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-brand-100/50 rounded-lg text-xs text-brand-900">
            <span className="font-bold block mb-0.5">Katalog Master</span>
            <span>{services.filter((s) => s.aktif).length} layanan perawatan & sabun aktif siap dipesan.</span>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-brand-900">
              Daftar Pesanan Terbaru
            </h3>
            <p className="text-xs text-slate-wet">
              Pesanan masuk terbaru yang memerlukan tindakan
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-brand-600 hover:text-brand-900 transition-colors"
          >
            Lihat Semua Pesanan &rarr;
          </Link>
        </div>

        <Card noPadding rounded={false} className="w-full border-brand-200 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-brand-100/60 border-b border-brand-200 text-brand-900 font-semibold">
                <tr>
                  <th scope="col" className="px-4 py-3">No. Tiket</th>
                  <th scope="col" className="px-4 py-3">Pelanggan</th>
                  <th scope="col" className="px-4 py-3">Metode</th>
                  <th scope="col" className="px-4 py-3">Total Biaya</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-200/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-wet text-xs">
                      Memuat pesanan...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-wet text-xs">
                      Belum ada pesanan masuk.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-brand-100/25 transition-colors">
                      <td className="px-4 py-3 font-bold text-brand-900 whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-brand-900 text-xs sm:text-sm">{order.pelanggan?.nama}</div>
                        <div className="text-xs text-slate-wet">{order.pelanggan?.telepon}</div>
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
                        <Link to={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="secondary">
                            Detail & Rute
                          </Button>
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
    </div>
  );
}
