import React from 'react';
import { CheckIcon } from 'lucide-react';
import { avatars } from '../../data/avatars';

export function AvatarPicker({ value, onChange }: {value: string;onChange: (id: string) => void;}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-bold text-ink">Pick your buddy</legend>
      <div role="radiogroup" aria-label="Avatar" className="flex gap-3">
        {avatars.map((a) => {
          const selected = a.id === value;
          return (
            <div key={a.id} className="relative">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={a.name}
                onClick={() => onChange(a.id)}
                className={`block h-14 w-14 overflow-hidden rounded-full transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 ${
                selected ? 'scale-105 ring-4 ring-accent' : 'opacity-75 ring-2 ring-white hover:-translate-y-0.5 hover:opacity-100'}`
                }>
                
                <img src={a.url} alt="" className="h-full w-full scale-[1.35] object-cover" />
              </button>
              {selected &&
              <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white ring-2 ring-white">
                  <CheckIcon className="h-3 w-3" strokeWidth={3} aria-hidden />
                </span>
              }
            </div>);

        })}
      </div>
    </fieldset>);

}