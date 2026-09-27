import { NewReminderInput, Person, Reminder, Space } from '../types/reminders';
import { SessionUser } from '../types/session';

export function firstName(name: string): string {
  return name.split(' ')[0];
}

export function resolvePerson(user?: SessionUser | null): Person {
  const name = user?.name ?? 'You';
  return {
    id: user?.id ?? user?.email ?? 'current-user',
    name,
    initials: name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    role: 'Member',
    isMe: true
  };
}

export function buildReminder(input: NewReminderInput, space: Space, user?: SessionUser | null): Reminder {
  const assignee = resolvePerson(user);
  const when = input.period ? input.period.toLowerCase() : input.due.toLowerCase();
  return {
    id: `r-${Date.now()}`,
    space,
    title: input.title,
    priority: input.priority,
    assignee,
    due: input.due,
    dueDate: input.dueDate,
    dueTime: input.dueTime,
    pokes: 0,
    status: 'open',
    aiNote:
    input.due === 'AI picks' ?
    'I’ll find the right moment for this.' :
    `I’ll pick the best moment ${input.period ? when : `for ${when}`}.`,
    comments: input.note ?
    [{ id: `c-${Date.now()}`, author: user?.name ?? 'You', role: 'Member', text: input.note, time: 'Just now' }] :
    []
  };
}

export function detectTimingHint(text: string): string | null {
  const match = text.match(/\bafter (?:the )?(deployment|lunch|meeting|standup|release|demo)\b/i);
  return match ? `after the ${match[1].toLowerCase()}` : null;
}