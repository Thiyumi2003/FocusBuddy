import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PointerIcon, SparklesIcon, StarIcon } from 'lucide-react';
import { welcomeIllustration } from '../../data/avatars';
import { BrandMark } from '../BrandMark';

export function AuthBrandPanel() {
  const reduce = useReducedMotion();
  const bob = (delay: number) =>
  reduce ? {} : { animate: { y: [0, -6, 0] }, transition: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' as const, delay } };

  return (
    <aside className="relative hidden w-[48%] max-w-[680px] flex-col justify-between overflow-hidden bg-lavender-soft p-10 lg:flex xl:p-12">
      <BrandMark />

      <div className="relative mx-auto w-full max-w-md">
        <img src={welcomeIllustration} alt="Pearl the assistant mascot beside a stack of pastel reminder cards" className="w-full rounded-3xl shadow-pop" />
        <motion.div {...bob(0)} className="absolute -left-6 top-8 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-bold text-ink shadow-pop">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-pink-soft text-pink-ink">
            <PointerIcon className="h-4 w-4" aria-hidden />
          </span>
          Poke delivered at 2:00 PM
        </motion.div>
        <motion.div {...bob(1.2)} className="absolute -right-4 bottom-10 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-extrabold text-star-ink shadow-pop">
          <StarIcon className="h-4 w-4 fill-star text-star" aria-hidden />
          +3 Stars!
        </motion.div>
      </div>

      <div>
        <h2 className="text-[34px] font-black leading-[1.1] tracking-tight text-ink">
          We don’t remind you more.
          <br />
          <span className="text-accent">We remind you better.</span>
          <SparklesIcon className="ml-2 inline h-7 w-7 fill-star text-star" aria-hidden />
        </h2>
        <p className="mt-3 max-w-md text-[15px] font-semibold leading-relaxed text-muted">
          Pearl is your gentle AI buddy. She learns when you work best and never nags you when you’re busy.
        </p>
      </div>
    </aside>);

}