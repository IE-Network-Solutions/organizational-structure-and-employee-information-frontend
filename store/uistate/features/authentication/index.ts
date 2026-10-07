import { setCookie } from '@/helpers/storageHelper';
import { Permissions } from '@/types/commons/permissionEnum';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

const FISCAL_YEAR_MANAGE_PERMISSIONS = [
  Permissions.CreateCalendar,
  Permissions.UpdateCalendar,
  Permissions.DeleteCalendar,
];

// Edge middleware can't read the zustand/localStorage-persisted userData, so
// derive a small boolean cookie it can check instead of the full permission
// list. Owners always pass, matching AccessGuard.checkAccess's owner bypass.
const syncCanManageFiscalYearCookie = (userData: Record<string, any>) => {
  const role = userData?.role?.slug || '';
  const userPermissions = userData?.userPermissions || [];
  const canManageFiscalYear =
    role === 'owner' ||
    FISCAL_YEAR_MANAGE_PERMISSIONS.some((permission) =>
      userPermissions.some(
        (userPermission: { permission?: { slug: string } }) =>
          userPermission.permission?.slug === permission,
      ),
    );
  setCookie('canManageFiscalYear', canManageFiscalYear ? 'true' : 'false', 30);
};

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
};

interface StoreState {
  token: string;
  setToken: (token: string) => void;
  tenantId: string;
  setTenantId: (tenantId: string) => void;
  userId: string;
  setUserId: (userId: string) => void;
  localId: string;
  setUserData: (userId: Record<string, any>) => void;
  userData: Record<string, any>;
  setLocalId: (localId: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  hostname: string | null;
  setHostName: (error: string | null) => void;
  activeCalendar: string | number | Date | undefined;
  setActiveCalendar: (
    activeCalendar: string | number | Date | undefined,
  ) => void;
  loggedUserRole: string;
  setLoggedUserRole: (loggedUserRole: string) => void;
  is2FA: boolean;
  setIs2FA: (is2FA: boolean) => void;

  user2FA: { email: string; pass: string };
  setUser2FA: (user2FA: { email: string; pass: string }) => void;
  twoFactorAuthEmail: string;
  setTwoFactorAuthEmail: (twoFactorAuthEmail: string) => void;
  countdown: number;
  setCountdown: (value: number) => void;
  resetCountdown: () => void;
  decrementCountdown: () => void;
  isCheckingPermissions: boolean;
  setIsCheckingPermissions: (isCheckingPermissions: boolean) => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}
export const useAuthenticationStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
        token: '',
        setToken: (token: string) => {
          setCookie('token', token, 30); // Optionally set a cookie
          set({ token });
        },
        tenantId: '',
        setTenantId: (tenantId: string) => {
          set({ tenantId });
        },
        userId: '',
        setUserId: (userId: string) => {
          set({ userId });
        },
        localId: '',
        setLocalId: (localId: string) => {
          set({ localId });
        },
        userData: {},
        setUserData: (userData: Record<string, any>) => {
          syncCanManageFiscalYearCookie(userData);
          set({ userData });
        },
        loggedUserRole: '',
        setLoggedUserRole: (loggedUserRole: string) => {
          setCookie('loggedUserRole', loggedUserRole, 30);
          set({ loggedUserRole });
        },
        loading: false, // Non-persistent state
        setLoading: (loading: boolean) => set({ loading }),
        error: null, // Non-persistent state
        setError: (error: string | null) => set({ error }),

        hostname: null, // Non-persistent state
        setHostName: (hostname: string | null) => set({ hostname }),

        activeCalendar: '',
        setActiveCalendar: (
          activeCalendar: string | number | Date | undefined,
        ) => {
          setCookie('activeCalendar', activeCalendar, 30);
          set({ activeCalendar });
        },
        is2FA: false,
        setIs2FA: (is2FA: boolean) => set({ is2FA }),

        user2FA: { email: '', pass: '' },
        setUser2FA: (user2FA: { email: string; pass: string }) =>
          set({ user2FA }),
        twoFactorAuthEmail: '',
        setTwoFactorAuthEmail: (twoFactorAuthEmail: string) =>
          set({ twoFactorAuthEmail }),
        countdown: 300, // 5 minutes in seconds
        setCountdown: (value: number) => set({ countdown: value }),
        resetCountdown: () => set({ countdown: 300 }),
        decrementCountdown: () =>
          set((state) => ({
            countdown: state.countdown > 0 ? state.countdown - 1 : 0,
          })),
        isCheckingPermissions: true,
        setIsCheckingPermissions: (isCheckingPermissions: boolean) =>
          set({ isCheckingPermissions }),
        hasHydrated: false,
        setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
      }),
      {
        name: 'workspace-auth', // Per-product key (shared origin) — do not reuse across products
        storage: createJSONStorage(() =>
          typeof window !== 'undefined' ? localStorage : noopStorage,
        ),
        partialize: (state) => ({
          token: state.token,
          tenantId: state.tenantId,
          localId: state.localId,
          userId: state.userId,
          // Persist full userData including userPermissions so they survive
          // page reloads. The UserSessionRefresher and navBar still fetch
          // fresh permissions from the backend on every route change / tab
          // focus, so any backend permission changes will be picked up
          // quickly. Keeping the cached copy prevents the race condition
          // where the permission check runs before the fetch completes and
          // incorrectly redirects to /unauthorized.
          userData: state.userData,
          activeCalendar: state.activeCalendar,
        }),
        onRehydrateStorage: () => () => {
          useAuthenticationStore.getState().setHasHydrated(true);
        },
        // getStorage: () => ({
        //   getItem: async (key: string) => {
        //     const storedValue = await get(key); // Get item from IndexedDB
        //     return storedValue ?? null;
        //   },
        //   setItem: async (key: string, value: any) => {
        //     await set(key, value); // Set item in IndexedDB
        //   },
        //   removeItem: async (key: string) => {
        //     await del(key); // Remove item from IndexedDB
        //   },
        // }),
        // partialize: (state) => ({
        //   token: state.token,
        //   tenantId: state.tenantId,
        //   localId: state.localId,
        //   userId: state.userId,
        // }),
      },
    ),
  ),
);

if (typeof window !== 'undefined') {
  useAuthenticationStore.persist.onFinishHydration(() => {
    useAuthenticationStore.getState().setHasHydrated(true);
  });
  if (useAuthenticationStore.persist.hasHydrated()) {
    useAuthenticationStore.getState().setHasHydrated(true);
  }
}
