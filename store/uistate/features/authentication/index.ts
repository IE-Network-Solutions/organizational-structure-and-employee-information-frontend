import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Define your store's state interface
interface StoreState {
  token: string | null;
  setToken: (token: string | null) => void;
  tenantId: string | null;
  setTenantId: (tenantId: string | null) => void;
}

// Define the StateCreator type with the middlewares you are using

// Create the store using the middleware-enhanced state creator
export const useAuthenticationStore = create<StoreState>(
  devtools(
    persist(
      (set) => ({
        token: 'ahmedinoumer0987643234567890',
        setToken: (token: string | null) => set({ token }),
        tenantId: '9fdb9540-607e-4cc5-aebf-0879400d1f69',
        setTenantId: (tenantId: string | null) => set({ tenantId }),
      }),
      {
        name: 'authentication-storage', // Unique name for the storage
        getStorage: () => localStorage, // Use localStorage for persistence
      },
    ),
  ) as any, // Cast to the middleware-enhanced state creator type
);
