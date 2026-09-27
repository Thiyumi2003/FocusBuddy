import { Priority } from '../types/reminders';
import { priorityMeta } from '../data/priorities';

export interface ParsedReminder {
  title: string;
  forWhom: string;
  due: string;
  period: string | null;
  priority: Priority;
  suggestedPriority: Priority;
  priorityWasStated: boolean;
  suggestion: string | null;
}

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const URGENT = /\b(submit|deadline|exam|urgent|payment|release|bug|patch)\b/i;
const PERIOD =
/\b(after lunch|after (?:the )?deployment|after (?:the )?meeting|this morning|this afternoon|this evening|tonight|in the morning|in the afternoon|in the evening|morning|afternoon|evening)\b/i;

export function parseReminder(input: string): ParsedReminder {
  let text = input.trim().replace(/[.!?]+$/, '');
  let forWhom = 'Me';

  const who = text.match(/^(?:please\s+)?remind\s+(\w+)\s+(?:to\s+)?/i);
  if (who) {
    forWhom = who[1].toLowerCase() === 'me' ? 'Me' : capitalize(who[1]);
    text = text.slice(who[0].length);
  }

  let stated: Priority | null = null;
  const pr = text.match(/[,\s]*\b(high|medium|low)\s+priority\b/i);
  if (pr) {
    stated = pr[1].toLowerCase() as Priority;
    text = text.replace(pr[0], '');
  }

  let period: string | null = null;
  let periodImpliesToday = false;
  const per = text.match(PERIOD);
  if (per) {
    const raw = per[1].toLowerCase();
    periodImpliesToday = raw.startsWith('this') || raw === 'tonight';
    period = capitalize(raw.replace(/^(this|in the) /, '').replace('the ', ''));
    text = text.replace(per[0], '');
  }

  let due = 'AI picks';
  if (/\btoday\b/i.test(text)) {
    due = 'Today';
    text = text.replace(/\btoday\b/i, '');
  } else if (/\btomorrow\b/i.test(text)) {
    due = 'Tomorrow';
    text = text.replace(/\btomorrow\b/i, '');
  } else {
    const day = WEEKDAYS.find((d) => new RegExp(`\\b${d}\\b`, 'i').test(text));
    if (day) {
      due = capitalize(day);
      text = text.replace(new RegExp(`\\b(?:on |by |this )?${day}\\b`, 'i'), '');
    }
  }
  if (due === 'AI picks' && periodImpliesToday) due = 'Today';

  const title =
  capitalize(
    text.
    replace(/\s{2,}/g, ' ').
    replace(/\s+(by|on|at)\s*$/i, '').
    replace(/^[,\s]+|[,\s]+$/g, '')
  ) || 'Untitled reminder';

  const soon = due === 'Today' || due === 'Tomorrow';
  const suggested: Priority = soon && URGENT.test(title) ? 'high' : soon ? 'medium' : 'low';

  let suggestion: string | null = null;
  if (stated && priorityMeta[suggested].rank < priorityMeta[stated].rank) {
    suggestion = `This is due ${due.toLowerCase()}. I recommend changing ${priorityMeta[stated].label} → ${priorityMeta[suggested].label}.`;
  } else if (!stated) {
    suggestion = soon ?
    `Suggested priority: ${priorityMeta[suggested].label}, since it’s due ${due.toLowerCase()}.` :
    `Suggested priority: ${priorityMeta[suggested].label}. I’ll find a quiet moment for it.`;
  }

  return {
    title,
    forWhom,
    due,
    period,
    priority: stated ?? suggested,
    suggestedPriority: suggested,
    priorityWasStated: Boolean(stated),
    suggestion
  };
}

function capitalize(value: string): string {
  const v = value.trim();
  return v.charAt(0).toUpperCase() + v.slice(1);
}