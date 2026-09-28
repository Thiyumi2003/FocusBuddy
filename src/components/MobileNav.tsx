import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOutIcon, MenuIcon, XIcon } from 'lucide-react';
import { navItems } from '../data/navigation';
import { useProgress } from '../contexts/ProgressContext';
import { useSession } from '../contexts/SessionContext';
import { TabId } from '../types/navigation';
import { Space } from '../types/reminders';
import { BrandMark } from './BrandMark';
import { TeamSwitcher } from './TeamSwitcher';
import { InstallAppButton } from './InstallAppButton';

interface MobileNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  space: Space;
  onSpaceChange: (space: Space) => void;
}

const ease = [0.23, 1, 0.32, 1] as const;

export function MobileNav({ active, onChange, space, onSpaceChange }: MobileNavProps) {
  const { workspace, signOut } = useSession();
  const { stars } = useProgress();
  const [open, setOpen] = useState(false);
  const current = navItems.find((n) => n.id === active);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 lg:hidden">
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white bg-surface px-4 py-3">
        <BrandMark size="sm" subtitle={current?.label ?? null} />
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-drawer"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lavender-soft text-lavender-ink transition-transform duration-150 active:scale-95">
          
          {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open &&
        <>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-0 bg-ink/20"
            aria-hidden />
          
            <motion.nav
            id="mobile-drawer"
            aria-label="Main"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease }}
            className="absolute inset-x-3 top-[68px] rounded-3xl bg-white p-3 shadow-pop">
            
              {workspace?.mode === 'team' &&
            <div role="radiogroup" aria-label="Space" className="mb-3 grid grid-cols-2 gap-1 rounded-2xl bg-lavender-soft p-1">
                  {(['team', 'personal'] as Space[]).map((s) =>
              <button
                key={s}
                role="radio"
                aria-checked={space === s}
                onClick={() => onSpaceChange(s)}
                className={`truncate rounded-xl py-2 text-[13px] font-bold ${space === s ? 'bg-white text-ink shadow-card' : 'text-lavender-ink'}`}>
                
                      {s === 'team' ? workspace.name : 'Personal'}
                    </button>
              )}
                </div>
            }
              <TeamSwitcher />
              <ul className="space-y-1">
                {navItems.map(({ id, label, icon: Icon, tone }, i) =>
              <motion.li key={id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.04 * i, ease }}>
                    <button
                  onClick={() => {
                    onChange(id);
                    setOpen(false);
                  }}
                  aria-current={active === id ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left text-sm font-bold ${active === id ? 'bg-canvas text-ink' : 'text-muted'}`}>
                  
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="flex-1">{label}</span>
                      {id === 'progress' && <span className="rounded-full bg-star-soft px-2 py-0.5 text-[11px] font-extrabold text-star-ink">★ {stars}</span>}
                    </button>
                  </motion.li>
              )}
              </ul>
              <div className="mt-2">
                <InstallAppButton />
              </div>
              <button onClick={signOut} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-[13px] font-bold text-muted hover:bg-canvas">
                <LogOutIcon className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </motion.nav>
          </>
        }
      </AnimatePresence>
    </header>);

}