import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import AntdConfigProvider from '@/providers/antdProvider';
import ReactQueryWrapper from '@/providers/reactQueryProvider';
import ConditionalNav from '@/providers/conditionalNav';
import RecaptchaProvider from '@/components/recaptcha';
const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Selamnew Workspace',
  description: 'Selamnew Workspace',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-test="layout">
      <body className={manrope.className}>
        {/* <AuthProvider> */}
        <ReactQueryWrapper>
          <AntdRegistry>
            <AntdConfigProvider>
              <RecaptchaProvider>
                <ConditionalNav>{children}</ConditionalNav>
              </RecaptchaProvider>
            </AntdConfigProvider>
          </AntdRegistry>
        </ReactQueryWrapper>
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
