/**
 * Push Registration Utility
 * --------------------------
 * Handles notification permission request, PushManager subscription,
 * and sending the subscription JSON to the backend.
 */

const TOKEN_KEY = 'diva.authToken';

function getApiBaseUrl(): string {
  return ((import.meta as any).env?.VITE_API_URL || '').replace(/\/$/, '');
}

/**
 * Convert a URL-safe base64 VAPID key to a Uint8Array
 * (required by PushManager.subscribe)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Fetch the server's public VAPID key.
 */
async function fetchVapidPublicKey(): Promise<string> {
  const res = await fetch(`${getApiBaseUrl()}/api/notifications/vapid-public-key`);
  if (!res.ok) throw new Error('Failed to fetch VAPID key');
  const data = await res.json();
  return data.publicKey;
}

/**
 * Send the PushSubscription JSON to the backend so it can store it
 * on the user's document.
 */
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${getApiBaseUrl()}/api/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(subscription.toJSON())
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save push subscription');
  }
}

/**
 * Master function: request permission → subscribe → send to server.
 *
 * Call this after the user has logged in (e.g. in a useEffect or
 * on a "Enable Notifications" button click).
 *
 * Returns `true` if the user is now subscribed, `false` otherwise.
 */
export async function registerPushNotifications(): Promise<boolean> {
  // --- Guard checks ----------------------------------------------------------
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Push notifications are not supported in this browser.');
    return false;
  }

  // --- Request permission ----------------------------------------------------
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[Push] Notification permission denied.');
    return false;
  }

  try {
    // --- Get or await the service worker registration -------------------------
    const registration = await navigator.serviceWorker.ready;

    // --- Fetch VAPID key from backend ----------------------------------------
    const vapidPublicKey = await fetchVapidPublicKey();
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // --- Check for existing subscription or create a new one -----------------
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      console.log('[Push] New push subscription created.');
    } else {
      console.log('[Push] Using existing push subscription.');
    }

    // --- Send to backend -----------------------------------------------------
    await sendSubscriptionToServer(subscription);
    console.log('[Push] ✅ Push subscription registered on server.');
    return true;
  } catch (error) {
    console.error('[Push] Registration failed:', error);
    return false;
  }
}

/**
 * Unsubscribe the user from push notifications.
 */
export async function unregisterPushNotifications(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    console.log('[Push] Unsubscribed from push notifications.');
  }
}
