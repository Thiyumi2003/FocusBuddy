import React from 'react';
import { CheckIcon } from 'lucide-react';

interface CheckRowProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function CheckRow({ label, checked, onChange, disabled }: CheckRowProps) {
  return (
    <label className={`flex items-center gap-3 text-sm ${disabled ? 'cursor-not-allowed text-subtle' : 'cursor-pointer text-ink'}`}>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-1 ${
        checked ? 'border-accent bg-accent text-white' : 'border-line bg-surface'}`
        }>
        
        {checked && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
      </span>
      {label}
    </label>);

}