import { KeyRoundIcon, LucideIcon, UserIcon, UsersIcon } from 'lucide-react';

export const teamCategories = ['Software / IT', 'University Project', 'Business'];

export const workspaceOptions: {
  id: 'create' | 'join' | 'personal';
  title: string;
  description: string;
  details: string[];
  cta: string;
  icon: LucideIcon;
  tone: string;
}[] = [
{
  id: 'create',
  title: 'Create a new team workspace',
  description: 'Start a shared space for follow-ups that aren’t ready to be Jira tickets.',
  details: ['You become Team Admin', 'Private team code generated', 'Invite teammates with a code'],
  cta: 'Create team',
  icon: UsersIcon,
  tone: 'bg-accent-soft text-accent-ink'
},
{
  id: 'join',
  title: 'Join an existing team',
  description: 'Got a code from a teammate? Enter it and you’re in straight away.',
  details: ['Enter a team invite code', 'Instant access to shared reminders', 'Your AI settings stay private'],
  cta: 'Join with code',
  icon: KeyRoundIcon,
  tone: 'bg-pink-soft text-pink-ink'
},
{
  id: 'personal',
  title: 'Continue in Personal Mode',
  description: 'For students and individuals. Your reminders, your pace.',
  details: ['Recommended settings applied', 'Stars & achievements included', 'Join a team any time'],
  cta: 'Start personal',
  icon: UserIcon,
  tone: 'bg-lavender-soft text-lavender-ink'
}];