import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, LockIcon, StarIcon } from 'lucide-react';
import { milestoneBadges } from '../data/badges';
import { useProgress } from '../contexts/ProgressContext';

export function MiniProgress({ onOpen }: {onOpen: () => void;}) {
  const { stars } = useProgress();
  const next = milestoneBadges.find((b) => b.threshold > stars) ?? milestoneBadges[milestoneBadges.length - 1];
  const pct = Math.min(100, stars / next.threshold * 100);
  const remaining = Math.max(0, next.threshold - stars);

  return (
    <section aria-labelledby="mini-progress" className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 id="mini-progress" className="text-sm font-semibold text-ink">Your stars</h2>
        <span className="flex items-center gap-1 text-xs text-subtle">
          <LockIcon className="h-3 w-3" aria-hidden />
          Private
        </span>
      </div>
      <p className="mt-3 flex items-center gap-2 text-3xl font-semibold tracking-tight text-ink">
        <StarIcon className="h-6 w-6 fill-star text-star" aria-hidden />
        {stars}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas" role="progressbar" aria-valuenow={stars} aria-valuemin={0} aria-valuemax={next.threshold}>
        <motion.div
          className="h-full rounded-full bg-star"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} />
        
      </div>
      <p className="mt-2 text-[13px] text-muted">
        {remaining > 0 ?
        <>
            Only <span className="font-medium text-ink">{remaining} stars</span> until <span className="font-medium text-ink">{next.name}</span>
          </> :

        <>You’ve unlocked {next.name}!</>
        }
      </p>
      <button
        onClick={onOpen}
        className="mt-4 flex items-center gap-1 text-[13px] font-medium text-accent transition-colors duration-150 hover:text-accent-ink">
        
        View my progress
        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
      </button>
    </section>);

}