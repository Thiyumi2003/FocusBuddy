import React from 'react';
import { weekDays } from '../../data/aiSettings';
import { AISettings, ProductiveTime, SettingsUpdater } from '../../types/settings';
import { ChoiceGroup } from './ChoiceGroup';
import { SettingsSection } from './SettingsSection';

function toHours(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + (m >= 30 ? 0.5 : 0);
}

function toTime(v: number): string {
  const h = Math.floor(v);
  return `${String(h).padStart(2, '0')}:${v % 1 ? '30' : '00'}`;
}

function label(v: number): string {
  const h = Math.floor(v) % 24;
  const suffix = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${v % 1 ? '30' : '00'} ${suffix}`;
}

export function WorkingHoursSection({ settings, set }: {settings: AISettings;set: SettingsUpdater;}) {
  const start = toHours(settings.startTime);
  const end = toHours(settings.endTime);

  function toggleDay(day: string) {
    const days = settings.workingDays.includes(day) ? settings.workingDays.filter((d) => d !== day) : [...settings.workingDays, day];
    set('workingDays', days);
  }

  return (
    <SettingsSection id="working" title="Working hours" description="Helps me know when not to disturb you.">
      <div>
        <p className="mb-2 text-xs font-bold text-muted">Working days</p>
        <div className="flex flex-wrap gap-2">
          {weekDays.map((d) => {
            const on = settings.workingDays.includes(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={on}
                onClick={() => toggleDay(d)}
                className={`h-11 w-12 rounded-2xl text-[13px] font-extrabold transition-[background-color,color,transform] duration-150 active:scale-95 ${
                on ? 'bg-accent text-white shadow-card' : 'bg-white text-muted ring-1 ring-line hover:text-ink'}`
                }>
                
                {d}
              </button>);

          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white/70 p-5 ring-1 ring-white">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-bold text-muted">Working hours</p>
          <p className="text-sm font-extrabold text-ink">
            {label(start)} <span className="text-subtle">→</span> {label(end)}
          </p>
        </div>
        <div className="relative mt-5 h-6">
          <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-lavender-soft" />
          <div
            className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `${start / 24 * 100}%`, right: `${100 - end / 24 * 100}%` }} />
          
          <input
            type="range"
            min={0}
            max={24}
            step={0.5}
            value={start}
            aria-label="Start of working hours"
            aria-valuetext={label(start)}
            onChange={(e) => set('startTime', toTime(Math.min(Number(e.target.value), end - 1)))}
            className="dual-range" />
          
          <input
            type="range"
            min={0}
            max={24}
            step={0.5}
            value={end}
            aria-label="End of working hours"
            aria-valuetext={label(end)}
            onChange={(e) => set('endTime', toTime(Math.max(Number(e.target.value), start + 1)))}
            className="dual-range" />
          
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-bold text-subtle" aria-hidden>
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>12 AM</span>
        </div>
      </div>

      <ChoiceGroup<ProductiveTime>
        label="My most productive time"
        value={settings.productiveTime}
        onChange={(v) => set('productiveTime', v)}
        options={[
        { value: 'auto', label: 'Let AI learn it' },
        { value: 'morning', label: 'Morning' },
        { value: 'afternoon', label: 'Afternoon' },
        { value: 'evening', label: 'Evening' }]
        } />
      
    </SettingsSection>);

}