import React from 'react';
import { priorityMeta } from '../data/priorities';
import { Priority } from '../types/reminders';

export function PriorityDot({ priority, className = '' }: {priority: Priority;className?: string;}) {
  return (
    <span
      role="img"
      aria-label={`${priorityMeta[priority].label} priority`}
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${priorityMeta[priority].dot} ${className}`} />);


}