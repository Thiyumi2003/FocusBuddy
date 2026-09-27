import React from 'react';

interface ChoiceGroupProps<T extends string> {
  label: string;
  value: T;
  options: {value: T;label: string;}[];
  onChange: (value: T) => void;
}

export function ChoiceGroup<T extends string>({ label, value, options, onChange }: ChoiceGroupProps<T>) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted">{label}</p>
      <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-lg border border-line bg-canvas p-0.5">
        {options.map((o) =>
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] transition-colors duration-150 ${
          value === o.value ? 'bg-surface font-medium text-ink shadow-card' : 'text-muted hover:text-ink'}`
          }>
          
            {o.label}
          </button>
        )}
      </div>
    </div>);

}