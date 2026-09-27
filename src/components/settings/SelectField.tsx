import React from 'react';

interface SelectFieldProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: {value: T;label: string;}[];
  onChange: (value: T) => void;
}

export function SelectField<T extends string>({ id, label, value, options, onChange }: SelectFieldProps<T>) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="text-sm text-ink">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-56 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none">
        
        {options.map((o) =>
        <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    </div>);

}