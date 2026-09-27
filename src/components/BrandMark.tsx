import React from 'react';
import { Mascot } from './Mascot';

export function BrandMark({ subtitle = 'by Team Diva', size = 'md' }: {subtitle?: string | null;size?: 'sm' | 'md';}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center justify-center rounded-2xl bg-lavender-soft ${size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'}`}>
        <Mascot size={size === 'sm' ? 30 : 38} float={false} />
      </div>
      <div>
        <p className="text-[16px] font-extrabold leading-tight text-ink">
          FocusBuddy
        </p>
        {subtitle && <p className="text-xs font-semibold leading-tight text-muted">{subtitle}</p>}
      </div>
    </div>);

}