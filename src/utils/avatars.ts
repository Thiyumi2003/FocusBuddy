import { avatars } from '../data/avatars';

export function avatarUrl(id?: string): string | undefined {
  return avatars.find((a) => a.id === id)?.url;
}