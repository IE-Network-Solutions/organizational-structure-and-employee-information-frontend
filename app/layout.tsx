import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import AntdConfigProvider from '@/providers/antdProvider';
import ReactQueryWrapper from '@/providers/reactQueryProvider';
import ConditionalNav from '@/providers/conditionalNav';

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
