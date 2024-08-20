import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface StoreState {
  token: string;
  setToken: (token: string) => void;
  tenantId: string;
  setTenantId: (tenantId: string) => void;
  localId: string;
  setLocalId: (tenantId: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAuthenticationStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
        token:
          'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ0MjY5YTE3MzBlNTA3MTllNmIxNjA2ZTQyYzNhYjMyYjEyODA0NDkiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiYWhtZWQgb3VtZXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS2ZYd1N1dFNGSDZUYXdfREtES2poenU3eHMwX3V1NXowZmlsdFI4ZlA1a0ZRelpicGw9czk2LWMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcGVwLWF1dGhlbnRpY2F0aW9uIiwiYXVkIjoicGVwLWF1dGhlbnRpY2F0aW9uIiwiYXV0aF90aW1lIjoxNzIzNzI0NzM1LCJ1c2VyX2lkIjoiTzNDeGlyWG5iRlBHbDFxOVJHZWJGZEpsT25mMiIsInN1YiI6Ik8zQ3hpclhuYkZQR2wxcTlSR2ViRmRKbE9uZjIiLCJpYXQiOjE3MjM3MjQ3MzUsImV4cCI6MTcyMzcyODMzNSwiZW1haWwiOiJhaG1lZGlub3VtZXIxM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMTQzNzE4NjExNzY4NzU5MzAzMiJdLCJlbWFpbCI6WyJhaG1lZGlub3VtZXIxM0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.AApMrfhV9hkwHiLmJpXuCnQIbQNyLLgiKRhaWnWik4Br7vBu41uDB00TVY2pczclMpR7D35j2W8A5Ut3GGLFwo3yFRp9fv_eqpXXl9Rdfcp7Sv8EJ1I-O6gN4Toa9KtPHBWb_OE4GPcrPYg37DmYVUFcCLqFZ3ljP6yas20VJ65WoGM5Lmg3WenczBEnAK8H3HIlnA0CCTwG40HjKf19YljYeo-o2iyiMGUi4YdmxDG2AZMrGJu7CNNRmFjPRMnGMbnugmlfpZ_shwO0pVlGPoSLdannLsOzVs8u2ifuHi2y1SYqB0Ip0mtnB3vMP-FxJhHTCwI5qV8TZ7gEz4nwtQ',
        setToken: (token: string) => set({ token }),
        tenantId: '9fdb9540-607e-4cc5-aebf-0879400d1f69',
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
