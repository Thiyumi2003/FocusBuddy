import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon } from 'lucide-react';
import { reminderStyles } from '../../data/aiSettings';
import { AISettings, FollowUpAfter, PriorityDelivery, SettingsUpdater } from '../../types/settings';
import { CheckRow } from './CheckRow';
import { SelectField } from './SelectField';
import { SettingsSection } from './SettingsSection';

const deliveryOptions: {value: PriorityDelivery;label: string;}[] = [
{ value: 'normal', label: 'Remind normally' },
{ value: 'smart', label: 'Smart timing' },
{ value: 'available', label: 'Only when I’m available' }];


export function ReminderStyleSection({ settings, set }: {settings: AISettings;set: SettingsUpdater;}) {
  const active = reminderStyles.find((s) => s.id === settings.reminderStyle) ?? reminderStyles[1];

  return (
    <SettingsSection id="style" title="Reminder style" description="Pick a personality. It should feel like your assistant, not corporate software.">
      <div role="radiogroup" aria-label="Reminder personality" className="grid gap-2 sm:grid-cols-3">
        {reminderStyles.map((s) => {
          const on = s.id === settings.reminderStyle;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => set('reminderStyle', s.id)}
              className={`rounded-xl px-4 py-3 text-left transition-colors duration-150 ${
              on ? 'bg-surface ring-2 ring-ink' : 'bg-surface ring-1 ring-line hover:ring-subtle'}`
              }>
              
              <p className="text-sm font-medium text-ink">{s.label}</p>
              <p className="text-xs text-muted">{s.description}</p>
            </button>);

        })}
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-canvas p-4" aria-live="polite">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink">
          <BellIcon className="h-4 w-4 text-white" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">FocusBuddy · preview</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={active.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="text-sm text-ink">
              
              {active.sample}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-3 border-t border-line pt-5">
        <p className="text-xs font-medium text-muted">How each priority reaches you</p>
        <SelectField id="high-delivery" label="High priority" value={settings.highDelivery} options={deliveryOptions} onChange={(v) => set('highDelivery', v)} />
        <SelectField id="medium-delivery" label="Medium priority" value={settings.mediumDelivery} options={deliveryOptions} onChange={(v) => set('mediumDelivery', v)} />
        <SelectField id="low-delivery" label="Low priority" value={settings.lowDelivery} options={deliveryOptions} onChange={(v) => set('lowDelivery', v)} />
      </div>

      <div className="space-y-3 border-t border-line pt-5">
        <SelectField<FollowUpAfter>
          id="follow-up"
          label="If I don’t respond, follow up after"
          value={settings.followUpAfter}
          onChange={(v) => set('followUpAfter', v)}
          options={[
          { value: 'ai', label: 'AI decides' },
          { value: '1h', label: '1 hour' },
          { value: '3h', label: '3 hours' },
          { value: 'tomorrow', label: 'Tomorrow' }]
          } />
        
        <CheckRow label="Suggest rescheduling" checked={settings.suggestReschedule} onChange={(v) => set('suggestReschedule', v)} />
        <CheckRow label="Allow teammates to Poke me" checked={settings.allowPokes} onChange={(v) => set('allowPokes', v)} />
      </div>
    </SettingsSection>);

}