import React from 'react';
import { cn } from '../../lib/utils';

export function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-brand-900 flex items-center justify-between">
          <span>{label}</span>
          {required && <span className="text-xs text-danger font-normal">Wajib</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        className={cn(
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-deep placeholder:text-slate-wet/60 transition-colors focus:outline-hidden focus:ring-2',
          error
            ? 'border-danger focus:ring-danger/30'
            : 'border-brand-200 focus:border-brand-600 focus:ring-brand-600/20'
        )}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-xs font-medium text-danger">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className="text-xs text-slate-wet">
          {helperText}
        </span>
      )}
    </div>
  );
}
