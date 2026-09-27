import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
      checked ? 'bg-accent' : 'bg-line'}`
      }>
      
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-card transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`
        } />
      
    </button>);

}