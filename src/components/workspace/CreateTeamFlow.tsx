import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRightIcon, CopyIcon, LoaderCircleIcon, ShieldAlertIcon, SparklesIcon, UserPlusIcon } from 'lucide-react';
import { Mascot } from '../Mascot';
import { teamCategories } from '../../data/workspaces';
import { Workspace } from '../../types/session';
import { createTeamWorkspace } from '../../utils/api';
import { AuthInput } from '../auth/AuthInput';

const ease = [0.23, 1, 0.32, 1] as const;

export function CreateTeamFlow({ onEnter }: {onEnter: (workspace: Workspace) => void;}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(teamCategories[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [createdWorkspace, setCreatedWorkspace] = useState<Workspace | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Give your team a name, e.g. Team Diva');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const created = await createTeamWorkspace({ name: name.trim(), category, description: description.trim() });
      setCreatedWorkspace(created);
      setCode(created.code);
    } catch (requestError) {
      setLoading(false);
      setError(requestError instanceof Error ? requestError.message : 'Could not create your team. Please try again.');
    }
    setLoading(false);
  }

  function copy() {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    toast('Team code copied', { description: 'Only share it with people who should join your team.' });
  }

  const workspace: Workspace = createdWorkspace ?? { mode: 'team', name: name.trim(), code, members: 1, role: 'admin', category };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {code ?
      <motion.div key="ready" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24, ease }} className="text-center">
          <Mascot mood="celebrate" size={96} className="mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-ink">Your Team Space is Ready!</h2>
          <p className="mt-1 text-sm text-muted">
            {workspace.name} · {category} · You’re the Team Admin
          </p>

          <div className="relative mt-6 rounded-3xl bg-lavender-soft p-5">
            <SparklesIcon className="absolute left-4 top-4 h-4 w-4 fill-star text-star" aria-hidden />
            <SparklesIcon className="absolute bottom-4 right-4 h-3.5 w-3.5 fill-pink text-pink" aria-hidden />
            <p className="text-xs font-extrabold text-lavender-ink">Your private team code</p>
            <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.26, delay: 0.1, ease }}
            className="mx-auto mt-2 w-fit rounded-full bg-white px-5 py-2 font-mono text-3xl font-black tracking-[0.12em] text-accent-ink shadow-card">
            
              {code}
            </motion.p>
          </div>
          <p className="mt-3 flex items-start justify-center gap-1.5 text-left text-[13px] text-muted">
            <ShieldAlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Share this code only with the people you want in this team.
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button onClick={copy} className="flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:bg-canvas">
              <CopyIcon className="h-4 w-4" aria-hidden />
              Copy Code
            </button>
            <button
            onClick={() => {
              navigator.clipboard?.writeText(`Join ${workspace.name} on FocusBuddy with code ${code}`);
              toast('Invite message copied', { description: 'Paste it into your team chat or email.' });
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:bg-canvas">
            
              <UserPlusIcon className="h-4 w-4" aria-hidden />
              Invite Members
            </button>
          </div>
          <button
          onClick={() => onEnter(createdWorkspace ?? workspace)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-ink">
          
            Go to Team Space
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </button>
        </motion.div> :

      <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-ink">Create a team workspace</h2>
            <p className="mt-1 text-sm text-muted">You’ll get a private code to invite teammates.</p>
          </div>
          <AuthInput
          id="team-name"
          label="Team name"
          placeholder="Team Diva"
          value={name}
          error={error}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }} />
        
          <div>
            <label htmlFor="team-desc" className="mb-1.5 block text-[13px] font-medium text-ink">
              Team description <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
            id="team-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="QA and dev follow-ups for the payments release"
            className="w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15" />
          
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink">Category</p>
            <div role="radiogroup" aria-label="Category" className="grid gap-2 sm:grid-cols-3">
              {teamCategories.map((c) =>
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={category === c}
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] transition-colors duration-150 ${
              category === c ? 'bg-accent-soft font-semibold text-accent-ink ring-1 ring-accent' : 'bg-surface text-muted ring-1 ring-line hover:text-ink'}`
              }>
              
                  {c}
                </button>
            )}
            </div>
          </div>
          <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-ink disabled:opacity-70">
          
            {loading && <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden />}
            {loading ? 'Creating team…' : 'Create Team'}
          </button>
        </motion.form>
      }
    </AnimatePresence>);

}