import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LogOutIcon } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { Mascot } from '../components/Mascot';
import { CreateTeamFlow } from '../components/workspace/CreateTeamFlow';
import { JoinTeamFlow } from '../components/workspace/JoinTeamFlow';
import { useSession } from '../contexts/SessionContext';
import { workspaceOptions } from '../data/workspaces';
import { firstNameOf } from '../utils/validation';
import { createPersonalWorkspace } from '../utils/api';

type View = 'choose' | 'create' | 'join';

const ease = [0.23, 1, 0.32, 1] as const;

export function WorkspaceSelect() {
  const { user, enterWorkspace, signOut } = useSession();
  const [view, setView] = useState<View>('choose');

  async function pick(id: 'create' | 'join' | 'personal') {
    if (id === 'personal') {
      try {
        enterWorkspace(await createPersonalWorkspace());
        toast('Personal Mode ready', { description: 'Recommended settings applied. I’ll learn when you like to work.' });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not open your personal workspace.');
      }
      return;
    }
    setView(id);
  }

  return (
    <div className="min-h-screen w-full bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandMark size="sm" subtitle={null} />
          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] text-muted sm:block">{user?.email}</span>
            <button onClick={signOut} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
              <LogOutIcon className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <AnimatePresence mode="wait" initial={false}>
          {view === 'choose' ?
          <motion.div key="choose" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease }}>
              <div className="flex items-center gap-4">
                <Mascot mood="wave" size={84} className="shrink-0" />
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
                    Hi {user ? firstNameOf(user.name) : 'there'}! Where shall we start?
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-muted">You can switch or join more teams any time.</p>
                </div>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {workspaceOptions.map(({ id, title, description, details, cta, icon: Icon, tone }) =>
              <button
                key={id}
                onClick={() => pick(id)}
                className="group flex flex-col rounded-3xl bg-surface p-6 text-left shadow-card ring-1 ring-white transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-pop active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40">
                
                    <span className="flex items-center justify-between">
                      <span className={`flex h-14 w-14 items-center justify-center rounded-3xl ${tone} transition-transform duration-200 group-hover:rotate-[-6deg]`}>
                        <Icon className="h-6 w-6" aria-hidden />
                      </span>
                    </span>
                    <span className="mt-5 text-lg font-black text-ink">{title}</span>
                    <span className="mt-1.5 text-sm leading-relaxed text-muted">{description}</span>
                    <span className="mt-5 space-y-2 border-t border-line pt-4">
                      {details.map((d) =>
                  <span key={d} className="flex items-center gap-2 text-[13px] text-ink">
                          <CheckIcon className="h-3.5 w-3.5 text-accent" aria-hidden />
                          {d}
                        </span>
                  )}
                    </span>
                    <span className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-extrabold text-accent">
                      {cta}
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </button>
              )}
              </div>
            </motion.div> :

          <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease }} className="mx-auto max-w-lg">
              <button onClick={() => setView('choose')} className="mb-4 flex items-center gap-1.5 text-[13px] text-muted transition-colors duration-150 hover:text-ink">
                <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
                All options
              </button>
              <div className="rounded-3xl bg-surface p-6 shadow-card ring-1 ring-line sm:p-8">
                {view === 'create' ? <CreateTeamFlow onEnter={enterWorkspace} /> : <JoinTeamFlow onEnter={enterWorkspace} />}
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </main>
    </div>);

}