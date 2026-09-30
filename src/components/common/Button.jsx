import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:ring-2 focus:ring-brand-600 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 hover:bg-brand-900 text-snow-foam shadow-sm',
        secondary: 'border border-brand-200 text-brand-900 bg-white hover:bg-brand-100',
        outline: 'border border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white',
        dark: 'bg-brand-900 hover:bg-brand-600 text-snow-foam shadow-sm',
        gold: 'bg-accent-gold hover:bg-yellow-400 text-brand-900 shadow-sm',
        glass: 'bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-xs shadow-xs',
        danger: 'bg-danger hover:bg-red-700 text-white shadow-sm',
        ghost: 'text-brand-900 hover:bg-brand-100/50'
      },
      size: {
        sm: 'h-8 px-3 text-xs font-medium',
        md: 'h-9 px-4 text-xs sm:text-sm font-medium',
        lg: 'h-10 px-5 text-sm sm:text-base font-semibold'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export function Button({
  children,
  variant,
  size,
  type = 'button',
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </button>
  );
}
