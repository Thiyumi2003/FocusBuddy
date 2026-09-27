import React from 'react';
import { priorityMeta, priorityOrder } from '../data/priorities';
import { Priority } from '../types/reminders';
import { PriorityDot } from './PriorityDot';

export function PriorityPicker({ value, onChange }: {value: Priority;onChange: (p: Priority) => void;}) {
  return (
    <div role="radiogroup" aria-label="Priority" className="inline-flex rounded-lg border border-line bg-canvas p-0.5">
      {priorityOrder.map((p) => {
        const active = value === p;
        return (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] transition-colors duration-150 ${
            active ? 'bg-surface font-medium text-ink shadow-card' : 'text-muted hover:text-ink'}`
            }>
            
            <PriorityDot priority={p} className="h-2 w-2" />
            {priorityMeta[p].label}
          </button>);

      })}
    </div>);

}