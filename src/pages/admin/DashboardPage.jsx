import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Wrench, 
  CheckCircle2, 
  DollarSign,
  ArrowRight,
  Package,
  Bike,
  Sparkles,
  Layers,
  ShoppingBag,
  Image as ImageIcon
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
        setOrders(ordersList || []);
        setServices(servicesList || []);
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
    .reduce((acc, curr) => acc + (Number(curr.total_harga || curr.total_price) || 0), 0);

  let totalShoesCount = 0;
  const serviceStatsMap = {};

  orders.forEach((o) => {
    const items = o.items || [];
    items.forEach((it) => {
      const qty = Number(it.qty) || 1;
      totalShoesCount += qty;

      const rawName = (it.service || it.nama_layanan || it.service_nama || 'Layanan Sepatu').trim();
      let normalized = rawName;
      const lower = rawName.toLowerCase();

      if (lower.includes('repaint')) normalized = 'Repaint & Restorasi';
      else if (lower.includes('suede')) normalized = 'Suede Clean';
      else if (lower.includes('white')) normalized = 'White Clean';
      else if (lower.includes('deep')) normalized = 'Deep Clean';
      else if (lower.includes('medium')) normalized = 'Medium Clean';
      else if (lower.includes('fast')) normalized = 'Fast Clean';
      else if (lower.includes('sabun') || lower.includes('cleaner')) normalized = 'Produk Sabun & Care';

      serviceStatsMap[normalized] = (serviceStatsMap[normalized] || 0) + qty;
    });
  });

  const serviceCategories = Object.entries(serviceStatsMap)
    .map(([name, count]) => ({
      name,
      count,
      percent: totalShoesCount > 0 ? Math.round((count / totalShoesCount) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const pickupOrdersCount = orders.filter((o) => 
    o.metode === 'dijemput' || o.metode === 'dikirim' || o.metode_layanan === 'dijemput'
  ).length;

  const dropoffOrdersCount = orders.filter((o) => 
    o.metode === 'antar_sendiri' || o.metode === 'ambil' || o.metode_layanan === 'antar_sendiri'
  ).length;

  const getStatusBadge = (status) => {
    if (status === 'Menunggu Konfirmasi') return <Badge variant="waiting" size="sm">{status}</Badge>;
    if (status === 'Selesai') return <Badge variant="success" size="sm">{status}</Badge>;
    if (status === 'Ditolak' || status === 'Dibatalkan') return <Badge variant="danger" size="sm">{status}</Badge>;
    return <Badge variant="process" size="sm">{status}</Badge>;
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-display text-brand-900">
            Ringkasan Operasional Workshop
          </h2>
          <p className="text-xs text-slate-wet mt-0.5">
            Data transaksi asli terintegrasi dari database Firestore Lave Streat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/orders">
            <Button size="sm" className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Kelola Pesanan</span>
            </Button>
          </Link>
          <Link to="/admin/gallery">
            <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Kelola Galeri</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 border-brand-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-wet block">Menunggu Konfirmasi</span>
            <span className="text-2xl font-bold font-display text-brand-900 mt-1 block">
              {waitingOrders.length}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Perlu segera ditinjau</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-gold/20 text-brand-900 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-brand-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-wet block">Dalam Pengerjaan</span>
            <span className="text-2xl font-bold font-display text-brand-900 mt-1 block">
              {processingOrders.length}
            </span>
            <span className="text-[11px] text-sky-700 font-medium">Tahap jemput & cuci</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-200/50 text-brand-900 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-brand-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-wet block">Sepatu Selesai Dicuci</span>
            <span className="text-2xl font-bold font-display text-brand-900 mt-1 block">
              {totalShoesCount || completedOrders.length} pasang
            </span>
            <span className="text-[11px] text-success font-medium">Dari {completedOrders.length} transaksi tuntas</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-brand-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-wet block">Total Omset Transaksi</span>
            <span className="text-2xl font-bold font-display text-brand-900 mt-1 block">
              {formatPrice(totalRevenue)}
            </span>
            <span className="text-[11px] text-slate-wet font-medium">Akumulasi pesanan tercatat</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 border-brand-200 flex flex-col justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-brand-200/70 pb-3">
              <div>
                <h3 className="text-sm font-bold text-brand-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Komposisi Treatment & Layanan Terbanyak</span>
                </h3>
                <p className="text-xs text-slate-wet">
                  Statistik riil dari total {totalShoesCount} pasang sepatu yang diproses workshop
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-100 text-brand-900">
                {serviceCategories.length} Kategori
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              {serviceCategories.map((cat, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-600" />
                      <span>{cat.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-900">{cat.count} pasang</span>
                      <span className="text-slate-wet text-[11px]">({cat.percent}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-brand-600' : idx === 1 ? 'bg-sky-400' : idx === 2 ? 'bg-amber-500' : 'bg-brand-900'
                      }`}
                      style={{ width: `${Math.max(5, cat.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-brand-200/60 flex items-center justify-between text-xs text-slate-wet">
            <span>Standar pengerjaan manual 100%</span>
            <Link to="/admin/services" className="font-semibold text-brand-600 hover:text-brand-900">
              Kelola Tarif & Katalog &rarr;
            </Link>
          </div>
        </Card>

        <Card className="p-5 border-brand-200 flex flex-col justify-between gap-4 shadow-xs">
          <div>
            <div className="border-b border-brand-200/70 pb-3">
              <h3 className="text-sm font-bold text-brand-900">
                Distribusi Metode Layanan
              </h3>
              <p className="text-xs text-slate-wet">
                Perbandingan jemput kurir vs antar mandiri ke outlet
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-900 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-brand-600" />
                    <span>Layanan Dijemput Kurir</span>
                  </span>
                  <span className="font-bold text-brand-900">{pickupOrdersCount} Pesanan</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all"
                    style={{
                      width: orders.length > 0 ? `${(pickupOrdersCount / orders.length) * 100}%` : '50%'
                    }}
                  />
                </div>
                <span className="text-[11px] text-slate-wet">
                  Antar-jemput alamat area Sidoarjo & Surabaya
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-900 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-wet" />
                    <span>Antar Langsung ke Outlet</span>
                  </span>
                  <span className="font-bold text-brand-900">{dropoffOrdersCount} Pesanan</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full transition-all"
                    style={{
                      width: orders.length > 0 ? `${(dropoffOrdersCount / orders.length) * 100}%` : '50%'
                    }}
                  />
                </div>
                <span className="text-[11px] text-slate-wet">
                  Drop-off mandiri ke workshop
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-brand-light/70 rounded-xl text-xs text-brand-900 border border-brand-200/80">
            <span className="font-bold block mb-0.5">Katalog Master</span>
            <span>{services.filter((s) => s.aktif).length} layanan perawatan & sabun aktif siap dipesan.</span>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-brand-900">
              Daftar Pesanan Masuk Terbaru
            </h3>
            <p className="text-xs text-slate-wet">
              Daftar transaksi aktual dari data invoice workshop
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-brand-600 hover:text-brand-900 transition-colors"
          >
            Lihat Semua Pesanan ({orders.length}) &rarr;
          </Link>
        </div>

        <Card noPadding rounded="sm" className="w-full border-brand-200 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-brand-200 text-brand-900 font-semibold">
                <tr>
                  <th scope="col" className="px-4 py-3">No. Invoice</th>
                  <th scope="col" className="px-4 py-3">Pelanggan</th>
                  <th scope="col" className="px-4 py-3">Sepatu & Layanan</th>
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
                  orders.slice(0, 6).map((order) => {
                    const invoice = order.invoice_number || order.invoice || order.id;
                    const custName = order.customer_name || order.pelanggan?.nama || 'Pelanggan';
                    const custPhone = order.customer_phone || order.pelanggan?.telepon || '-';
                    const items = order.items || [];
                    const itemsSummary = items.map(it => `${it.shoe_brand || ''} ${it.shoe_type || ''} (${it.service || it.nama_layanan || 'Treatment'})`).filter(Boolean).join(', ') || 'Item Sepatu';
                    const price = order.total_harga || order.total_price || 0;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-brand-900 text-xs whitespace-nowrap">
                          {invoice}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-brand-900 text-xs sm:text-sm">{custName}</div>
                          <div className="text-[11px] text-slate-wet">{custPhone}</div>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="text-xs text-brand-900 font-medium truncate" title={itemsSummary}>
                            {itemsSummary}
                          </div>
                          <div className="text-[11px] text-slate-wet">
                            {items.length} pasang sepatu
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-brand-900 text-xs sm:text-sm whitespace-nowrap">
                          {formatPrice(price)}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
