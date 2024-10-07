import { setCookie } from '@/helpers/storageHelper';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface StoreState {
  token: string;
  setToken: (token: string) => void;
  tenantId: string;
  setTenantId: (tenantId: string) => void;
  localId: string;
  setLocalId: (localId: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  userId: string;
  setUserId: (userId: string) => void;
}

export const useAuthenticationStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
        token: '',
        setToken: (token: string) => {
          setCookie('token', token, 30), set({ token });
        },
        userId: '',
        setUserId: (userId: string) => set({ userId }),
        tenantId: '',
        setTenantId: (tenantId: string) => set({ tenantId }),
        localId: '',
        setLocalId: (localId: string) => set({ localId }),
        loading: false, // Non-persistent state
        setLoading: (loading: boolean) => set({ loading }), // Non-persistent method
        error: null, // Non-persistent state
        setError: (error: string | null) => set({ error }), // Non-persistent method
      }),
      {
        name: 'authentication-storage', // Unique name for the storage
        getStorage: () => localStorage, // Use localStorage for persistence
        partialize: (state) => ({
          token: state.token,
          tenantId: state.tenantId,
          localId: state.localId,
          // 'loading' and 'error' are not included here, so they won't be persisted
        }),
      },
    ),
  ),
);
