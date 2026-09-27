import React from 'react';
import { useSession } from '../contexts/SessionContext';
import { Person } from '../types/reminders';
import { avatarUrl } from '../utils/avatars';

const dims = { sm: 'h-6 w-6 text-[9px]', md: 'h-10 w-10 text-xs', lg: 'h-14 w-14 text-sm' };

export function Avatar({ person, size = 'sm' }: {person: Person;size?: 'sm' | 'md' | 'lg';}) {
  const { user } = useSession();
  const url = person.isMe ? avatarUrl(user?.avatar) ?? person.avatarUrl : person.avatarUrl;

  if (url) {
    return (
      <span aria-hidden className={`inline-block shrink-0 overflow-hidden rounded-full bg-lavender-soft ring-2 ring-white ${dims[size]}`}>
        <img src={url} alt="" className="h-full w-full scale-[1.35] object-cover" />
      </span>);

  }
  return (
    <span aria-hidden className={`inline-flex shrink-0 items-center justify-center rounded-full bg-lavender-soft font-bold text-lavender-ink ring-2 ring-white ${dims[size]}`}>
      {person.initials}
    </span>);

}