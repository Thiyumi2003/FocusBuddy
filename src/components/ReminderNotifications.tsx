import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { BellRingIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AppNotification, claimDueReminders, getNotifications, hasStoredAuthToken, markNotificationRead } from '../utils/api';

type PermissionState = NotificationPermission | 'unsupported';

export function ReminderNotifications() {
  const [permission, setPermission] = useState<PermissionState>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasStoredAuthToken()) return;
    let checking = false;
    let active = true;

    async function checkDueReminders() {
      if (checking) return;
      checking = true;
      try {
        const dueReminders = await claimDueReminders();
        if (permission === 'granted' && typeof Notification !== 'undefined') {
          for (const reminder of dueReminders) {
            const notification = new Notification(reminder.title, {
              body: `This reminder is due${reminder.dueTime ? ` at ${reminder.dueTime}` : ''}.`,
              tag: reminder.id
            });
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          }
        }
        const history = await getNotifications();
        if (active) setNotifications(history);
      } catch {
        // A temporary network error will be retried on the next polling interval.
      } finally {
        checking = false;
      }
    }

    void checkDueReminders();
    const interval = window.setInterval(() => void checkDueReminders(), 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [permission]);

  async function enableNotifications() {
    if (typeof Notification === 'undefined') {
      setPermission('unsupported');
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') toast.success('Browser reminders enabled.');
  }

  async function showInbox() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && hasStoredAuthToken()) {
      try {
        setNotifications(await getNotifications());
      } catch {
        toast.error('Could not load notification history.');
      }
    }
  }

  async function markRead(notificationId: string) {
    try {
      const updated = await markNotificationRead(notificationId);
      setNotifications((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch {
      toast.error('Could not update this notification.');
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return (
    <div className="fixed right-4 top-[72px] z-50 lg:right-8 lg:top-6">
      <button
        type="button"
        onClick={showInbox}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-controls="notification-inbox"
        title="Notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-ink shadow-card hover:bg-canvas"
      >
        <BellRingIcon className="h-5 w-5" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink px-1 text-[11px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section id="notification-inbox" aria-label="Notification history" className="absolute right-0 top-full mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Notifications</h2>
              <p className="text-xs text-muted">{unreadCount ? `${unreadCount} unread` : 'All caught up'}</p>
            </div>
            {permission === 'default' && (
              <button type="button" onClick={enableNotifications} className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent-ink">
                Enable browser alerts
              </button>
            )}
          </header>
          {permission === 'denied' && <p className="border-b border-line px-4 py-2 text-xs text-muted">Browser alerts are blocked; in-app history is still available.</p>}
          <div className="max-h-[65vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {notifications.map((notification) => (
                  <li key={notification.id} className={`flex items-start gap-3 px-4 py-3 ${notification.readAt ? '' : 'bg-accent-soft/40'}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.readAt ? 'bg-line' : 'bg-accent'}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{notification.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        Due {format(new Date(notification.dueAt), 'MMM d, yyyy')} at {notification.dueTime}
                      </p>
                      <p className="mt-0.5 text-[11px] text-subtle">
                        Alerted {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {!notification.readAt && (
                      <button
                        type="button"
                        onClick={() => void markRead(notification.id)}
                        aria-label={`Mark ${notification.title} as read`}
                        title="Mark as read"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-white hover:text-ink"
                      >
                        <CheckIcon className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {permission === 'unsupported' && <p className="border-t border-line px-4 py-2 text-xs text-muted">Browser alerts are unavailable; in-app history is still available.</p>}
        </section>
      )}
    </div>
  );
}