import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import AntdConfigProvider from '@/providers/antdProvider';
import ReactQueryWrapper from '@/providers/reactQueryProvider';
import ConditionalNav from '@/providers/conditionalNav';
import RecaptchaProvider from '@/components/recaptcha';
import { PWAProvider } from '@/providers/PWAProvider';
const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Selamnew Workspace',
  description:
    'Complete enterprise management system for organizational structure, employee information, payroll, recruitment, and more',
  keywords: [
    'enterprise',
    'management',
    'HR',
    'payroll',
    'recruitment',
    'organizational',
    'workspace',
  ],
  authors: [{ name: 'Selamnew' }],
  creator: 'Selamnew',
  publisher: 'Selamnew',
  applicationName: 'Selamnew Workspace',
  generator: 'Next.js',
  manifest: '/manifest.json',
  themeColor: '#1890ff',
  colorScheme: 'light',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Selamnew Workspace',
    startupImage: [
      '/icons/apple-splash-2048-2732.jpg',
      '/icons/apple-splash-1668-2224.jpg',
      '/icons/apple-splash-1536-2048.jpg',
      '/icons/apple-splash-1125-2436.jpg',
      '/icons/apple-splash-1242-2208.jpg',
      '/icons/apple-splash-750-1334.jpg',
      '/icons/apple-splash-828-1792.jpg',
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Selamnew Workspace',
    title: 'Selamnew Workspace - Enterprise Management System',
    description:
      'Complete enterprise management system for organizational structure, employee information, payroll, recruitment, and more',
    images: [
      {
        url: '/icons/manifest-icon-512.png',
        width: 512,
        height: 512,
        alt: 'Selamnew Workspace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Selamnew Workspace - Enterprise Management System',
    description:
      'Complete enterprise management system for organizational structure, employee information, payroll, recruitment, and more',
    images: ['/icons/manifest-icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icons/android/android-launchericon-48-48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        url: '/icons/android/android-launchericon-72-72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        url: '/icons/android/android-launchericon-96-96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        url: '/icons/android/android-launchericon-144-144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        url: '/icons/android/android-launchericon-192-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      { url: '/icons/ios/256.png', sizes: '256x256', type: 'image/png' },
      {
        url: '/icons/android/android-launchericon-512-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      { url: '/icons/ios/57.png', sizes: '57x57', type: 'image/png' },
      { url: '/icons/ios/60.png', sizes: '60x60', type: 'image/png' },
      { url: '/icons/ios/72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/ios/76.png', sizes: '76x76', type: 'image/png' },
      { url: '/icons/ios/114.png', sizes: '114x114', type: 'image/png' },
      { url: '/icons/ios/120.png', sizes: '120x120', type: 'image/png' },
      { url: '/icons/ios/144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/ios/152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/ios/180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/icons/ios/180.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-test="layout">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Selamnew Workspace" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Selamnew Workspace" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#1890ff" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Splash Screens */}
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-2048-2732.jpg"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1668-2224.jpg"
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1536-2048.jpg"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1125-2436.jpg"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1242-2208.jpg"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-750-1334.jpg"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-828-1792.jpg"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />

        {/* Microsoft Edge */}
        <meta
          name="msapplication-TileImage"
          content="/icons/manifest-icon-144.png"
        />
      </head>
      <body className={manrope.className}>
        <PWAProvider>
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
        </PWAProvider>
      </body>
    </html>
  );
}
