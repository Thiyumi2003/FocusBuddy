import React from 'react';
import { motion } from 'framer-motion';

export function ReliabilityRing({ value }: {value: number;}) {
  const r = 50;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90 overflow-visible" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" stroke="#F4F0FF" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          stroke="#8B7BF0"
          style={{ filter: 'drop-shadow(0 0 6px rgba(139, 123, 240, 0.55))' }}
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} />
        
      </svg>
      <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white shadow-card">
        <span className="text-3xl font-black tracking-tight text-ink">{value}%</span>
        <span className="text-xs font-bold text-muted">Reliability</span>
      </div>
    </div>);

}