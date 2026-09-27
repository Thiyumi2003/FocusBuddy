import { SessionUser, Workspace } from '../types/session';
import { NewReminderInput, Reminder } from '../types/reminders';

const TOKEN_KEY = 'diva.authToken';
const USER_KEY = 'diva.sessionUser';
const WORKSPACE_KEY = 'diva.activeWorkspace';
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export interface AppNotification {
  id: string;
  title: string;
  dueAt: string;
  dueTime: string;
  createdAt: string;
  readAt: string | null;
}

async function authenticatedRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Request failed. Please try again.');
  return result as T;
}

interface AuthResponse {
  user: SessionUser;
  token: string;
}

async function authenticate(action: 'signup' | 'login', payload: Record<string, string>): Promise<AuthResponse> {
  const response = await fetch(apiUrl(`/api/auth/${action}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Authentication failed. Please try again.');
  localStorage.setItem(TOKEN_KEY, result.token);
  return result as AuthResponse;
}

export function signUp(payload: { name: string; email: string; password: string; avatar: string }) {
  return authenticate('signup', payload);
}

export function logIn(payload: { email: string; password: string }) {
  return authenticate('login', payload);
}

export async function createPersonalWorkspace() {
  const result = await authenticatedRequest<{ workspace: Workspace }>('/api/workspaces/personal', { method: 'POST' });
  return result.workspace;
}

export async function createTeamWorkspace(payload: { name: string; category: string; description: string }) {
  const result = await authenticatedRequest<{ workspace: Workspace }>('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return result.workspace;
}

export async function joinTeamWorkspace(code: string) {
  const result = await authenticatedRequest<{ workspace: Workspace }>('/api/workspaces/join', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
  return result.workspace;
}

export async function getReminders(workspaceId: string) {
  const result = await authenticatedRequest<{ reminders: Reminder[] }>(`/api/reminders?workspaceId=${encodeURIComponent(workspaceId)}`);
  return result.reminders;
}

export async function createReminder(workspaceId: string, space: Reminder['space'], input: NewReminderInput, assignee: Reminder['assignee']) {
  const dueAt = new Date(`${input.dueDate}T${input.dueTime}:00`).toISOString();
  return authenticatedRequest<Reminder>('/api/reminders', {
    method: 'POST',
    body: JSON.stringify({
      workspaceId,
      space,
      title: input.title,
      priority: input.priority,
      due: input.due,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
      dueAt,
      assignee,
      ...(input.note ? { comments: [{ id: `c-${Date.now()}`, author: assignee.name, role: assignee.role, text: input.note, time: 'Just now' }] } : {})
    })
  });
}

export function updateReminder(reminderId: string, changes: Partial<Reminder>) {
  return authenticatedRequest<Reminder>(`/api/reminders/${reminderId}`, {
    method: 'PATCH',
    body: JSON.stringify(changes)
  });
}

export async function getProgress() {
  return authenticatedRequest<{ stars: number; weekCount: number; completed: number; missed: number; rescheduled: number; reliability: number }>('/api/progress');
}

export function completeProgress(priority: Reminder['priority']) {
  return authenticatedRequest<{ stars: number; weekCount: number; completed: number; missed: number; rescheduled: number; reliability: number; earned: number }>('/api/progress/complete', {
    method: 'POST',
    body: JSON.stringify({ priority })
  });
}

export async function getAISettings<T>() {
  return authenticatedRequest<T | null>('/api/settings');
}

export function saveAISettings<T>(settings: T) {
  return authenticatedRequest<T>('/api/settings', { method: 'PUT', body: JSON.stringify(settings) });
}

export async function claimDueReminders() {
  const result = await authenticatedRequest<{ reminders: Reminder[] }>('/api/reminders/notifications/claim', { method: 'POST' });
  return result.reminders;
}

export async function getNotifications() {
  const result = await authenticatedRequest<{ notifications: AppNotification[] }>('/api/notifications');
  return result.notifications;
}

export async function markNotificationRead(notificationId: string) {
  return authenticatedRequest<AppNotification>(`/api/notifications/${notificationId}/read`, { method: 'POST' });
}

export function hasStoredAuthToken() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function getStoredUser(): SessionUser | null {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) as SessionUser : null;
  } catch {
    return null;
  }
}

export function storeSessionUser(user: SessionUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(WORKSPACE_KEY);
  if (token) {
    void fetch(apiUrl('/api/auth/logout'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => undefined);
  }
}

export function getStoredWorkspace(): Workspace | null {
  try {
    const value = localStorage.getItem(WORKSPACE_KEY);
    return value ? JSON.parse(value) as Workspace : null;
  } catch {
    return null;
  }
}

export function storeWorkspace(workspace: Workspace | null) {
  if (workspace) localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
  else localStorage.removeItem(WORKSPACE_KEY);
}