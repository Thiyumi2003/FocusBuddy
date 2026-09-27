import React from "react";
import { toast } from "sonner";
import { CalendarDaysIcon, CheckIcon, MessagesSquareIcon, PlusIcon, SquareKanbanIcon, BoxIcon } from "lucide-react";
import { AISettings, SettingsUpdater } from "../../types/settings";
import { CheckRow } from "./CheckRow";
import { SettingsSection } from "./SettingsSection";
type ConnectionKey = 'connectCalendar' | 'connectJira' | 'connectTeams';
const services: {
  key: ConnectionKey;
  name: string;
  detail: string;
  icon: BoxIcon;
  tone: string;
}[] = [{
  key: 'connectCalendar',
  name: 'Calendar',
  detail: 'Meetings & free time',
  icon: CalendarDaysIcon,
  tone: 'bg-mint-soft text-mint-ink'
}, {
  key: 'connectJira',
  name: 'Jira',
  detail: 'Tickets on your plate',
  icon: SquareKanbanIcon,
  tone: 'bg-lavender-soft text-lavender-ink'
}, {
  key: 'connectTeams',
  name: 'Teams',
  detail: 'Calls & presence',
  icon: MessagesSquareIcon,
  tone: 'bg-pink-soft text-pink-ink'
}];
export function WorkloadSection({
  settings,
  set



}: {settings: AISettings;set: SettingsUpdater;}) {
  return <SettingsSection id="workload" title="Workload integrations" description="Optional. Connected activity helps me avoid interrupting you when you’re busy. Reminders still work without it, even offline.">
      <div className="grid gap-3 sm:grid-cols-3">
        {services.map(({
        key,
        name,
        detail,
        icon: Icon,
        tone
      }) => {
        const connected = settings[key];
        return <button key={key} type="button" aria-pressed={connected} onClick={() => {
          set(key, !connected);
          toast(connected ? `${name} disconnected` : `${name} connected 🎉`);
        }} className={`flex flex-col items-start rounded-3xl p-4 text-left ring-1 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 active:scale-[0.98] ${connected ? 'bg-white shadow-card ring-white' : 'bg-white/60 ring-line'}`}>
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="mt-3 text-sm font-black text-ink">{name}</span>
              <span className="text-xs text-muted">{detail}</span>
              <span className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${connected ? 'bg-mint-soft text-mint-ink' : 'bg-canvas text-muted'}`}>
                {connected ? <CheckIcon className="h-3 w-3" strokeWidth={3} aria-hidden /> : <PlusIcon className="h-3 w-3" strokeWidth={3} aria-hidden />}
                {connected ? 'Connected' : 'Connect'}
              </span>
            </button>;
      })}
      </div>
      <div className="space-y-3">
        <CheckRow label="Use calendar availability" checked={settings.useCalendar} onChange={(v) => set('useCalendar', v)} />
        <CheckRow label="Consider current workload" checked={settings.considerWorkload} onChange={(v) => set('considerWorkload', v)} />
        <CheckRow label="Protect focus periods" checked={settings.protectFocus} onChange={(v) => set('protectFocus', v)} />
      </div>
    </SettingsSection>;
}