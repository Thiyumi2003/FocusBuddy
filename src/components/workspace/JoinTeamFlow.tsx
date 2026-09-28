import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, Clock3Icon, LoaderCircleIcon, LockIcon, UsersIcon } from 'lucide-react';
import { Workspace } from '../../types/session';
import { CODE_PATTERN, normaliseCode } from '../../utils/teamCode';
import { getMyJoinRequests, joinTeamWorkspace } from '../../utils/api';
import { AuthInput } from '../auth/AuthInput';

const ease = [0.23, 1, 0.32, 1] as const;

export function JoinTeamFlow({ onEnter }: {onEnter: (workspace: Workspace) => void;}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState<Workspace | null>(null);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [pendingWorkspaceName, setPendingWorkspaceName] = useState('');

  useEffect(() => {
    if (!pendingCode) return;
    let active = true;
    async function refreshRequest() {
      try {
        const requests = await getMyJoinRequests();
        const request = requests.find((item) => item.teamCode === pendingCode);
        if (!active || !request) return;
        setPendingWorkspaceName(request.workspaceName);
        if (request.status === 'approved' && request.workspace) {
          setPendingCode(null);
          onEnter(request.workspace);
        } else if (request.status === 'rejected') {
          setPendingCode(null);
          setError('The team admin declined your request. You can try another invite code.');
        }
      } catch {
        // Retry while the request is pending.
      }
    }
    void refreshRequest();
    const timer = window.setInterval(() => void refreshRequest(), 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [pendingCode, onEnter]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!CODE_PATTERN.test(code)) {
      setError('Enter a valid team invite code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await joinTeamWorkspace(code);
      if (result.status === 'joined') setJoined(result.workspace);
      else {
        setPendingCode(code);
        setPendingWorkspaceName(result.workspaceName);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not join that team. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {joined ?
      <motion.div key="welcome" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24, ease }} className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
            <UsersIcon className="h-6 w-6 text-accent-ink" aria-hidden />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-ink">Welcome to {joined.name} 👋</h2>
          <p className="mt-1 text-sm text-muted">
            {joined.members} members · {joined.category}
          </p>
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-lavender-soft p-4 text-left">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-lavender-ink" aria-hidden />
            <p className="text-[13px] text-lavender-ink">
              Reminders here are shared. Your AI settings, stars and progress stay private. Admins can’t see them.
            </p>
          </div>
          <button
          onClick={() => onEnter(joined)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-ink">
          
            Use recommended settings & enter
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </button>
          <p className="mt-2 text-xs text-muted">You can customise your AI any time in Personal AI Settings.</p>
        </motion.div> : pendingCode ?
      <motion.div key="pending" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
            <Clock3Icon className="h-6 w-6 text-accent-ink" aria-hidden />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-ink">Request sent</h2>
          <p className="mt-1 text-sm text-muted">
            Your request to join {pendingWorkspaceName || 'the team'} is waiting for admin approval. This page will update when it’s accepted.
          </p>
        </motion.div> :

      <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-ink">Join a team with a code</h2>
            <p className="mt-1 text-sm text-muted">Ask your team admin for the private code.</p>
          </div>
          <AuthInput
          id="join-code"
          label="Team code"
          placeholder="TEAM-1234"
          autoComplete="off"
          value={code}
          error={error}
          hint="Enter the code shared by your team admin"
          className="font-mono text-lg tracking-[0.12em]"
          onChange={(e) => {
            setCode(normaliseCode(e.target.value));
            setError('');
          }} />
        
          <button
          type="submit"
          disabled={loading || !code}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-ink disabled:opacity-50">
          
            {loading && <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden />}
            {loading ? 'Checking code…' : 'Join Team'}
          </button>
        </motion.form>
      }
    </AnimatePresence>);

}