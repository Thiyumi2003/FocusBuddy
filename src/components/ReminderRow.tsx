import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarIcon, CheckIcon, HandIcon, MessageCircleIcon, PointerIcon, SendIcon, SparklesIcon, StarIcon } from 'lucide-react';
import { priorityMeta } from '../data/priorities';
import { Priority, Reminder } from '../types/reminders';
import { firstName } from '../utils/reminders';
import { Avatar } from './Avatar';
import { PriorityBadge } from './PriorityBadge';
import { useSession } from '../contexts/SessionContext';

interface ReminderRowProps {
  reminder: Reminder;
  onPoke: (id: string) => void;
  onDone: (id: string) => void;
  onComment: (id: string, text: string) => void;
}

const tint: Record<Priority, string> = {
  high: 'bg-pink-soft',
  medium: 'bg-peach-soft',
  low: 'bg-mint-soft'
};

const ease = [0.23, 1, 0.32, 1] as const;

export function ReminderRow({ reminder, onPoke, onDone, onComment }: ReminderRowProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const { assignee, comments } = reminder;
  const { user } = useSession();
  const stars = priorityMeta[reminder.priority].stars;
  const latest = comments[comments.length - 1];
  const visible = open ? comments : latest ? [latest] : [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    onComment(reminder.id, draft.trim());
    setDraft('');
  }

  return (
    <article className={`rounded-3xl p-5 shadow-card ring-1 ring-white ${tint[reminder.priority]}`}>
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={reminder.priority} />
        <span className={`inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold ${reminder.due === 'Today' ? 'text-high-ink' : 'text-muted'}`}>
          <CalendarIcon className="h-3.5 w-3.5" aria-hidden />
          {reminder.due}{reminder.dueTime ? ` · ${reminder.dueTime}` : ''}
        </span>
        {reminder.pokedBy &&
        <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-accent-ink">
            <HandIcon className="h-3.5 w-3.5" aria-hidden />
            Poked by {reminder.pokedBy}
          </span>
        }
        {reminder.source && <span className="ml-auto text-xs font-semibold text-muted">from {reminder.source}</span>}
      </div>

      <h3 className="mt-3 text-[17px] font-extrabold leading-snug text-ink">{reminder.title}</h3>

      <div className="mt-3 flex items-center gap-2.5">
        <Avatar person={assignee} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{assignee.isMe ? 'You' : firstName(assignee.name)}</p>
        </div>
      </div>

      {reminder.aiNote &&
      <p className="mt-3 flex items-start gap-1.5 text-[13px] font-semibold text-accent-ink">
          <SparklesIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-lavender" aria-hidden />
          {reminder.aiNote}
        </p>
      }

      {visible.length > 0 &&
      <ul className="mt-3 space-y-2">
          <AnimatePresence initial={false}>
            {visible.map((c) =>
          <motion.li
            key={c.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease }}
            className={`flex ${c.author === user?.name ? 'justify-end' : 'justify-start'}`}>
            
                <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] ${
              c.author === user?.name ? 'rounded-br-md bg-accent text-white' : 'rounded-bl-md bg-white text-ink'}`
              }>
              
                  <span className="font-extrabold">{c.role}: </span>
                  {c.text}
                </div>
              </motion.li>
          )}
          </AnimatePresence>
        </ul>
      }

      <AnimatePresence initial={false}>
        {open &&
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease }}
          className="overflow-hidden">
          
            <div className="mt-2 flex items-center gap-2 pt-1">
              <label htmlFor={`comment-${reminder.id}`} className="sr-only">Add a comment</label>
              <input
              id={`comment-${reminder.id}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="“I’ll check after the deployment”"
              className="min-w-0 flex-1 rounded-full border-0 bg-white px-4 py-2 text-[13px] text-ink placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/30" />
            
              <button type="submit" disabled={!draft.trim()} aria-label="Send comment" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-accent transition-transform duration-150 active:scale-90 disabled:opacity-40">
                <SendIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.form>
        }
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold text-muted transition-colors duration-150 hover:bg-white/70 hover:text-ink">
          
          <MessageCircleIcon className="h-4 w-4" aria-hidden />
          {open ? 'Hide chat' : comments.length > 1 ? `${comments.length} messages` : comments.length ? 'Reply' : 'Chat'}
        </button>
        <div className="ml-auto flex items-center gap-2">
          {!assignee.isMe &&
          <motion.button
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.12 }}
            onClick={() => onPoke(reminder.id)}
            disabled={reminder.pokedByMe}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-extrabold text-accent-ink shadow-card transition-colors duration-150 hover:bg-accent-soft disabled:bg-white/60 disabled:text-muted disabled:shadow-none">
            
              <PointerIcon className="h-4 w-4" aria-hidden />
              {reminder.pokedByMe ? 'Poked!' : 'Poke'}
            </motion.button>
          }
          <motion.button
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.12 }}
            onClick={() => onDone(reminder.id)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 py-2 text-sm font-extrabold text-white shadow-pop transition-colors duration-150 hover:bg-accent-ink">
            
            <CheckIcon className="h-4 w-4" strokeWidth={3} aria-hidden />
            Mark as Done
            {assignee.isMe &&
            <span className="inline-flex items-center gap-0.5 rounded-full bg-white/25 px-1.5 text-xs" aria-label={`earns ${stars} stars`}>
                +{stars}
                <StarIcon className="h-3 w-3 fill-star text-star" aria-hidden />
              </span>
            }
          </motion.button>
        </div>
      </div>
    </article>);

}