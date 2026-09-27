import { BotIcon, CreditCardIcon, LucideIcon, PinIcon, StarIcon } from 'lucide-react';
import { TabId } from '../types/navigation';

export const navItems: {id: TabId;label: string;icon: LucideIcon;tone: string;}[] = [
{ id: 'team', label: 'Team Space', icon: PinIcon, tone: 'bg-pink-soft text-pink-ink' },
{ id: 'ai', label: 'Personal AI Settings', icon: BotIcon, tone: 'bg-lavender-soft text-lavender-ink' },
{ id: 'progress', label: 'My Progress', icon: StarIcon, tone: 'bg-peach-soft text-peach-ink' },
{ id: 'subscription', label: 'Subscription & Workspace', icon: CreditCardIcon, tone: 'bg-mint-soft text-mint-ink' }];