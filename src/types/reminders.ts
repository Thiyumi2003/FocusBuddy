export type Priority = 'high' | 'medium' | 'low';
export type Space = 'team' | 'personal';

export interface Person {
  id: string;
  name: string;
  initials: string;
  role: string;
  isMe?: boolean;
  avatar?: string;
  avatarUrl?: string;
}

export interface ReminderComment {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
}

export interface Reminder {
  id: string;
  space: Space;
  title: string;
  priority: Priority;
  assignee: Person;
  due: string;
  dueDate?: string;
  dueTime?: string;
  dueAt?: string;
  comments: ReminderComment[];
  pokes: number;
  pokedByMe?: boolean;
  pokedBy?: string;
  status: 'open' | 'done';
  aiNote?: string;
  source?: string;
}

export interface NewReminderInput {
  title: string;
  priority: Priority;
  forWhom: string;
  assigneeId?: string;
  due: string;
  dueDate: string;
  dueTime: string;
  period: string | null;
  note: string;
}