import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import AntdConfigProvider from '@/providers/antdProvider';
import ReactQueryWrapper from '@/providers/reactQueryProvider';
import ConditionalNav from '@/providers/conditionalNav';
import axios from 'axios';
const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PEP | Productivity Enhancement Platform',
  description: 'Productivity Enhancement Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //Axios 
  // axios.interceptors.response.use(
  //   (response) => {
  //     // Any status code that lies within the range of 2xx will trigger this function
  //     return response;
  //   },
  //   (error) => {
  //     // Any status codes that falls outside the range of 2xx will trigger this function
  //     const { response } = error;

  //     if (response && (response.status === 401 || response.status === 403)) {
  //       // Log the user out (replace this with your actual logout logic)
  //       console.log('Unauthorized or Forbidden. Logging out...');
  //       // For example, redirect to the login page:
  //       window.location.href = '/login'; // Or use your logout method
  //     }

  //     return Promise.reject(error);
  //   },
  // );
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
