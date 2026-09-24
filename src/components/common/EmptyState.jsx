import React from 'react';
import { Package } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

export function EmptyState({
  title = 'Tidak Ada Data',
  description = 'Belum ada data yang tersedia untuk saat ini.',
  actionLabel,
  onAction,
  icon: Icon = Package,
  className
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-card border border-brand-200", className)}>
      <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-bold font-display text-brand-900 mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-wet max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
