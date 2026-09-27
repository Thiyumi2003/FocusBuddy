export type ReminderStyle = 'gentle' | 'friendly' | 'direct';
export type ProductiveTime = 'morning' | 'afternoon' | 'evening' | 'auto';
export type PokeAudience = 'team' | 'selected' | 'nobody';
export type PokeDelivery = 'ai' | 'immediate';
export type FunMode = 'minimal' | 'balanced' | 'fun';
export type PriorityDelivery = 'normal' | 'smart' | 'available';
export type FollowUpAfter = 'ai' | '1h' | '3h' | 'tomorrow';

export interface AISettings {
  workingDays: string[];
  startTime: string;
  endTime: string;
  productiveTime: ProductiveTime;
  smartTiming: boolean;
  behaviourLearning: boolean;
  prioritySuggestions: boolean;
  smartFollowUps: boolean;
  focusProtection: boolean;
  avoidMeetings: boolean;
  holdLowWhileBusy: boolean;
  groupNonUrgent: boolean;
  reminderStyle: ReminderStyle;
  highDelivery: PriorityDelivery;
  mediumDelivery: PriorityDelivery;
  lowDelivery: PriorityDelivery;
  followUpAfter: FollowUpAfter;
  suggestReschedule: boolean;
  allowPokes: boolean;
  pokeAudience: PokeAudience;
  pokeDelivery: PokeDelivery;
  preventPokeSpam: boolean;
  combinePokes: boolean;
  connectCalendar: boolean;
  connectJira: boolean;
  connectTeams: boolean;
  useCalendar: boolean;
  considerWorkload: boolean;
  protectFocus: boolean;
  starsEnabled: boolean;
  showProgress: boolean;
  missedAskReschedule: boolean;
  missedSuggestTime: boolean;
  missedShowOnDashboard: boolean;
  missedRecoveryStars: boolean;
}

export type SettingsUpdater = <K extends keyof AISettings>(key: K, value: AISettings[K]) => void;