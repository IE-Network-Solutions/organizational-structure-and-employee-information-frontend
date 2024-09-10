import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getItem, setItem, deleteItem, setCookie } from '@/helpers/storageHelper';

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
  userId: string | null;
  setUserId: (userId: string | null) => void;
}

export const useAuthenticationStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
        token: '',
        setToken: (token: string) => {
          setCookie('token' , token ,30 ),
          set({ token })},
        userId:null,
        setUserId:(userId:string|null)=>set({userId}),
        tenantId: '',
        setTenantId: (tenantId: string) => set({ tenantId }),
        localId: '',
        setLocalId: (localId: string) => set({ localId }),
        loading: false,
        setLoading: (loading: boolean) => set({ loading }),
        error: null,
        setError: (error: string | null) => set({ error }),
      }),
      {
        name: 'authentication-storage', // Unique name for the storage
        getStorage: () => ({
          getItem: async (key) => await getItem(key), // Get item from IndexedDB
          setItem: async (key, value) => await setItem(key, value), // Set item in IndexedDB
          removeItem: async (key) => await deleteItem(key), // Remove item from IndexedDB
        }),
        partialize: (state) => ({
          token: state.token,
          tenantId: state.tenantId,
          localId: state.localId,
          userId:state.userId,
        }),
      },
    ),
  ),
);
