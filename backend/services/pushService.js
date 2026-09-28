/**
 * Push Notification Service
 * --------------------------
 * Configures web-push with VAPID keys and exposes helpers for
 * sending push notifications and managing user subscriptions.
 *
 * VAPID keys are auto-generated on first run and persisted to
 * a local .vapid-keys.json file so they stay stable across
 * server restarts. In production you should set VAPID_PUBLIC_KEY
 * and VAPID_PRIVATE_KEY environment variables instead.
 */

import webPush from 'web-push';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAPID_KEYS_PATH = join(__dirname, '..', '.vapid-keys.json');

// ---------------------------------------------------------------------------
// VAPID key resolution – env vars take precedence, then file, then generate
// ---------------------------------------------------------------------------
function resolveVapidKeys() {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY
    };
  }

  if (existsSync(VAPID_KEYS_PATH)) {
    try {
      const stored = JSON.parse(readFileSync(VAPID_KEYS_PATH, 'utf-8'));
      if (stored.publicKey && stored.privateKey) return stored;
    } catch {
      /* regenerate below */
    }
  }

  const generated = webPush.generateVAPIDKeys();
  writeFileSync(VAPID_KEYS_PATH, JSON.stringify(generated, null, 2));
  console.log('[PushService] Generated new VAPID keys → .vapid-keys.json');
  return generated;
}

const vapidKeys = resolveVapidKeys();

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:focusbuddy@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/** The public VAPID key the frontend needs for PushManager.subscribe() */
export const publicVapidKey = vapidKeys.publicKey;

/**
 * Send a push notification to a single subscription object.
 *
 * @param {PushSubscription} subscription – { endpoint, keys: { p256dh, auth } }
 * @param {{ title: string, body: string, icon?: string, url?: string }} payload
 * @returns {Promise<boolean>} true if delivered, false if the subscription is stale
 */
export async function sendPushNotification(subscription, payload) {
  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    // 404 or 410 means the subscription is expired / unsubscribed
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.warn('[PushService] Subscription expired:', subscription.endpoint);
      return false;
    }
    console.error('[PushService] Failed to send push:', error.message);
    return false;
  }
}

/**
 * Send a push notification to every subscription a user has stored.
 * Returns the count of successful deliveries.
 *
 * @param {import('mongodb').Collection} usersCollection
 * @param {string} userId
 * @param {{ title: string, body: string, icon?: string, url?: string }} payload
 */
export async function sendPushToUser(usersCollection, userId, payload) {
  const user = await usersCollection.findOne({ _id: userId });
  if (!user?.pushSubscriptions?.length) return 0;

  let delivered = 0;
  const staleEndpoints = [];

  for (const sub of user.pushSubscriptions) {
    const ok = await sendPushNotification(sub, payload);
    if (ok) delivered += 1;
    else staleEndpoints.push(sub.endpoint);
  }

  // Clean up stale subscriptions
  if (staleEndpoints.length > 0) {
    await usersCollection.updateOne(
      { _id: userId },
      { $pull: { pushSubscriptions: { endpoint: { $in: staleEndpoints } } } }
    );
  }

  return delivered;
}
