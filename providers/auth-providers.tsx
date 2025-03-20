'use client';

import { useEffect, createContext, useContext } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const AuthContext = createContext<{ token: string }>({ token: '' });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setToken } = useAuthenticationStore();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const newToken = await user.getIdToken(true);
        setToken(newToken);
        localStorage.setItem('token', newToken);
      } else {
        setToken('');
        localStorage.removeItem('token');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ token }}>{children}</AuthContext.Provider>
  );
}

export function useAuthToken() {
  return useContext(AuthContext);
}
