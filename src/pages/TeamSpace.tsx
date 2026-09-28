import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CheckIcon, ChevronDownIcon, InboxIcon, ListTodoIcon, UsersRoundIcon, Trash2Icon } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { MiniProgress } from '../components/MiniProgress';
import { QuickAdd } from '../components/QuickAdd';
import { ReminderRow } from '../components/ReminderRow';
import { priorityMeta } from '../data/priorities';
import { useProgress } from '../contexts/ProgressContext';
import { useSession } from '../contexts/SessionContext';
import { firstNameOf } from '../utils/validation';
import { NewReminderInput, Person, Reminder, Space } from '../types/reminders';
import { buildReminder, detectTimingHint, firstName } from '../utils/reminders';
import { createReminder, getReminders, getWorkspaceMembers, updateReminder, deleteReminder } from '../utils/api';

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
  const [members, setMembers] = useState<Person[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    let active = true;
    const workspaceId = workspace?.id;
    const workspaceMode = workspace?.mode;
    if (!workspaceId) {
      setReminders([]);
      return () => { active = false; };
    }
    const refresh = (showErrors: boolean) => {
      getReminders(workspaceId).then((items) => {
        if (active) setReminders(items);
      }).catch((error) => {
        if (active && showErrors) toast.error(error instanceof Error ? error.message : 'Could not load reminders.');
      });
      if (workspaceMode === 'team') {
        getWorkspaceMembers(workspaceId).then((items) => {
          if (active) setMembers(items);
        }).catch((error) => {
          if (active && showErrors) toast.error(error instanceof Error ? error.message : 'Could not load team members.');
        });
      } else {
        setMembers([]);
      }
    };
    refresh(true);
    const timer = window.setInterval(() => refresh(false), 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [workspace?.id, workspace?.mode]);

  const inSpace = reminders.filter((r) => r.space === space);
  const open = inSpace.
  filter((r) => r.status === 'open' && (space === 'personal' || filter === 'all' || r.assignee.isMe)).
  sort((a, b) => priorityMeta[a.priority].rank - priorityMeta[b.priority].rank);
  const done = inSpace.filter((r) => r.status === 'done');
  const dueToday = inSpace.filter((r) => r.status === 'open' && r.due === 'Today');
  const totalOpen = inSpace.filter((r) => r.status === 'open').length;
  const mineToday = inSpace.filter((r) => r.status === 'open' && r.assignee.isMe && r.due === 'Today').length;

  function update(id: string, patch: (r: Reminder) => Partial<Reminder>) {
    setReminders((list) => list.map((r) => r.id === id ? { ...r, ...patch(r) } : r));
  }

  async function handleCreate(input: NewReminderInput) {
    if (!workspace?.id) {
      toast.error('Your workspace is not connected. Select a workspace and try again.');
      return;
    }
    const assignedTo = input.assigneeId ? members.find((member) => member.id === input.assigneeId) : undefined;
    const reminder = buildReminder(input, space, user, assignedTo);
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

  async function handleDelete(id: string) {
    try {
      await deleteReminder(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete reminder.');
      return;
    }
    setReminders((current) => current.filter((r) => r.id !== id));
    toast('Reminder deleted');
  }

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const summary = [
    { label: 'Due today', value: dueToday.length, icon: CheckIcon },
    { label: 'Still open', value: totalOpen, icon: ListTodoIcon },
    { label: space === 'team' ? 'Teammates' : 'Completed', value: space === 'team' ? members.length : done.length, icon: UsersRoundIcon }
  ];

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-10">
      <header className="home-hero mb-7 text-white">
        <div className="px-5 py-6 sm:px-8 sm:py-7">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[#b8e6d5]">
                {format(new Date(), 'EEEE, d MMMM')} <span className="px-1.5 text-white/50" aria-hidden>·</span> {space === 'team' ? workspace?.name : 'Personal Space'}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">{greeting}, {userFirst}.</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
                {mineToday > 0 ? `${mineToday} reminder${mineToday === 1 ? '' : 's'} assigned to you today. Take them one at a time.` : 'No reminders pressing for attention today. Take the day one thing at a time.'}
              </p>
            </div>
            <Mascot mood="wave" size={104} className="hidden shrink-0 sm:block" />
          </div>

          <div className="mt-6 grid grid-cols-3 border-t border-white/20 pt-4" aria-label="Today summary">
            {summary.map(({ label, value, icon: Icon }, index) =>
              <div key={label} className={`flex items-center gap-2.5 px-2 first:pl-0 sm:gap-3 ${index > 0 ? 'border-l border-white/20 pl-4 sm:pl-6' : ''}`}>
                <Icon className="hidden h-4 w-4 shrink-0 text-[#b8e6d5] sm:block" aria-hidden />
                <div>
                  <p className="text-xl font-extrabold leading-none text-white sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[11px] font-semibold text-white/65 sm:text-xs">{label}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <QuickAdd onCreate={handleCreate} assignees={space === 'team' ? members : []} canAssignOthers={space === 'team' && workspace?.role === 'admin'} />

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
                
                    <ReminderRow reminder={r} onPoke={handlePoke} onDone={handleDone} onComment={handleComment} onDelete={handleDelete} />
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
              <li key={r.id} className="group flex items-center gap-2 text-[13px] text-muted">
                      <CheckIcon className="h-3.5 w-3.5 text-low" aria-hidden />
                      <span className="line-through">{r.title}</span>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this reminder?')) {
                            handleDelete(r.id);
                          }
                        }}
                        className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500"
                        aria-label="Delete Reminder"
                      >
                        <Trash2Icon className="h-3 w-3" />
                      </button>
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