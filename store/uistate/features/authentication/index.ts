import { setCookie } from '@/helpers/storageHelper';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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
  activeCalendar: string | number | Date | undefined;
  setActiveCalendar: (
    activeCalendar: string | number | Date | undefined,
  ) => void;
  loggedUserRole: string;
  setLoggedUserRole: (loggedUserRole: string) => void;
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

        activeCalendar: '',
        setActiveCalendar: (
          activeCalendar: string | number | Date | undefined,
        ) => {
          setCookie('activeCalendar', activeCalendar, 30);
          set({ activeCalendar });
        },
      }),
      {
        name: 'authentications-storage', // Unique name for the storage
        getStorage: () => localStorage, // Use localStorage for persistence
        partialize: (state) => ({
          token: state.token,
          tenantId: state.tenantId,
          localId: state.localId,
          userId: state.userId,
          userData: state.userData,
          activeCalendar: state.activeCalendar,
        }),
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
