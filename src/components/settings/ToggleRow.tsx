import React from 'react';
import { Toggle } from '../Toggle';

interface ToggleRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({ title, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>);

}