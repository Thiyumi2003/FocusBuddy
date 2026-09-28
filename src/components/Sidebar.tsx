import React from 'react';
import { LogOutIcon, UsersIcon } from 'lucide-react';
import { navItems } from '../data/navigation';
import { useProgress } from '../contexts/ProgressContext';
import { useSession } from '../contexts/SessionContext';
import { TabId } from '../types/navigation';
import { Space } from '../types/reminders';
import { initialsFrom } from '../utils/validation';
import { Avatar } from './Avatar';
import { BrandMark } from './BrandMark';
import { Mascot } from './Mascot';
import { TeamSwitcher } from './TeamSwitcher';
import { InstallAppButton } from './InstallAppButton';

interface SidebarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  space: Space;
  onSpaceChange: (space: Space) => void;
}

export function Sidebar({ active, onChange, space, onSpaceChange }: SidebarProps) {
  const { stars } = useProgress();
  const { user, workspace, signOut, leaveWorkspace } = useSession();
  const isTeam = workspace?.mode === 'team';
  const name = user?.name ?? 'You';

  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-white bg-surface lg:flex">
      <div className="px-5 pb-6 pt-6">
        <BrandMark subtitle="Your memory buddy" />
      </div>

      <div className="px-4">
        <p className="px-1 pb-1.5 text-xs font-bold text-muted">Space</p>
        {isTeam ?
        <div role="radiogroup" aria-label="Space" className="grid grid-cols-2 gap-1 rounded-2xl bg-lavender-soft p-1">
            {(['team', 'personal'] as Space[]).map((s) =>
          <button
            key={s}
            role="radio"
            aria-checked={space === s}
            onClick={() => onSpaceChange(s)}
            className={`truncate whitespace-nowrap rounded-xl px-2 py-2 text-[13px] font-bold transition-colors duration-150 ${
            space === s ? 'bg-white text-ink shadow-card' : 'text-lavender-ink hover:text-ink'}`
            }>
            
                {s === 'team' ? workspace?.name : 'Personal'}
              </button>
          )}
          </div> :

        <div className="rounded-2xl bg-mint-soft p-3">
            <p className="text-[13px] font-bold text-ink">Personal Mode</p>
            <button onClick={leaveWorkspace} className="mt-1 flex items-center gap-1.5 text-xs font-bold text-mint-ink hover:underline">
              <UsersIcon className="h-3.5 w-3.5" aria-hidden />
              Create or join a team
            </button>
          </div>
        }
      </div>

      <TeamSwitcher />

      <nav aria-label="Main" className="mt-6 flex flex-col gap-1 px-4">
        {navItems.map(({ id, label, icon: Icon, tone }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-2xl px-2 py-2 text-left text-sm font-bold transition-[background-color,box-shadow,color] duration-150 ${
              isActive ? 'bg-white text-ink shadow-card' : 'text-muted hover:bg-white/60 hover:text-ink'}`
              }>
              
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="flex-1 whitespace-nowrap">{id === 'team' && space === 'personal' ? 'Personal Space' : label}</span>
              {id === 'progress' &&
              <span className="rounded-full bg-star-soft px-2 py-0.5 text-[11px] font-extrabold text-star-ink">★ {stars}</span>
              }
            </button>);

        })}
      </nav>

      <div className="mt-auto space-y-4 p-4">
        <InstallAppButton />
        <div className="flex items-center gap-2 rounded-2xl bg-lavender-soft p-3">
          <Mascot mood="sleep" size={44} float={false} />
          <p className="text-xs font-semibold leading-snug text-lavender-ink">
            Your reminders are ready whenever you are.
          </p>
        </div>
        <div className="flex items-center gap-3 border-t border-line pt-4">
          <Avatar person={{ id: 'me', name, initials: initialsFrom(name), role: '', isMe: true }} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{name}</p>
            <p className="truncate text-xs text-muted">
              {isTeam ? `${workspace?.role === 'admin' ? 'Admin' : 'Member'} · ${workspace?.name}` : 'Personal Mode'}
            </p>
          </div>
          <button onClick={signOut} aria-label="Sign out" className="rounded-xl p-2 text-subtle transition-colors duration-150 hover:bg-white hover:text-ink">
            <LogOutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>);

}