import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CelebrationToast } from '../components/CelebrationToast';
import { Priority } from '../types/reminders';
import { Celebration } from '../types/progress';
import { FunMode } from '../types/settings';
import { completeProgress, getProgress } from '../utils/api';
import { useSession } from './SessionContext';

interface ProgressValue {
  stars: number;
  weekCount: number;
  completed: number;
  missed: number;
  rescheduled: number;
  reliability: number;
  funMode: FunMode;
  setFunMode: (mode: FunMode) => void;
  showAnimations: boolean;
  setShowAnimations: (value: boolean) => void;
  completeReminder: (priority: Priority, title: string) => void;
}

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: {children: React.ReactNode;}) {
  const { user } = useSession();
  const [stars, setStars] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [missed, setMissed] = useState(0);
  const [rescheduled, setRescheduled] = useState(0);
  const [reliability, setReliability] = useState(0);
  const [funMode, setFunMode] = useState<FunMode>('balanced');
  const [showAnimations, setShowAnimations] = useState(true);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    let active = true;
    if (!user?.id) {
      setStars(0);
      setWeekCount(0);
      setCompleted(0);
      setMissed(0);
      setRescheduled(0);
      setReliability(0);
      return () => { active = false; };
    }
    getProgress().then((progress) => {
      if (!active) return;
      setStars(progress.stars);
      setWeekCount(progress.weekCount);
      setCompleted(progress.completed);
      setMissed(progress.missed);
      setRescheduled(progress.rescheduled);
      setReliability(progress.reliability);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [user?.id]);

  const celebrate = useCallback((c: Omit<Celebration, 'id'>) => {
    window.clearTimeout(timer.current);
    setCelebration({ ...c, id: Date.now() });
    timer.current = window.setTimeout(() => setCelebration(null), c.achievement ? 4200 : 2800);
  }, []);

  const completeReminder = useCallback((priority: Priority, title: string) => {
    completeProgress(priority).then((progress) => {
      setStars(progress.stars);
      setWeekCount(progress.weekCount);
      setCompleted(progress.completed);
      setMissed(progress.missed);
      setRescheduled(progress.rescheduled);
      setReliability(progress.reliability);
      celebrate({ kind: 'done', title, stars: progress.earned, weekCount: progress.weekCount });
    }).catch(() => undefined);
  }, [celebrate]);

  const value = useMemo(
    () => ({
      stars,
      weekCount,
      completed,
      missed,
      rescheduled,
      reliability,
      funMode,
      setFunMode,
      showAnimations,
      setShowAnimations,
      completeReminder
    }),
    [stars, weekCount, completed, missed, rescheduled, reliability, funMode, showAnimations, completeReminder]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
      <CelebrationToast
        celebration={celebration}
        funMode={funMode}
        animate={showAnimations}
        onDismiss={() => setCelebration(null)} />
      
    </ProgressContext.Provider>);

}

export function useProgress(): ProgressValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}