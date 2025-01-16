'use client';
import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import AntdConfigProvider from '@/providers/antdProvider';
import ReactQueryWrapper from '@/providers/reactQueryProvider';
import ConditionalNav from '@/providers/conditionalNav';
import { useEffect } from 'react';
import { auth } from '@/utils/firebaseConfig';
import { setCookie } from '@/helpers/storageHelper';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
const manrope = Manrope({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'Selamnew Workspace',
//   description: 'Selamnew Workspace',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const refreshToken = async () => {
      const getCookieFromDocument = (key: string): string | null => {
        const cookies = document.cookie.split('; ');
        const cookie = cookies.find((c) => c.startsWith(`${key}=`));
        return cookie ? cookie.split('=')[1] : null;
      };

      const token = getCookieFromDocument('token');
      if (token) {
        const user = auth.currentUser;
        if (user) {
          try {
            const refreshedToken = await user.getIdToken(true); // Force refresh token
            if (refreshedToken !== token) {
              setCookie('token', refreshedToken, 30);
              useAuthenticationStore.getState().setToken(refreshedToken);
              console.log(
                '------------------automatically refresh Token successfully  ----------------',
              );
            }
          } catch (error) {
            console.error('Error refreshing token:', error);
          }
        }
      }
    };
    refreshToken();
    // Periodically refresh the token every 50 minutes
    const refreshInterval = setInterval(
      () => {
        refreshToken();
        console.log(
          '------------------automatically refresh every 10 sec  ----------------',
        );
      },
      1 * 10 * 1000,
    ); // 50 minutes
    // Clean up the interval on unmount
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);
  return (
    <html lang="en" data-test="layout">
      <body className={manrope.className}>
        <ReactQueryWrapper>
          <AntdRegistry>
            <AntdConfigProvider>
              <ConditionalNav>{children}</ConditionalNav>
            </AntdConfigProvider>
          </AntdRegistry>
        </ReactQueryWrapper>
      </body>
    </html>
  );
}
