import React from 'react';
import { priorityMeta } from '../data/priorities';
import { Priority } from '../types/reminders';

export function PriorityBadge({ priority }: {priority: Priority;}) {
  const meta = priorityMeta[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-extrabold ${meta.text} shadow-card`}>
      <span className={`h-2.5 w-2.5 rounded-full ${meta.dot} ring-2 ring-white`} aria-hidden />
      {meta.label}
    </span>);

}