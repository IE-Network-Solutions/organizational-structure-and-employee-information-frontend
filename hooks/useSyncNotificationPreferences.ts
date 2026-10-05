'use client';

import { useEffect, useRef } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetNotificationPreferences } from '@/store/server/features/notification/queries';
import { upsertNotificationPreferences } from '@/store/server/features/notification/mutation';
import {
  hydrateNotificationPreferencesStore,
  useNotificationPreferencesStore,
} from '@/store/uistate/features/notification/preferences';

const SAVE_DEBOUNCE_MS = 400;

/**
 * Loads notification preferences from the notification service into the local
 * store (server wins when a row exists), and debounces PUT syncs on change.
 */
export function useSyncNotificationPreferences(): void {
  const userId = useAuthenticationStore((s) => s.userId) ?? '';
  const tenantId = useAuthenticationStore((s) => s.tenantId) ?? undefined;
  const hasHydrated = useNotificationPreferencesStore((s) => s.hasHydrated);
  const byUserId = useNotificationPreferencesStore((s) => s.byUserId);
  const setEnabledMap = useNotificationPreferencesStore((s) => s.setEnabledMap);
  const setPreset = useNotificationPreferencesStore((s) => s.setPreset);

  const userPrefs = userId ? byUserId[userId] : undefined;
  const skipNextSave = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteApplied = useRef<string | null>(null);

  useEffect(() => {
    hydrateNotificationPreferencesStore();
  }, []);

  const { data: remotePrefs, isSuccess } = useGetNotificationPreferences(
    userId,
    !!userId && hasHydrated,
  );

  // Apply server prefs once per user (server is source of truth when present).
  useEffect(() => {
    if (!userId || !hasHydrated || !isSuccess || !remotePrefs) return;
    if (remoteApplied.current === userId) return;
    remoteApplied.current = userId;

    const hasRemoteRow = Boolean(remotePrefs.updatedAt);
    if (!hasRemoteRow) return;

    skipNextSave.current = true;
    setPreset(userId, remotePrefs.preset ?? 'all');
    setEnabledMap(userId, remotePrefs.enabledById ?? {});
  }, [userId, hasHydrated, isSuccess, remotePrefs, setPreset, setEnabledMap]);

  // Debounced save of local changes to the API.
  useEffect(() => {
    if (!userId || !hasHydrated || !userPrefs) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void upsertNotificationPreferences({
        userId,
        tenantId,
        preset: userPrefs.preset,
        enabledById: userPrefs.enabledById,
      }).catch(() => {
        /* keep local prefs if API is temporarily unavailable */
      });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [userId, tenantId, hasHydrated, userPrefs]);
}
