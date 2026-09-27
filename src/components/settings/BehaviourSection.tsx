import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AISettings, SettingsUpdater } from '../../types/settings';
import { Mascot } from '../Mascot';
import { Toggle } from '../Toggle';
import { CheckRow } from './CheckRow';
import { SettingsSection } from './SettingsSection';
import { ToggleRow } from './ToggleRow';

export function BehaviourSection({ settings, set }: {settings: AISettings;set: SettingsUpdater;}) {
  const on = settings.focusProtection;
  return (
    <SettingsSection id="behaviour" title="AI behaviour" description="You set preferences. I pick the best moment. Switch off anything you’d rather control.">
      <ToggleRow title="Smart timing" description="Let AI choose optimal reminder times based on my activity." checked={settings.smartTiming} onChange={(v) => set('smartTiming', v)} />
      <ToggleRow title="Behaviour learning" description="Learn when I usually respond to and complete reminders." checked={settings.behaviourLearning} onChange={(v) => set('behaviourLearning', v)} />
      <ToggleRow title="Priority suggestions" description="Suggest High, Medium or Low from deadline and urgency." checked={settings.prioritySuggestions} onChange={(v) => set('prioritySuggestions', v)} />
      <ToggleRow title="Smart follow-ups" description="If I ignore something, suggest a better time instead of nagging." checked={settings.smartFollowUps} onChange={(v) => set('smartFollowUps', v)} />

      <div className={`rounded-3xl p-5 ring-1 ring-white transition-colors duration-200 ${on ? 'bg-lavender-soft' : 'bg-white/70'}`}>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={on ? 'sleep' : 'awake'} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.18 }}>
                <Mascot mood={on ? 'sleep' : 'happy'} size={68} float={false} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-lavender-ink">{on ? 'Do Not Disturb · On' : 'Do Not Disturb · Off'}</p>
            <p className="text-base font-black text-ink">Focus Protection</p>
            <p className="text-[13px] text-muted">Hold low-priority reminders during busy hours or meetings.</p>
          </div>
          <Toggle checked={on} onChange={(v) => set('focusProtection', v)} label="Focus protection" />
        </div>
        <div className={`mt-4 space-y-3 border-t border-white pt-4 transition-opacity duration-150 ${on ? '' : 'opacity-50'}`}>
          <CheckRow label="Avoid reminders during meetings" checked={settings.avoidMeetings} disabled={!on} onChange={(v) => set('avoidMeetings', v)} />
          <CheckRow label="Hold low-priority reminders while busy" checked={settings.holdLowWhileBusy} disabled={!on} onChange={(v) => set('holdLowWhileBusy', v)} />
          <CheckRow label="Group non-urgent reminders into summaries" checked={settings.groupNonUrgent} disabled={!on} onChange={(v) => set('groupNonUrgent', v)} />
        </div>
      </div>
    </SettingsSection>);

}