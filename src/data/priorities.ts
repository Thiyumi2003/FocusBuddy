import { Priority } from '../types/reminders';

export const priorityMeta: Record<
  Priority,
  {label: string;dot: string;soft: string;text: string;rank: number;stars: number;}> =
{
  high: { label: 'High', dot: 'bg-high', soft: 'bg-high-soft', text: 'text-high-ink', rank: 0, stars: 3 },
  medium: { label: 'Medium', dot: 'bg-medium', soft: 'bg-medium-soft', text: 'text-medium-ink', rank: 1, stars: 2 },
  low: { label: 'Low', dot: 'bg-low', soft: 'bg-low-soft', text: 'text-low-ink', rank: 2, stars: 1 }
};

export const priorityOrder: Priority[] = ['high', 'medium', 'low'];