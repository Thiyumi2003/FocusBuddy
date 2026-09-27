import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AwardIcon, GemIcon, LockIcon, ShieldCheckIcon, SparklesIcon, SproutIcon, StarIcon, TrendingUpIcon, BoxIcon } from "lucide-react";
import { ReliabilityRing } from "../components/ReliabilityRing";
import { useProgress } from "../contexts/ProgressContext";
import { milestoneBadges } from "../data/badges";
const badgeStyle: Record<string, {
  icon: BoxIcon;
  tone: string;
}> = {
  starter: {
    icon: SproutIcon,
    tone: 'bg-mint-soft text-mint-ink'
  },
  'on-track': {
    icon: TrendingUpIcon,
    tone: 'bg-lavender-soft text-lavender-ink'
  },
  reliable: {
    icon: ShieldCheckIcon,
    tone: 'bg-pink-soft text-pink-ink'
  },
  consistency: {
    icon: GemIcon,
    tone: 'bg-peach-soft text-peach-ink'
  }
};
export function Progress() {
  const {
    stars,
    completed,
    missed,
    rescheduled,
    reliability
  } = useProgress();
  const reduce = useReducedMotion();
  const unlocked = milestoneBadges.filter((b) => b.threshold <= stars);
  const current = unlocked[unlocked.length - 1];
  const next = milestoneBadges.find((b) => b.threshold > stars);
  const pct = next ? Math.min(100, stars / next.threshold * 100) : 100;
  const badges = milestoneBadges.map((b) => ({
    id: b.id,
    name: b.name,
    note: `★ ${b.threshold}`,
    unlocked: b.threshold <= stars,
    ...badgeStyle[b.id]
  }));
  return <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink sm:text-[30px]">My Progress</h1>
          <p className="mt-1 text-sm font-semibold text-muted">Your own little wins, just for you.</p>
        </div>
        <p className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-bold text-muted shadow-card">
          <LockIcon className="h-3.5 w-3.5" aria-hidden />
          Private. No leaderboards, no rankings, ever.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section aria-labelledby="stars-title" className="rounded-3xl bg-surface p-6 shadow-card ring-1 ring-white sm:p-8">
          <h2 id="stars-title" className="sr-only">Stars</h2>
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-star-soft">
              <motion.div animate={reduce ? undefined : {
              rotate: [0, -8, 8, 0]
            }} transition={{
              duration: 2.6,
              repeat: Infinity,
              repeatDelay: 1
            }}>
                <StarIcon className="h-14 w-14 fill-star text-star" style={{
                filter: 'drop-shadow(0 4px 8px rgba(255, 197, 61, 0.55))'
              }} aria-hidden />
              </motion.div>
              <motion.span className="absolute right-2 top-2 text-white" animate={reduce ? undefined : {
              scale: [0.6, 1.1, 0.6],
              opacity: [0.4, 1, 0.4]
            }} transition={{
              duration: 1.8,
              repeat: Infinity
            }} aria-hidden>
                <SparklesIcon className="h-4 w-4 fill-white" />
              </motion.span>
            </div>
            <div>
              <p className="text-6xl font-black tracking-tight text-ink">
                {stars}
                <span className="ml-2 text-2xl font-extrabold text-subtle">/ {next ? next.threshold : stars} Stars</span>
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-lavender-soft px-3 py-1 text-xs font-extrabold text-lavender-ink">
                <AwardIcon className="h-3.5 w-3.5" aria-hidden />
                Level {unlocked.length + 1} · {current ? current.name : 'Getting started'}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="relative h-5 overflow-hidden rounded-full bg-star-soft" role="progressbar" aria-valuenow={stars} aria-valuemin={0} aria-valuemax={next?.threshold ?? stars}>
              <motion.div className="relative h-full rounded-full bg-star" initial={false} animate={{
              width: `${pct}%`
            }} transition={{
              duration: 0.3,
              ease: [0.23, 1, 0.32, 1]
            }}>
                <span className="absolute inset-x-2 top-1 h-1.5 rounded-full bg-white/50" aria-hidden />
              </motion.div>
            </div>
            <p className="mt-3 text-sm font-semibold text-muted">
              {next ? <>
                  Only <span className="font-black text-ink">{next.threshold - stars} more stars</span> to unlock <span className="font-black text-ink">{next.name}</span>!
                </> : 'Every milestone unlocked. Amazing!'}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5 text-xs font-extrabold">
            <span className="rounded-full bg-mint-soft px-3 py-1 text-mint-ink">Low ★</span>
            <span className="rounded-full bg-peach-soft px-3 py-1 text-peach-ink">Medium ★★</span>
            <span className="rounded-full bg-pink-soft px-3 py-1 text-pink-ink">High ★★★</span>
            <span className="py-1 font-semibold text-muted">Earned stars are never taken away.</span>
          </div>
        </section>

        <section aria-labelledby="reliability-title" className="flex flex-col items-center rounded-3xl bg-surface p-6 text-center shadow-card ring-1 ring-white">
          <h2 id="reliability-title" className="text-base font-black text-ink">Reliability Ring</h2>
          <p className="mt-1 text-[13px] text-muted">Completed vs missed. It bounces back as you recover.</p>
          <div className="mt-5">
            <ReliabilityRing value={reliability} />
          </div>
          <dl className="mt-6 grid w-full grid-cols-3 gap-2">
            {[{
            label: 'Completed',
            value: completed,
            tone: 'bg-mint-soft text-mint-ink'
          }, {
            label: 'Missed',
            value: missed,
            tone: 'bg-pink-soft text-pink-ink'
          }, {
            label: 'Rescheduled',
            value: rescheduled,
            tone: 'bg-lavender-soft text-lavender-ink'
          }].map((s) => <div key={s.label} className={`rounded-2xl px-2 py-3 ${s.tone}`}>
                <dd className="text-xl font-black">{s.value}</dd>
                <dt className="text-[11px] font-bold">{s.label}</dt>
              </div>)}
          </dl>
        </section>
      </div>

      <section aria-labelledby="badges-title" className="mt-10">
        <h2 id="badges-title" className="mb-4 text-lg font-black text-ink">Achievement badges</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map(({
          id,
          name,
          note,
          unlocked,
          icon: Icon,
          tone
        }) => <li key={id} className="flex flex-col items-center rounded-3xl bg-surface p-5 text-center shadow-card ring-1 ring-white">
              <div className={`relative flex h-20 w-20 items-center justify-center rounded-full ring-4 ring-white ${unlocked ? tone : 'bg-canvas text-subtle'}`}>
                <Icon className={`h-9 w-9 ${unlocked ? '' : 'opacity-40'}`} aria-hidden />
                {!unlocked && <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-subtle shadow-card">
                    <LockIcon className="h-3.5 w-3.5" aria-label="Locked" />
                  </span>}
              </div>
              <p className={`mt-3 text-sm font-black ${unlocked ? 'text-ink' : 'text-muted'}`}>{name}</p>
              <p className={`text-xs font-bold ${unlocked ? 'text-mint-ink' : 'text-subtle'}`}>{unlocked ? 'Unlocked!' : note}</p>
            </li>)}
        </ul>
      </section>

    </div>;
}