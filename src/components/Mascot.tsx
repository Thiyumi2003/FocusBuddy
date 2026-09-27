import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type MascotMood = 'happy' | 'wave' | 'sleep' | 'celebrate';

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  float?: boolean;
  className?: string;
}

const labels: Record<MascotMood, string> = {
  happy: 'Pearl, your smiling AI assistant',
  wave: 'Pearl waving hello',
  sleep: 'Pearl sleeping, do not disturb',
  celebrate: 'Pearl celebrating'
};

const INK = '#3B3355';

export function Mascot({ mood = 'happy', size = 96, float = true, className = '' }: MascotProps) {
  const reduce = useReducedMotion();
  const bob = float && !reduce;

  return (
    <motion.svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={labels[mood]}
      animate={bob ? { y: [0, -4, 0] } : undefined}
      transition={bob ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : undefined}>
      
      <ellipse cx="60" cy="113" rx="26" ry="4" fill={INK} opacity="0.08" />

      {mood === 'wave' &&
      <motion.g
        style={{ originX: '94px', originY: '72px' }}
        animate={reduce ? undefined : { rotate: [0, 20, 0, 20, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.4 }}>
        
          <ellipse cx="101" cy="58" rx="7" ry="10" fill="#FBF9FF" stroke="#C9BDFB" strokeWidth="3" />
        </motion.g>
      }

      <circle cx="60" cy="66" r="40" fill="#FBF9FF" stroke="#C9BDFB" strokeWidth="3" />
      <ellipse cx="44" cy="46" rx="10" ry="6" fill="#FFFFFF" transform="rotate(-30 44 46)" />
      <circle cx="77" cy="42" r="2.5" fill="#FFFFFF" />

      <path d="M60 4 L62.8 11.5 L70 14 L62.8 16.5 L60 24 L57.2 16.5 L50 14 L57.2 11.5 Z" fill="#FFC53D" />

      <ellipse cx="40" cy="76" rx="7" ry="4.5" fill="#F59EC0" opacity="0.55" />
      <ellipse cx="80" cy="76" rx="7" ry="4.5" fill="#F59EC0" opacity="0.55" />

      {(mood === 'happy' || mood === 'wave') &&
      <>
          <circle cx="46" cy="65" r="5" fill={INK} />
          <circle cx="74" cy="65" r="5" fill={INK} />
          <circle cx="47.8" cy="63.2" r="1.7" fill="#FFFFFF" />
          <circle cx="75.8" cy="63.2" r="1.7" fill="#FFFFFF" />
          <path d="M54 78 Q60 84 66 78" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      }

      {mood === 'celebrate' &&
      <>
          <path d="M40 67 Q46 59 52 67" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M68 67 Q74 59 80 67" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M52 77 Q60 89 68 77 Z" fill="#C0487D" />
          <path d="M16 40 L17.5 44 L21.5 45.5 L17.5 47 L16 51 L14.5 47 L10.5 45.5 L14.5 44 Z" fill="#8EDDBE" />
          <path d="M104 34 L105.5 38 L109.5 39.5 L105.5 41 L104 45 L102.5 41 L98.5 39.5 L102.5 38 Z" fill="#F59EC0" />
        </>
      }

      {mood === 'sleep' &&
      <>
          <path d="M40 66 Q46 71 52 66" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M68 66 Q74 71 80 66" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="60" cy="80" rx="3" ry="2.5" fill={INK} opacity="0.7" />
          {[0, 1, 2].map((i) =>
        <motion.text
          key={i}
          x={88 + i * 8}
          y={34 - i * 9}
          fontSize={10 + i * 3}
          fontWeight={900}
          fill="#8B7BF0"
          fontFamily="Nunito, sans-serif"
          initial={{ opacity: 0.2 }}
          animate={reduce ? { opacity: 1 } : { opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 }}>
          
              z
            </motion.text>
        )}
        </>
      }
    </motion.svg>);

}