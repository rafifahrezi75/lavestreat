import React from 'react';
import { cn } from '../../lib/utils';

export function Card({
  children,
  className = '',
  variant = 'white',
  hoverable = false,
  ...props
}) {
  const variantStyles = {
    white: 'bg-white border-brand-200 text-ink-deep',
    foam: 'bg-brand-100 border-brand-200 text-ink-deep',
    sand: 'bg-sand-100 border-[#DFCDB6] text-ink-deep',
    dark: 'bg-brand-900 border-brand-600/30 text-snow-foam'
  };

  const hoverStyles = hoverable ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-md' : '';

  return (
    <div
      className={cn('rounded-card border p-5 sm:p-6 shadow-subtle', variantStyles[variant], hoverStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
}
