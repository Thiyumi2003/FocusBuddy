import React from 'react';
import { PointerIcon, SparklesIcon } from 'lucide-react';
import { AISettings, PokeAudience, PokeDelivery, SettingsUpdater } from '../../types/settings';
import { CheckRow } from './CheckRow';
import { ChoiceGroup } from './ChoiceGroup';
import { SettingsSection } from './SettingsSection';

export function PokeSection({ settings, set }: {settings: AISettings;set: SettingsUpdater;}) {
  const off = !settings.allowPokes || settings.pokeAudience === 'nobody';

  return (
    <SettingsSection id="poke" title="Poke" description="A poke keeps the human intention. I control when it actually interrupts you.">
      <ChoiceGroup<PokeAudience>
        label="Who can poke me"
        value={settings.allowPokes ? settings.pokeAudience : 'nobody'}
        onChange={(v) => {
          set('pokeAudience', v);
          set('allowPokes', v !== 'nobody');
        }}
        options={[
        { value: 'team', label: 'My team members' },
        { value: 'selected', label: 'Selected members' },
        { value: 'nobody', label: 'Nobody' }]
        } />
      
      <div className={`space-y-5 transition-opacity duration-150 ${off ? 'pointer-events-none opacity-50' : ''}`}>
        <ChoiceGroup<PokeDelivery>
          label="When I’m poked"
          value={settings.pokeDelivery}
          onChange={(v) => set('pokeDelivery', v)}
          options={[
          { value: 'ai', label: 'Let AI choose when' },
          { value: 'immediate', label: 'Notify immediately' }]
          } />
        
        <div className="space-y-3">
          <CheckRow label="Don’t allow notification spam" checked={settings.preventPokeSpam} onChange={(v) => set('preventPokeSpam', v)} />
          <CheckRow label="Combine multiple pokes into one" checked={settings.combinePokes} onChange={(v) => set('combinePokes', v)} />
        </div>
        <div className="rounded-xl bg-canvas p-4">
          <p className="flex items-center gap-2 text-sm text-ink">
            <PointerIcon className="h-4 w-4 text-accent" aria-hidden />
            <span>A teammate poked a reminder{settings.combinePokes ? ' (combined)' : ''}</span>
          </p>
          <p className="mt-1.5 flex items-start gap-2 text-[13px] text-muted">
            <SparklesIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
            {settings.pokeDelivery === 'ai' ?
            'You received a poke 👋 I’ll remind you when you have some breathing room.' :
            'Delivered right away, even during focus time.'}
          </p>
        </div>
      </div>
    </SettingsSection>);

}