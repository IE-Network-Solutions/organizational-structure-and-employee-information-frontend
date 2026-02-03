'use client';

import { useEffect, useRef } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { registerPushSubscription } from '@/store/server/features/notification/mutation';
import { VAPID_PUBLIC_KEY } from '@/utils/constants';

/**
 * Converts a base64url-encoded VAPID public key to Uint8Array for pushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the current push subscription with the notification backend when:
 * - User is logged in (userId set)
 * - Notification permission is granted
 * - Service worker is ready and VAPID key is configured
 * Runs once per userId when conditions are met. Does not auto-request permission.
 */
export function usePushSubscription(): void {
  const userId = useAuthenticationStore((s) => s.userId);
  const tenantId = useAuthenticationStore((s) => s.tenantId);
  const registeredRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !userId ||
      !VAPID_PUBLIC_KEY
    ) {
      return;
    }
    if (Notification.permission !== 'granted') return;

    if (registeredRef.current === userId) {
      return;
    }

    let cancelled = false;

    void unsubscribeMainSwPush().then(() => getActivePushRegistration())
      .then((registration) => {
        if (cancelled || !registration?.pushManager || !VAPID_PUBLIC_KEY)
          return;

        const applicationServerKey = urlBase64ToUint8Array(
          VAPID_PUBLIC_KEY,
        ) as BufferSource;

        return registration.pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          })
          .then((subscription) => {
            if (cancelled) return;
            const payload = {
              userId,
              subscription: subscription.toJSON(),
              ...(tenantId && { tenantId }),
            };
            return registerPushSubscription(payload);
          })
          .then(() => {
            if (!cancelled) registeredRef.current = userId;
          });
      })
      .catch(() => {
        registeredRef.current = null;
      });

    return () => {
      cancelled = true;
    };
  }, [userId, tenantId]);
}

/**
 * Requests notification permission (requires user gesture in some browsers).
 * Returns current permission.
 */
export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve('denied');
  }
  if (Notification.permission !== 'default') {
    return Promise.resolve(Notification.permission);
  }
  return Notification.requestPermission();
}

const SW_ACTIVATE_TIMEOUT_MS = 45000;
const SW_POLL_INTERVAL_MS = 200;
const REGISTER_API_TIMEOUT_MS = 15000;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms),
    ),
  ]);
}

/**
 * Wait for a registration to have an active worker (polling + skipWaiting).
 * Resolves with the same registration when registration.active is set.
 */
function waitForRegistrationActive(
  registration: ServiceWorkerRegistration,
  timeoutMs: number,
): Promise<ServiceWorkerRegistration> {
  if (registration.active) return Promise.resolve(registration);
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      if (registration.active) {
        resolve(registration);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        reject(
          new Error(
            'Timeout: service worker did not activate. Reload the page and try again, or enable push from the notification bell later.',
          ),
        );
        return;
      }
      if (registration.waiting) {
        (
          registration.waiting as ServiceWorker & {
            skipWaiting(): Promise<void>;
          }
        ).skipWaiting();
      }
      setTimeout(poll, SW_POLL_INTERVAL_MS);
    };
    if (registration.waiting) {
      (
        registration.waiting as ServiceWorker & { skipWaiting(): Promise<void> }
      ).skipWaiting();
    }
    poll();
  });
}

/** Push-only worker: small and activates quickly so "Allow notifications" does not time out. */
const PUSH_SW_SCOPE = '/push/';
const PUSH_SW_SCRIPT = '/sw-push.js';

/**
 * Unsubscribe any push subscription on the main app SW so the backend only uses the push-worker subscription.
 */
async function unsubscribeMainSwPush(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration('/');
  if (!reg?.pushManager) return;
  const subs = await reg.pushManager.getSubscription();
  if (subs) await subs.unsubscribe();
}

async function getActivePushRegistration(): Promise<ServiceWorkerRegistration> {
  const sw = navigator.serviceWorker;
  const existing = await sw.getRegistration(PUSH_SW_SCOPE);
  if (existing?.active) return existing;

  const registration = await sw.register(PUSH_SW_SCRIPT, {
    scope: PUSH_SW_SCOPE,
    updateViaCache: 'imports',
  });
  if (registration.active) return registration;

  const timeoutMsg =
    'Timeout: push service worker did not activate. Reload the page and try again.';

  const activeRegistration = await withTimeout(
    waitForRegistrationActive(registration, SW_ACTIVATE_TIMEOUT_MS),
    SW_ACTIVATE_TIMEOUT_MS + 2000,
    timeoutMsg,
  );
  return activeRegistration;
}

export async function requestAndRegisterPushSubscription(
  userId: string,
  tenantId?: string,
): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    !userId ||
    !VAPID_PUBLIC_KEY
  ) {
    return false;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return false;

  await unsubscribeMainSwPush();

  const registration = await getActivePushRegistration();

  if (!registration.pushManager) return false;

  const applicationServerKey = urlBase64ToUint8Array(
    VAPID_PUBLIC_KEY,
  ) as BufferSource;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  await withTimeout(
    registerPushSubscription({
      userId,
      subscription: subscription.toJSON(),
      ...(tenantId && { tenantId }),
    }),
    REGISTER_API_TIMEOUT_MS,
    'Timeout: server did not respond. Check network and NOTIFICATION_URL.',
  );
  return true;
}
