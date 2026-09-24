import React from 'react';
import { BeforeAfterCompare } from './BeforeAfterCompare';

export function GalleryGrid({ items = [] }) {
  if (!items.length) {
    return (
      <div className="text-center py-12 text-slate-wet">
        Belum ada foto galeri yang ditampilkan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <BeforeAfterCompare
          key={item.id}
          beforeUrl={item.before_url}
          afterUrl={item.after_url}
          caption={item.caption}
          serviceTag={item.layanan_terkait}
        />
      ))}
    </div>
  );
}
