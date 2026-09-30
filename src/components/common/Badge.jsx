import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center font-medium rounded-md transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-100 text-brand-900 border border-brand-200',
        primary: 'bg-brand-600 text-white',
        gold: 'bg-accent-gold text-brand-900 font-semibold',
        success: 'bg-success/15 text-success border border-success/20',
        danger: 'bg-danger/15 text-danger border border-danger/20',
        waiting: 'bg-accent-gold/25 text-brand-900 border border-accent-gold/40',
        process: 'bg-brand-200 text-brand-900 border border-brand-600/20'
      },
      size: {
        sm: 'text-xs px-2.5 py-0.5',
        md: 'text-xs sm:text-sm px-3 py-1'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export function Badge({
  children,
  variant,
  size,
  className = ''
}) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))}>
      {children}
    </span>
  );
}
