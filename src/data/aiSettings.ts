import { AISettings, ReminderStyle } from '../types/settings';

export const recommendedSettings: AISettings = {
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  startTime: '09:00',
  endTime: '18:00',
  productiveTime: 'auto',
  smartTiming: true,
  behaviourLearning: true,
  prioritySuggestions: true,
  smartFollowUps: true,
  focusProtection: true,
  avoidMeetings: true,
  holdLowWhileBusy: true,
  groupNonUrgent: true,
  reminderStyle: 'friendly',
  highDelivery: 'normal',
  mediumDelivery: 'smart',
  lowDelivery: 'available',
  followUpAfter: 'ai',
  suggestReschedule: true,
  allowPokes: true,
  pokeAudience: 'team',
  pokeDelivery: 'ai',
  preventPokeSpam: true,
  combinePokes: true,
  connectCalendar: false,
  connectJira: false,
  connectTeams: false,
  useCalendar: false,
  considerWorkload: true,
  protectFocus: true,
  starsEnabled: true,
  showProgress: true,
  missedAskReschedule: true,
  missedSuggestTime: true,
  missedShowOnDashboard: true,
  missedRecoveryStars: true
};

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const reminderStyles: {id: ReminderStyle;label: string;description: string;sample: string;}[] = [
{ id: 'gentle', label: 'Gentle', description: 'Soft and encouraging', sample: 'Little reminder 🌱 Your assignment is waiting whenever you’re ready.' },
{ id: 'friendly', label: 'Friendly', description: 'Casual and light', sample: 'Hey! Tiny poke 👀 Remember that patch?' },
{ id: 'direct', label: 'Direct', description: 'Short and clear', sample: 'Assignment due tomorrow. Let’s finish it.' }];


export const settingsSections = [
{ id: 'working', label: 'Working hours' },
{ id: 'behaviour', label: 'AI behaviour' },
{ id: 'style', label: 'Reminder style' },
{ id: 'poke', label: 'Poke' },
{ id: 'workload', label: 'Workload awareness' },
{ id: 'motivation', label: 'Motivation' },
{ id: 'missed', label: 'Missed reminders' }];