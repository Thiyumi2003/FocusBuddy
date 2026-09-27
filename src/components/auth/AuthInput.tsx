import React from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  trailing?: React.ReactNode;
}

export function AuthInput({ id, label, error, hint, trailing, className = '', ...rest }: AuthInputProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-subtle transition-colors duration-150 focus:outline-none focus:ring-2 ${
          error ? 'border-high focus:ring-high/15' : 'border-line focus:border-accent focus:ring-accent/15'} ${
          trailing ? 'pr-11' : ''} ${className}`}
          {...rest} />
        
        {trailing && <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>}
      </div>
      {error ?
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-high-ink">{error}</p> :
      hint ?
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p> :
      null}
    </div>);

}