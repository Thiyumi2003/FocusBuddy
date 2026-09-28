/**
 * Notification Cron Job
 * ----------------------
 * Runs every 1 minute via node-cron. Scans the `reminders` collection for
 * upcoming reminders and sends Web Push notifications at two offsets:
 *
 *   • 24 hours before  → "1 Day Remaining 📅"
 *   • 30 minutes before → "30 Minutes Remaining ⏰"
 *
 * Uses boolean flags (`notified1DayBefore`, `notified30MinBefore`) on each
 * reminder document to ensure notifications are never sent twice.
 */

import cron from 'node-cron';
import { sendPushToUser } from '../services/pushService.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THIRTY_MIN_MS = 30 * 60 * 1000;

/**
 * Start the notification cron.
 *
 * @param {object} collections – MongoDB collections
 * @param {import('mongodb').Collection} collections.reminders
 * @param {import('mongodb').Collection} collections.users
 */
export function startNotificationCron({ reminders, users }) {
  // Every 1 minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // --- 1) "1 Day Remaining 📅" notifications -----------------------------------
      const oneDayFromNow = new Date(now.getTime() + ONE_DAY_MS);

      const dueIn1Day = await reminders.find({
        status: 'open',
        dueAt: { $lte: oneDayFromNow, $gt: now },
        notified1DayBefore: { $ne: true }
      }).toArray();

      for (const reminder of dueIn1Day) {
        const userId = reminder.assignee?.id || reminder.creatorUserId;

        const payload = {
          title: '⏳ 1 Day Remaining!',
          body: `Your task "${reminder.title}" is due tomorrow.`,
          icon: '/pwa-icon.svg',
          badge: '/pwa-icon.svg',
          image: '/197d9473-c64a-4598-aae4-2c6c9702de05.jpg', // Rich banner image
          url: '/'
        };

        await sendPushToUser(users, userId, payload);

        await reminders.updateOne(
          { _id: reminder._id },
          { $set: { notified1DayBefore: true } }
        );

        console.log(`[NotificationCron] 1-day alert sent for "${reminder.title}" → user ${userId}`);
      }

      // --- 2) "30 Minutes Remaining ⏰" notifications --------------------------------
      const thirtyMinFromNow = new Date(now.getTime() + THIRTY_MIN_MS);

      const dueIn30Min = await reminders.find({
        status: 'open',
        dueAt: { $lte: thirtyMinFromNow, $gt: now },
        notified30MinBefore: { $ne: true }
      }).toArray();

      for (const reminder of dueIn30Min) {
        const userId = reminder.assignee?.id || reminder.creatorUserId;

        const payload = {
          title: '🚨 30 Minutes Remaining!',
          body: `Almost time for "${reminder.title}". Get ready!`,
          icon: '/pwa-icon.svg',
          badge: '/pwa-icon.svg',
          image: '/618c57b1-5c14-4d5f-ba49-a0e69cfcb31b.jpg', // Rich banner image
          url: '/'
        };

        await sendPushToUser(users, userId, payload);

        await reminders.updateOne(
          { _id: reminder._id },
          { $set: { notified30MinBefore: true } }
        );

        console.log(`[NotificationCron] 30-min alert sent for "${reminder.title}" → user ${userId}`);
      }
    } catch (error) {
      console.error('[NotificationCron] Error during cron run:', error);
    }
  });

  console.log('[NotificationCron] ✅ Cron job started – checking reminders every 1 minute');
}
