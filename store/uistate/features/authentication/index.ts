import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Define your store's state interface
interface StoreState {
  token: string;
  setToken: (token: string) => void;
  tenantId: string;
  setTenantId: (tenantId: string) => void;
  localId: string;
  setLocalId: (tenantId: string) => void;
}

// Define the StateCreator type with the middlewares you are using

// Create the store using the middleware-enhanced state creator
export const useAuthenticationStore = create<StoreState>(
  devtools(
    persist(
      (set) => ({
        token: '',
        setToken: (token: string) => set({ token }),
        tenantId: '',
        setTenantId: (tenantId: string) => set({ tenantId }),
        localId:'',
        setLocalId: (localId:string) =>set({ localId }),
      }),
      {
        name: 'authentication-storage', // Unique name for the storage
        getStorage: () => localStorage, // Use localStorage for persistence
      },
    ),
  ) as any, // Cast to the middleware-enhanced state creator type
);
