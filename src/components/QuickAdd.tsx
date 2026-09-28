import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { PlusIcon, SparklesIcon } from 'lucide-react';
import { NewReminderInput, Person, Priority } from '../types/reminders';
import { parseReminder, ParsedReminder } from '../utils/parseReminder';
import { FormField, inputClass } from './FormField';
import { Mascot } from './Mascot';
import { PriorityPicker } from './PriorityPicker';

interface QuickAddProps {
  onCreate: (input: NewReminderInput) => void;
  assignees?: Person[];
  canAssignOthers?: boolean;
}

const ease = [0.23, 1, 0.32, 1] as const;

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateForDueLabel(label: string) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (label.toLowerCase() === 'tomorrow') {
    date.setDate(date.getDate() + 1);
    return toDateInputValue(date);
  }
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const weekday = weekdays.indexOf(label.toLowerCase());
  if (weekday >= 0) date.setDate(date.getDate() + (weekday - date.getDay() + 7) % 7);
  return toDateInputValue(date);
}

function dateLabel(dateValue: string) {
  if (!dateValue) return 'AI picks';
  const [year, month, day] = dateValue.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return format(date, 'EEE, MMM d');
}

function timeForPeriod(period: string | null) {
  if (!period) return '09:00';
  const value = period.toLowerCase();
  if (value.includes('evening') || value.includes('tonight')) return '18:00';
  if (value.includes('afternoon')) return '14:00';
  if (value.includes('lunch')) return '12:30';
  return '09:00';
}

