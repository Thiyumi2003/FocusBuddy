import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SparkleIcon, SparklesIcon } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

export function SloganBanner() {
  const { workspace } = useSession();
  const reduce = useReducedMotion();
  const twinkle = reduce ? undefined : { scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] };

  return (
    <div className="border-b border-white bg-lavender-soft">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-10">
        <p className="flex min-w-0 items-center gap-2 text-[13px] font-semibold text-lavender-ink">
          <motion.span animate={twinkle} transition={{ duration: 2.2, repeat: Infinity }} className="shrink-0 text-star">
            <SparklesIcon className="h-4 w-4 fill-star" aria-hidden />
          </motion.span>
          <span className="truncate">
            <span className="font-extrabold">We don’t remind you more.</span> We remind you better.
          </span>
          <motion.span animate={twinkle} transition={{ duration: 2.2, repeat: Infinity, delay: 1.1 }} className="hidden shrink-0 text-pink sm:inline">
            <SparkleIcon className="h-3.5 w-3.5 fill-pink" aria-hidden />
          </motion.span>
        </p>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-bold text-mint-ink shadow-card">
          {workspace?.mode === 'team' ? workspace.name : 'Personal Mode'}
        </span>
      </div>
    </div>);

}