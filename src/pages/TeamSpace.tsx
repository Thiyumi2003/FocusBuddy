import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CheckIcon, ChevronDownIcon, InboxIcon } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { MiniProgress } from '../components/MiniProgress';
import { QuickAdd } from '../components/QuickAdd';
import { ReminderRow } from '../components/ReminderRow';
import { priorityMeta } from '../data/priorities';
import { useProgress } from '../contexts/ProgressContext';
import { useSession } from '../contexts/SessionContext';
import { firstNameOf } from '../utils/validation';
import { NewReminderInput, Reminder, Space } from '../types/reminders';
import { buildReminder, detectTimingHint, firstName } from '../utils/reminders';
import { createReminder, getReminders, updateReminder } from '../utils/api';

interface TeamSpaceProps {
  space: Space;
  onOpenProgress: () => void;
}

type Filter = 'all' | 'mine';

const ease = [0.23, 1, 0.32, 1] as const;

export function TeamSpace({ space, onOpenProgress }: TeamSpaceProps) {
  const { completeReminder } = useProgress();
  const { user, workspace } = useSession();
  const userFirst = user ? firstNameOf(user.name) : 'there';
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    let active = true;
    if (!workspace?.id) {
      setReminders([]);
      return () => { active = false; };
    }
    getReminders(workspace.id).then((items) => {
      if (active) setReminders(items);
    }).catch((error) => {
      if (active) toast.error(error instanceof Error ? error.message : 'Could not load reminders.');
    });
    return () => { active = false; };
  }, [workspace?.id]);

  const inSpace = reminders.filter((r) => r.space === space);
  const open = inSpace.
  filter((r) => r.status === 'open' && (space === 'personal' || filter === 'all' || r.assignee.isMe)).
  sort((a, b) => priorityMeta[a.priority].rank - priorityMeta[b.priority].rank);
  const done = inSpace.filter((r) => r.status === 'done');
  const mineToday = inSpace.filter((r) => r.status === 'open' && r.assignee.isMe && r.due === 'Today').length;

  function update(id: string, patch: (r: Reminder) => Partial<Reminder>) {
    setReminders((list) => list.map((r) => r.id === id ? { ...r, ...patch(r) } : r));
  }

  async function handleCreate(input: NewReminderInput) {
    if (!workspace?.id) {
      toast.error('Your workspace is not connected. Select a workspace and try again.');
      return;
    }
    const reminder = buildReminder(input, space, user);
    try {
      const saved = await createReminder(workspace.id, space, input, reminder.assignee);
      setReminders((list) => [saved, ...list]);
      toast('Reminder saved', {
        description: reminder.assignee.isMe ?
        'I’ll find the right moment to bring it up.' :
        `${firstName(reminder.assignee.name)} will see it when they have some breathing room.`
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save this reminder. Please try again.');
    }
  }

  async function handlePoke(id: string) {
    const r = reminders.find((x) => x.id === id);
    if (!r) return;
    try {
      await updateReminder(id, { pokes: r.pokes + 1, pokedByMe: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save poke.');
      return;
    }
    update(id, (x) => ({ pokes: x.pokes + 1, pokedByMe: true }));
    toast(`You poked ${firstName(r.assignee.name)} 👋`, {
      description: 'I won’t interrupt them mid-focus. They’ll get it at their next good moment.'
    });
  }

  async function handleDone(id: string) {
    const r = reminders.find((x) => x.id === id);
    if (!r) return;
    try {
      await updateReminder(id, { status: 'done' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save reminder status.');
      return;
    }
    update(id, () => ({ status: 'done' }));
    if (r.assignee.isMe) completeReminder(r.priority, r.title);
    toast(`Marked done for ${firstName(r.assignee.name)}`);
  }

  async function handleComment(id: string, text: string) {
    const r = reminders.find((x) => x.id === id);
    if (!r) return;
    const hint = detectTimingHint(text);
    const comments = [...r.comments, { id: `c-${Date.now()}`, author: user?.name ?? 'You', role: 'Member', text, time: 'Just now' }];
    const aiNote = hint ? `Got it. I’ll remind ${r.assignee.isMe ? 'you' : firstName(r.assignee.name)} ${hint}.` : r.aiNote;
    try {
      await updateReminder(id, { comments, aiNote });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save comment.');
      return;
    }
    update(id, () => ({
      comments,
      aiNote
    }));
    if (hint) toast('Reminder adjusted', { description: `Understood “${hint}”, so the timing moved.` });
  }

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-6 flex items-center gap-4">
        <Mascot mood="wave" size={72} className="hidden shrink-0 sm:block" />
        <div>
        <p className="text-[13px] font-semibold text-muted">
          {format(new Date(), 'EEEE, d MMMM')} · {space === 'team' ? workspace?.name : 'Personal Space'}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">{greeting}, {userFirst} 👋</h1>
        <p className="mt-1 text-sm text-muted">
          {mineToday > 0 ? `${mineToday} thing${mineToday > 1 ? 's' : ''} need you today. ` : 'Nothing urgent needs you today. '}
          I’ll pick the moments.
        </p>
        </div>
      </header>

      <QuickAdd onCreate={handleCreate} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="list-title">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="list-title" className="text-base font-semibold text-ink">
              {space === 'team' ? 'Team reminders' : 'Today’s reminders'}
              <span className="ml-2 text-sm font-normal text-muted">{open.length}</span>
            </h2>
            {space === 'team' &&
            <div role="tablist" aria-label="Filter reminders" className="inline-flex rounded-lg bg-surface p-0.5 shadow-card ring-1 ring-line">
                {[
              { id: 'all' as Filter, label: 'Everyone' },
              { id: 'mine' as Filter, label: 'Assigned to me' }].
              map((f) =>
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`whitespace-nowrap rounded-md px-3 py-1 text-[13px] transition-colors duration-150 ${
                filter === f.id ? 'bg-canvas font-medium text-ink' : 'text-muted hover:text-ink'}`
                }>
                
                    {f.label}
                  </button>
              )}
              </div>
            }
          </div>

          {open.length === 0 ?
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
              <InboxIcon className="h-6 w-6 text-subtle" aria-hidden />
              <p className="mt-3 text-sm font-medium text-ink">All clear</p>
              <p className="mt-1 text-[13px] text-muted">Nothing waiting on you. Add something above whenever it comes up.</p>
            </div> :

          <ul className="grid gap-4 2xl:grid-cols-2">
              <AnimatePresence initial={false}>
                {open.map((r) =>
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease }}>
                
                    <ReminderRow reminder={r} onPoke={handlePoke} onDone={handleDone} onComment={handleComment} />
                  </motion.li>
              )}
              </AnimatePresence>
            </ul>
          }

          {done.length > 0 &&
          <div className="mt-4">
              <button
              onClick={() => setShowDone((s) => !s)}
              aria-expanded={showDone}
              className="flex items-center gap-1.5 text-[13px] text-muted transition-colors duration-150 hover:text-ink">
              
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showDone ? 'rotate-180' : ''}`} aria-hidden />
                Completed today ({done.length})
              </button>
              {showDone &&
            <ul className="mt-2 space-y-1.5 pl-6">
                  {done.map((r) =>
              <li key={r.id} className="flex items-center gap-2 text-[13px] text-muted">
                      <CheckIcon className="h-3.5 w-3.5 text-low" aria-hidden />
                      <span className="line-through">{r.title}</span>
                    </li>
              )}
                </ul>
            }
            </div>
          }
        </section>

        <aside className="space-y-5" aria-label="Assistant and progress">
          <MiniProgress onOpen={onOpenProgress} />
        </aside>
      </div>
    </div>);

}