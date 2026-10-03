const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(val) || 0);
};

export function generateReceiptHtml(order) {
  const customerNama = order.pelanggan?.nama || order.customer?.nama || '-';
  const customerTelepon = order.pelanggan?.telepon || order.customer?.telepon || '-';
  const customerEmail = order.pelanggan?.email || order.customer?.email || '-';
  const catatan = order.catatan || order.customer?.catatan || '-';

  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

  const jadwalDate = order.jadwal_tanggal || order.jadwal?.tanggal || '-';
  const jadwalSlot = order.jadwal_slot || order.jadwal?.slot || '';
  const jadwalText = jadwalSlot ? `${jadwalDate} (${jadwalSlot})` : jadwalDate;

  const alamatTeks = order.alamat_jemput?.teks || order.alamat_antar?.teks || order.alamat || '-';
  const metodeLabel = (order.metode || 'antar_sendiri').replace(/_/g, ' ').toUpperCase();

  const items = Array.isArray(order.items) ? order.items : [];
  const rowsHtml = items
    .map((item, index) => {
      const name = item.nama_snapshot || item.nama_layanan || item.name || 'Layanan';
      const qty = Number(item.qty) || 1;
      const price = Number(item.harga_snapshot || item.harga_saat_pesan || item.harga || 0);
      const subtotal = item.subtotal ? Number(item.subtotal) : price * qty;

      return `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 12px; font-size: 12px; color: #475569; text-align: center;">${index + 1}</td>
          <td style="padding: 10px 12px; font-size: 12px; color: #0F172A; font-weight: 600;">${name}</td>
          <td style="padding: 10px 12px; font-size: 12px; color: #0F172A; text-align: center; font-variant-numeric: tabular-nums;">${qty}</td>
          <td style="padding: 10px 12px; font-size: 12px; color: #475569; text-align: right; font-variant-numeric: tabular-nums;">${formatRupiah(price)}</td>
          <td style="padding: 10px 12px; font-size: 12px; color: #0A3D66; font-weight: 700; text-align: right; font-variant-numeric: tabular-nums;">${formatRupiah(subtotal)}</td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Struk Pemesanan - ${order.id}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #FFFFFF;
      color: #0F172A;
      line-height: 1.45;
      padding: 24px;
      max-width: 720px;
      margin: 0 auto;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0A3D66;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #0A3D66;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #2F6FED;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .brand-contact {
      font-size: 10.5px;
      color: #64748B;
      margin-top: 6px;
      line-height: 1.4;
    }
    .ticket-badge {
      text-align: right;
    }
    .ticket-label {
      font-size: 10px;
      font-weight: 800;
      color: #2F6FED;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .ticket-number {
      font-size: 18px;
      font-weight: 800;
      color: #0A3D66;
      font-family: monospace;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .ticket-date {
      font-size: 10.5px;
      color: #64748B;
      margin-top: 4px;
    }
    .grid-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #EAF7FE;
      border: 1px solid #8ED1F0;
      border-radius: 6px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .info-column h4 {
      font-size: 10px;
      font-weight: 800;
      color: #0A3D66;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #8ED1F0;
    }
    .info-item {
      display: flex;
      margin-bottom: 4px;
      font-size: 11.5px;
    }
    .info-label {
      width: 80px;
      color: #64748B;
      flex-shrink: 0;
    }
    .info-value {
      color: #0F172A;
      font-weight: 600;
    }
    .table-container {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .table-container th {
      background: #0A3D66;
      color: #FFFFFF;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 9px 12px;
    }
    .total-box {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .total-table {
      width: 260px;
      border-collapse: collapse;
    }
    .total-table td {
      padding: 6px 10px;
      font-size: 12px;
    }
    .total-table .final-row {
      background: #0A3D66;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 14px;
    }
    .status-alert {
      background: #FFFFFF;
      border: 1px dashed #2F6FED;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .status-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 800;
      background: #EAF7FE;
      color: #0A3D66;
      border: 1px solid #8ED1F0;
      text-transform: uppercase;
    }
    .status-text {
      font-size: 11px;
      color: #475569;
      max-width: 440px;
    }
    .footer-section {
      border-top: 1px solid #CBD5E1;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748B;
    }
    .footer-notice {
      max-width: 460px;
      line-height: 1.4;
    }
    .stamp-box {
      border: 1.5px solid #2F6FED;
      color: #0A3D66;
      font-weight: 800;
      font-size: 9px;
      padding: 4px 8px;
      border-radius: 4px;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="header-bar">
    <div>
      <div class="brand-title">Lave Streat</div>
      <div class="brand-subtitle">L.A.V.E Treatment • Premium Shoe Care</div>
      <div class="brand-contact">
        Area Layanan: Sidoarjo &amp; Surabaya<br>
        WhatsApp Resmi: +62 851-2802-4120
      </div>
    </div>
    <div class="ticket-badge">
      <div class="ticket-label">Bukti Pemesanan</div>
      <div class="ticket-number">${order.id}</div>
      <div class="ticket-date">${orderDate}</div>
    </div>
  </div>

  <div class="grid-info">
    <div class="info-column">
      <h4>Informasi Pelanggan</h4>
      <div class="info-item">
        <span class="info-label">Nama</span>
        <span class="info-value">: ${customerNama}</span>
      </div>
      <div class="info-item">
        <span class="info-label">WhatsApp</span>
        <span class="info-value">: ${customerTelepon}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email</span>
        <span class="info-value">: ${customerEmail}</span>
      </div>
      ${catatan && catatan !== '-' ? `
      <div class="info-item" style="margin-top: 4px;">
        <span class="info-label">Catatan</span>
        <span class="info-value">: ${catatan}</span>
      </div>
      ` : ''}
    </div>

    <div class="info-column">
      <h4>Metode &amp; Pengiriman</h4>
      <div class="info-item">
        <span class="info-label">Metode</span>
        <span class="info-value">: ${metodeLabel}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Jadwal</span>
        <span class="info-value">: ${jadwalText}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Alamat</span>
        <span class="info-value" style="word-break: break-word;">: ${alamatTeks}</span>
      </div>
    </div>
  </div>

  <table class="table-container">
    <thead>
      <tr>
        <th style="width: 36px; text-align: center;">No</th>
        <th style="text-align: left;">Rincian Layanan / Produk</th>
        <th style="width: 50px; text-align: center;">Qty</th>
        <th style="width: 110px; text-align: right;">Harga Satuan</th>
        <th style="width: 120px; text-align: right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="total-box">
    <table class="total-table">
      <tr>
        <td style="color: #64748B;">Total Item:</td>
        <td style="text-align: right; font-weight: 700;">${items.reduce((sum, it) => sum + (Number(it.qty) || 1), 0)} item</td>
      </tr>
      <tr>
        <td style="color: #64748B;">Ongkos Kirim / Jemput:</td>
        <td style="text-align: right; font-weight: 600; color: #1E9E6B;">Termasuk</td>
      </tr>
      <tr class="final-row">
        <td style="border-radius: 4px 0 0 4px;">Total Estimasi:</td>
        <td style="text-align: right; border-radius: 0 4px 4px 0;">${formatRupiah(order.total_harga)}</td>
      </tr>
    </table>
  </div>

  <div class="status-alert">
    <div>
      <span class="status-pill">${order.status || 'Menunggu Konfirmasi'}</span>
      <div class="status-text" style="margin-top: 6px;">
        Struk ini merupakan bukti pemesanan resmi. Pembayaran dilakukan secara off-platform saat serah terima sepatu melalui transfer atau tunai kepada petugas kurir.
      </div>
    </div>
  </div>

  <div class="footer-section">
    <div class="footer-notice">
      Simpan bukti pemesanan ini. Jika ada pertanyaan mengenai jadwal penjemputan atau pengerjaan, hubungi layanan pelanggan Lave Streat di nomor WhatsApp +62 851-2802-4120.
    </div>
    <div class="stamp-box">
      LAVE STREAT<br>
      VERIFIED RECEIPT
    </div>
  </div>

</body>
</html>
  `;
}

export function printOrderReceipt(order) {
  const html = generateReceiptHtml(order);

  const printWindow = window.open('', '_blank', 'width=800,height=900,menubar=no,toolbar=no,location=no,status=no');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };

    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch {
      }
    }, 500);
    return true;
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 400);

  return true;
}
