import React from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import { AISettings, FunMode, SettingsUpdater } from '../../types/settings';
import { CheckRow } from './CheckRow';
import { ChoiceGroup } from './ChoiceGroup';
import { SettingsSection } from './SettingsSection';
import { ToggleRow } from './ToggleRow';

export function MotivationSection({ settings, set }: {settings: AISettings;set: SettingsUpdater;}) {
  const { funMode, setFunMode, showAnimations, setShowAnimations } = useProgress();

  return (
    <>
      <SettingsSection id="motivation" title="Motivation" description="Keep it light. Progress stays private to you.">
        <ToggleRow title="Stars & achievements" description="Earn stars by completing reminders." checked={settings.starsEnabled} onChange={(v) => set('starsEnabled', v)} />
        <ChoiceGroup<FunMode>
          label="Fun mode"
          value={funMode}
          onChange={setFunMode}
          options={[
          { value: 'minimal', label: 'Minimal' },
          { value: 'balanced', label: 'Balanced' },
          { value: 'fun', label: 'Fun' }]
          } />
        
        <p className="-mt-2 text-[13px] text-muted">
          {funMode === 'minimal' && 'Quiet confirmations only. Good for work settings.'}
          {funMode === 'balanced' && 'Small star moments and weekly counts.'}
          {funMode === 'fun' && 'Full celebrations, great for students and personal goals.'}
        </p>
        <div className="space-y-3">
          <CheckRow label="Show my progress on the dashboard" checked={settings.showProgress} onChange={(v) => set('showProgress', v)} />
          <CheckRow label="Show achievement animations" checked={showAnimations} onChange={setShowAnimations} />
        </div>
      </SettingsSection>

      <SettingsSection id="missed" title="Missed reminders" description="Don’t pressure me. Help me recover. Earned stars are never removed.">
        <div className="space-y-3">
          <CheckRow label="Ask me to reschedule" checked={settings.missedAskReschedule} onChange={(v) => set('missedAskReschedule', v)} />
          <CheckRow label="Suggest a new time using AI" checked={settings.missedSuggestTime} onChange={(v) => set('missedSuggestTime', v)} />
          <CheckRow label="Show missed reminders on my dashboard (privately)" checked={settings.missedShowOnDashboard} onChange={(v) => set('missedShowOnDashboard', v)} />
          <CheckRow label="Give Recovery Stars when completed later" checked={settings.missedRecoveryStars} onChange={(v) => set('missedRecoveryStars', v)} />
        </div>
      </SettingsSection>
    </>);

}