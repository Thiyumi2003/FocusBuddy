import React from 'react';

export function FormField({ label, htmlFor, children }: {label: string;htmlFor?: string;children: React.ReactNode;}) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      {children}
    </div>);

}

export const inputClass =
'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-subtle transition-colors duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15';