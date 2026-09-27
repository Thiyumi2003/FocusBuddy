export interface Celebration {
  id: number;
  kind: 'done';
  title: string;
  stars: number;
  weekCount: number;
}

export interface MilestoneBadge {
  id: string;
  name: string;
  threshold: number;
}