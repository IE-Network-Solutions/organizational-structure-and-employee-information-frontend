import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';
import {
  KNOWN_NOTIFICATION_PREFERENCES,
  type DeliveryPreset,
} from '@/store/server/features/notification/preferenceCatalog';

export type UserNotificationPreferenceState = {
  preset: DeliveryPreset;
  enabledById: Record<string, boolean>;
};

type NotificationPreferencesStore = {
  /** Preferences keyed by authenticated user id. */
  byUserId: Record<string, UserNotificationPreferenceState>;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  getUserPrefs: (userId: string) => UserNotificationPreferenceState;
  setPreset: (userId: string, preset: DeliveryPreset) => void;
  setEnabled: (userId: string, preferenceId: string, enabled: boolean) => void;
  setEnabledMap: (userId: string, enabledById: Record<string, boolean>) => void;
  ensureDefaults: (userId: string, preferenceIds?: string[]) => void;
  applyPreset: (userId: string, preset: DeliveryPreset) => void;
};

/**
 * Lazily touch `window.localStorage` on every call.
 * Zustand 4's `createJSONStorage(getStorage)` invokes `getStorage()` once at
 * module init — if that happens on the server, a noop storage gets baked in
 * forever and prefs never persist across restarts.
 */
const lazyLocalStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(name);
  },
};

function defaultEnabledMap(): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  for (const item of KNOWN_NOTIFICATION_PREFERENCES) {
    map[item.id] = item.defaultEnabled !== false;
  }
  return map;
}

export function createDefaultUserPrefs(): UserNotificationPreferenceState {
  return {
    preset: 'all',
    enabledById: defaultEnabledMap(),
  };
}

export const useNotificationPreferencesStore =
  create<NotificationPreferencesStore>()(
    persist(
      (set, get) => ({
        byUserId: {},
        hasHydrated: false,
        setHasHydrated: (value) => set({ hasHydrated: value }),

        getUserPrefs: (userId) => {
          if (!userId) return createDefaultUserPrefs();
          return get().byUserId[userId] ?? createDefaultUserPrefs();
        },

        setPreset: (userId, preset) => {
          if (!userId || !get().hasHydrated) return;
          set((state) => {
            const current = state.byUserId[userId] ?? createDefaultUserPrefs();
            return {
              byUserId: {
                ...state.byUserId,
                [userId]: { ...current, preset },
              },
            };
          });
        },

        setEnabled: (userId, preferenceId, enabled) => {
          if (!userId || !preferenceId || !get().hasHydrated) return;
          set((state) => {
            const current = state.byUserId[userId] ?? createDefaultUserPrefs();
            return {
              byUserId: {
                ...state.byUserId,
                [userId]: {
                  ...current,
                  enabledById: {
                    ...current.enabledById,
                    [preferenceId]: enabled,
                  },
                },
              },
            };
          });
        },

        setEnabledMap: (userId, enabledById) => {
          if (!userId || !get().hasHydrated) return;
          set((state) => {
            const current = state.byUserId[userId] ?? createDefaultUserPrefs();
            return {
              byUserId: {
                ...state.byUserId,
                [userId]: {
                  ...current,
                  enabledById: { ...enabledById },
                },
              },
            };
          });
        },

        ensureDefaults: (userId, preferenceIds = []) => {
          if (!userId || !get().hasHydrated) return;
          set((state) => {
            const existing = state.byUserId[userId];
            const current = existing ?? createDefaultUserPrefs();
            const enabledById = { ...current.enabledById };
            let changed = !existing;

            for (const item of KNOWN_NOTIFICATION_PREFERENCES) {
              if (enabledById[item.id] === undefined) {
                enabledById[item.id] = item.defaultEnabled !== false;
                changed = true;
              }
            }
            for (const id of preferenceIds) {
              if (enabledById[id] === undefined) {
                enabledById[id] = true;
                changed = true;
              }
            }

            if (!changed) return state;
            return {
              byUserId: {
                ...state.byUserId,
                [userId]: {
                  preset: current.preset,
                  enabledById,
                },
              },
            };
          });
        },

        applyPreset: (userId, preset) => {
          if (!userId || !get().hasHydrated) return;
          // Only switch the visible filter — never rewrite toggle states.
          set((state) => {
            const current = state.byUserId[userId] ?? createDefaultUserPrefs();
            if (current.preset === preset) return state;
            return {
              byUserId: {
                ...state.byUserId,
                [userId]: {
                  ...current,
                  preset,
                },
              },
            };
          });
        },
      }),
      {
        name: 'notification-delivery-preferences',
        storage: createJSONStorage(() => lazyLocalStorage),
        partialize: (state) => ({
          byUserId: state.byUserId,
        }),
        // Next.js App Router: rehydrate manually on the client so we never
        // overwrite localStorage with empty defaults during SSR/startup.
        skipHydration: true,
      },
    ),
  );

let rehydrateStarted = false;

/** Call once on the client to load persisted prefs from localStorage. */
export function hydrateNotificationPreferencesStore(): void {
  if (typeof window === 'undefined' || rehydrateStarted) return;
  rehydrateStarted = true;

  void Promise.resolve(
    useNotificationPreferencesStore.persist.rehydrate(),
  ).finally(() => {
    useNotificationPreferencesStore.getState().setHasHydrated(true);
  });
}
