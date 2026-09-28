import React, { useEffect, useState } from 'react';
import { Workspace } from '../types/session';
import { getWorkspaces } from '../utils/api';
import { useSession } from '../contexts/SessionContext';

export function TeamSwitcher() {
  const { workspace, enterWorkspace } = useSession();
  const [teams, setTeams] = useState<Workspace[]>([]);

  useEffect(() => {
    let active = true;
    getWorkspaces().then((items) => {
      if (active) setTeams(items.filter((item) => item.mode === 'team'));
    }).catch(() => {
      if (active) setTeams(workspace?.mode === 'team' ? [workspace] : []);
    });
    return () => { active = false; };
  }, [workspace]);

  if (teams.length === 0) return null;

  return (
    <section aria-label="Your teams" className="mt-5 px-4">
      <h2 className="px-1 pb-1.5 text-xs font-bold text-muted">Your teams</h2>
      <ul className="max-h-44 space-y-1 overflow-y-auto">
        {teams.map((team) => {
          const isCurrent = workspace?.id === team.id;
          return (
            <li key={team.id ?? team.name}>
              <button
                type="button"
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => enterWorkspace(team)}
                className={`w-full truncate rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition-colors ${
                  isCurrent ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:bg-canvas hover:text-ink'
                }`}
              >
                {team.name}
                <span className="ml-2 text-[11px] font-normal opacity-75">{team.role === 'admin' ? 'Admin' : 'Member'}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}