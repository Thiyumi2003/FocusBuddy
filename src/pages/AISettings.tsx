import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRightIcon, LockIcon, RotateCcwIcon, SparklesIcon } from 'lucide-react';
import { BehaviourSection } from '../components/settings/BehaviourSection';
import { MotivationSection } from '../components/settings/MotivationSection';
import { PokeSection } from '../components/settings/PokeSection';
import { ReminderStyleSection } from '../components/settings/ReminderStyleSection';
import { WorkingHoursSection } from '../components/settings/WorkingHoursSection';
import { WorkloadSection } from '../components/settings/WorkloadSection';
import { useSession } from '../contexts/SessionContext';
import { recommendedSettings, settingsSections } from '../data/aiSettings';
import { AISettings as AISettingsType, SettingsUpdater } from '../types/settings';
import { getAISettings, saveAISettings } from '../utils/api';

const layers = ['Team defaults', 'Your preferences', 'AI learning', 'Smart reminder decision'];

export function AISettings() {
  const { workspace } = useSession();
  const [settings, setSettings] = useState<AISettingsType>(recommendedSettings);
  const [loaded, setLoaded] = useState(false);
  const isRecommended = JSON.stringify(settings) === JSON.stringify(recommendedSettings);

  useEffect(() => {
    let active = true;
    getAISettings<AISettingsType>().then((saved) => {
      if (active && saved) setSettings({ ...recommendedSettings, ...saved });
    }).catch(() => undefined).finally(() => {
      if (active) setLoaded(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => {
      saveAISettings(settings).catch(() => toast.error('Could not save AI settings.'));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loaded, settings]);

  const set: SettingsUpdater = useCallback((key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  function restore() {
    setSettings(recommendedSettings);
    toast('Recommended settings restored', { description: 'I’ll keep learning when you prefer to work as we go.' });
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">Personal AI Settings</h1>
          <p className="mt-1 text-sm text-muted">Guide the AI. You don’t need to configure all of it by hand.</p>
        </div>
        <p className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-[13px] text-muted ring-1 ring-line">
          <LockIcon className="h-3.5 w-3.5" aria-hidden />
          Personal. Team admins can’t view or change these.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-accent-soft p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-sm font-medium text-accent-ink">
              {isRecommended ? 'You’re all set with recommended settings.' : 'You’ve customised your AI.'}
            </p>
            <p className="mt-0.5 text-[13px] text-accent-ink/80">I’ll learn when you prefer to work as we go. Everything saves automatically.</p>
          </div>
        </div>
        {!isRecommended &&
        <button
          onClick={restore}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-surface px-3 py-2 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-canvas">
          
            <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden />
            Use recommended settings
          </button>
        }
      </div>

      <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="hidden lg:block">
          <ul className="sticky top-8 space-y-0.5">
            {settingsSections.map((s) =>
            <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-md px-2.5 py-1.5 text-[13px] text-muted transition-colors duration-150 hover:bg-surface hover:text-ink">
                  {s.label}
                </a>
              </li>
            )}
          </ul>
        </nav>

        <div className="min-w-0">
          <section aria-labelledby="layers-title" className="mb-10 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h2 id="layers-title" className="text-sm font-semibold text-ink">How each reminder is decided</h2>
            <ol className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              {layers.map((layer, i) =>
              <li key={layer} className="flex items-center gap-2 sm:flex-1">
                  <span
                  className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-center text-[13px] font-medium ${
                  i === 1 ? 'bg-ink text-white' : i === layers.length - 1 ? 'bg-accent-soft text-accent-ink' : 'bg-canvas text-ink'}`
                  }>
                  
                    {layer}
                  </span>
                  {i < layers.length - 1 && <ArrowRightIcon className="hidden h-3.5 w-3.5 shrink-0 text-subtle sm:block" aria-hidden />}
                </li>
              )}
            </ol>
            {workspace?.mode === 'team' && <p className="mt-4 border-t border-line pt-4 text-xs text-muted">Personal settings are private to your account.</p>}
          </section>

          <WorkingHoursSection settings={settings} set={set} />
          <BehaviourSection settings={settings} set={set} />
          <ReminderStyleSection settings={settings} set={set} />
          <PokeSection settings={settings} set={set} />
          <WorkloadSection settings={settings} set={set} />
          <MotivationSection settings={settings} set={set} />
        </div>
      </div>
    </div>);

}