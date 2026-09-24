import React from 'react';

export function Select({
  label,
  id,
  options = [],
  error,
  helperText,
  className = '',
  required = false,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-brand-900 flex items-center justify-between">
          <span>{label}</span>
          {required && <span className="text-xs text-danger font-normal">Wajib</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-deep transition-colors focus:outline-hidden focus:ring-2 ${
          error
            ? 'border-danger focus:ring-danger/30'
            : 'border-brand-200 focus:border-brand-600 focus:ring-brand-600/20'
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs font-medium text-danger">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="text-xs text-slate-wet">
          {helperText}
        </span>
      )}
    </div>
  );
}
