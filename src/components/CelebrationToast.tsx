import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StarIcon, XIcon } from 'lucide-react';
import { Celebration } from '../types/progress';
import { FunMode } from '../types/settings';
import { Mascot } from './Mascot';

interface CelebrationToastProps {
  celebration: Celebration | null;
  funMode: FunMode;
  animate: boolean;
  onDismiss: () => void;
}

const ease = [0.23, 1, 0.32, 1] as const;
const confettiColors = ['#F59EC0', '#8EDDBE', '#FFBE98', '#C9BDFB', '#FFC53D'];
const confetti = Array.from({ length: 14 }, (_, i) => {
  const angle = i / 14 * Math.PI * 2;
  const distance = 38 + i % 3 * 12;
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, color: confettiColors[i % confettiColors.length], round: i % 2 === 0 };
});

export function CelebrationToast({ celebration, funMode, animate, onDismiss }: CelebrationToastProps) {
  const showBurst = animate && funMode !== 'minimal';
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end" aria-live="polite">
      <AnimatePresence>
        {celebration &&
        <motion.div
          key={celebration.id}
          initial={animate ? { opacity: 0, y: 16, scale: 0.96 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={animate ? { opacity: 0, y: 8, scale: 0.98 } : { opacity: 0 }}
          transition={{ duration: 0.26, ease }}
          className="pointer-events-auto w-full max-w-sm rounded-3xl bg-white p-4 shadow-pop ring-1 ring-lavender-soft">
          
            <div className="flex items-center gap-3">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-lavender-soft">
                <Mascot mood="celebrate" size={56} float={false} />
                {showBurst &&
              confetti.map((c, i) =>
              <motion.span
                key={i}
                aria-hidden
                className={`absolute left-1/2 top-1/2 h-2 w-2 ${c.round ? 'rounded-full' : 'rounded-[2px]'}`}
                style={{ backgroundColor: c.color }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                animate={{ x: c.x, y: c.y, opacity: 0, scale: 1, rotate: 90 }}
                transition={{ duration: 0.3, delay: 0.05 + i % 4 * 0.03, ease: 'easeOut', opacity: { duration: 0.3, delay: 0.25 } }} />

              )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-ink">Yay, done! ✨</p>
                <p className="truncate text-[13px] font-semibold text-muted">{celebration.title}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex items-center gap-0.5" aria-hidden>
                    {Array.from({ length: celebration.stars }).map((_, i) =>
                  <motion.span
                    key={i}
                    initial={animate ? { opacity: 0, scale: 0.5, rotate: -30 } : false}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.22, delay: 0.1 + i * 0.05, ease }}>
                    
                        <StarIcon className="h-4 w-4 fill-star text-star" />
                      </motion.span>
                  )}
                  </div>
                  <span className="text-[13px] font-extrabold text-star-ink">
                    +{celebration.stars} {celebration.stars === 1 ? 'Star' : 'Stars'}
                  </span>
                </div>
                {funMode !== 'minimal' && <p className="mt-0.5 text-xs font-semibold text-muted">{celebration.weekCount} things remembered this week</p>}
              </div>
              <button onClick={onDismiss} className="self-start rounded-full p-1 text-subtle transition-colors duration-150 hover:bg-canvas hover:text-ink" aria-label="Dismiss">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}