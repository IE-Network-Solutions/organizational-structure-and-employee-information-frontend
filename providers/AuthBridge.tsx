'use client';

import { useEffect } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { fetchCurrentUserAndUpdateStore } from '@/store/server/features/employees/authentication/queries';

/** The Firebase ID token Core set on this shared origin, if any. */
function readTokenCookie(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

/** Firebase uid from an ID token (for bootstrapping off the shared cookie). */
function decodeUidFromToken(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    const uid = payload?.user_id || payload?.sub || payload?.uid;
    return typeof uid === 'string' ? uid : '';
  } catch {
    return '';
  }
}

/**
 * Mirrors the shared Firebase session (same origin as Core + the other products)
 * into workspace's store. A token alone isn't a usable session — workspace also
 * needs the resolved tenant and the org/emp profile (id, role) — so on first
 * sight of the user it runs the full bootstrap via fetchCurrentUserAndUpdateStore
 * (the org/emp `/users/firebase/:uid` lookup, same backend Core uses).
 *
 *  - Sign in on Core (or any product) -> populate the full session here.
 *  - Silent ~hourly token refresh      -> keep the token fresh, skip re-fetch.
 *  - Sign out anywhere                 -> clear the local session.
 *
 * Falls back to the shared `token` cookie when this app instance hasn't restored
 * a Firebase user yet.
 */
export default function AuthBridge() {
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async (token: string, uid: string) => {
      const store = useAuthenticationStore.getState();
      const alreadyHasSession =
        Boolean(store.tenantId) && store.localId === uid;
      store.setToken(token);
      store.setLocalId(uid);
      if (!alreadyHasSession) {
        await fetchCurrentUserAndUpdateStore();
      }
    };

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (cancelled) return;
      const store = useAuthenticationStore.getState();

      if (user) {
        await bootstrap(await user.getIdToken(), user.uid);
        return;
      }

      const cookieToken = readTokenCookie();
      if (cookieToken) {
        await bootstrap(cookieToken, decodeUidFromToken(cookieToken));
        return;
      }

      // Truly signed out on this origin (e.g. from Core).
      store.setToken('');
      store.setLocalId('');
      store.setUserId('');
      store.setUserData({});
      store.setTenantId('');
      store.setLoggedUserRole('');
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return null;
}