export function QuickAdd({ onCreate, assignees = [], canAssignOthers = false }: QuickAddProps) {
  const [mode, setMode] = useState<'natural' | 'form'>('natural');
  const [text, setText] = useState('');
  const [draft, setDraft] = useState<ParsedReminder | null>(null);
  const [activity, setActivity] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(() => toDateInputValue(new Date()));
  const [dueTime, setDueTime] = useState('09:00');
  const [note, setNote] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const hasAssigneeChoices = canAssignOthers && assignees.length > 1;
  const selectedAssigneeId = assignees.some((person) => person.id === assigneeId) ? assigneeId : assignees.find((person) => person.isMe)?.id ?? '';
  const assigneeField = hasAssigneeChoices ?
    <FormField label="Assign to" htmlFor="qa-assignee">
      <select id="qa-assignee" value={selectedAssigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={inputClass}>
        {assignees.map((person) => <option key={person.id} value={person.id}>{person.name}{person.isMe ? ' (you)' : ''}</option>)}
      </select>
    </FormField> : null;

  function organise(value: string = text) {
    if (!value.trim()) return;
    const parsed = parseReminder(value);
    setDraft(parsed);
    if (canAssignOthers) {
      const match = assignees.find((person) => person.name.split(/\s+/)[0].toLowerCase() === parsed.forWhom.toLowerCase());
      setAssigneeId(parsed.forWhom === 'Me' ? assignees.find((person) => person.isMe)?.id ?? '' : match?.id ?? assignees.find((person) => person.isMe)?.id ?? '');
    }
    setDueDate(dateForDueLabel(parsed.due));
    setDueTime(timeForPeriod(parsed.period));
  }

  function saveDraft() {
    if (!draft || !dueDate || !dueTime) return;
    onCreate({
      title: draft.title,
      priority: draft.priority,
      forWhom: draft.forWhom,
      assigneeId: selectedAssigneeId,
      due: dateLabel(dueDate),
      dueDate,
      dueTime,
      period: draft.period,
      note: ''
    });
    setDraft(null);
    setText('');
  }

  function saveForm(e: React.FormEvent) {
    e.preventDefault();
    if (!activity.trim() || !dueDate || !dueTime) return;
    onCreate({
      title: activity.trim(),
      priority,
      forWhom: 'Me',
      assigneeId: selectedAssigneeId,
      due: dateLabel(dueDate),
      dueDate,
      dueTime,
      period: null,
      note: note.trim()
    });
    setActivity('');
    setNote('');
    setDueDate(toDateInputValue(new Date()));
    setDueTime('09:00');
  }

  return (
    <section aria-label="Add a reminder" className="rounded-3xl bg-surface shadow-card ring-1 ring-white">
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <div role="tablist" aria-label="Add mode" className="inline-flex rounded-lg bg-canvas p-0.5">
          {[
          { id: 'natural' as const, label: 'Just say it' },
          { id: 'form' as const, label: 'Quick form' }].
          map((m) =>
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`whitespace-nowrap rounded-md px-3 py-1 text-[13px] transition-colors duration-150 ${
            mode === m.id ? 'bg-surface font-medium text-ink shadow-card' : 'text-muted hover:text-ink'}`
            }>
            
              {m.label}
            </button>
          )}
        </div>
        <p className="hidden text-xs text-subtle sm:block">Tell it naturally. I’ll organise the rest.</p>
      </div>

      {mode === 'natural' ?
      <>
          <form
          onSubmit={(e) => {
            e.preventDefault();
            organise();
          }}
          className="flex items-center gap-2 p-3">
          
            <label htmlFor="nl-input" className="sr-only">Describe your reminder</label>
            <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full bg-white py-1.5 pl-2 pr-1.5 ring-2 ring-lavender-soft focus-within:ring-lavender">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lavender-soft">
                <Mascot mood="wave" size={34} float={false} />
              </span>
              <input
              id="nl-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you need to remember?"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-subtle focus:outline-none" />
            </div>
            <button
            type="submit"
            disabled={!text.trim()}
            className="shrink-0 whitespace-nowrap rounded-full bg-accent px-5 py-3.5 text-sm font-extrabold text-white shadow-pop transition-[background-color,transform] duration-150 hover:bg-accent-ink active:scale-95 disabled:opacity-40 disabled:shadow-none">
            
              Organise
            </button>
          </form>

          <AnimatePresence initial={false}>
            {draft &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease }}
            className="overflow-hidden">
            
                <div className="border-t border-line px-4 py-4">
                  <p className="text-[13px] text-muted">Here’s what I understood</p>
                  <div className={`mt-3 grid gap-4 sm:grid-cols-2 ${hasAssigneeChoices ? 'lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]' : 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'}`}>
                    <FormField label="Activity" htmlFor="draft-title">
                      <input
                    id="draft-title"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className={inputClass} />
                  
                    </FormField>
                    <FormField label="Date" htmlFor="draft-date">
                      <input id="draft-date" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Time" htmlFor="draft-time">
                      <input id="draft-time" type="time" required value={dueTime} onChange={(e) => setDueTime(e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Priority">
                      <PriorityPicker value={draft.priority} onChange={(p) => setDraft({ ...draft, priority: p })} />
                    </FormField>
                    {assigneeField}
                  </div>
                  {draft.suggestion &&
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-[13px] text-accent-ink">
                      <SparklesIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="flex-1">{draft.suggestion}</span>
                      {draft.priority !== draft.suggestedPriority &&
                <button
                  onClick={() => setDraft({ ...draft, priority: draft.suggestedPriority })}
                  className="font-medium underline-offset-2 hover:underline">
                  
                          Apply
                        </button>
                }
                    </div>
              }
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                  onClick={() => setDraft(null)}
                  className="rounded-lg px-3 py-2 text-sm text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
                  
                      Cancel
                    </button>
                    <button
                  onClick={saveDraft}
                  disabled={!dueDate || !dueTime}
                  className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90">
                  
                      Save reminder
                    </button>
                  </div>
                </div>
              </motion.div>
          }
          </AnimatePresence>
        </> :

      <form onSubmit={saveForm} className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_auto_minmax(0,1fr)]">
          <FormField label="Activity" htmlFor="qa-activity">
            <input
            id="qa-activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="Check login patch"
            className={inputClass} />
          
          </FormField>
          <FormField label="Priority">
            <PriorityPicker value={priority} onChange={setPriority} />
          </FormField>
          <FormField label="Date" htmlFor="qa-date">
            <input id="qa-date" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Time" htmlFor="qa-time">
            <input id="qa-time" type="time" required value={dueTime} onChange={(e) => setDueTime(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Note (optional)" htmlFor="qa-note">
            <input
            id="qa-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Please check after deployment"
            className={inputClass} />
          
          </FormField>
          {assigneeField}
          <div className="flex items-end">
            <button
            type="submit"
            disabled={!activity.trim()}
            className="flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-40">
            
              <PlusIcon className="h-4 w-4" aria-hidden />
              Create
            </button>
          </div>
        </form>
      }
    </section>);

}