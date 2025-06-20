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
    'C',
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
        {/* PWA Meta Tags - FORCE FULLSCREEN */}
        <meta name="application-name" content="Selamnew Workspace" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Selamnew Workspace" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#1890ff" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Force Fullscreen - Hide URL Bar */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="320" />
        <meta name="screen-orientation" content="portrait" />
        <meta name="x5-orientation" content="portrait" />
        <meta name="full-screen" content="yes" />
        <meta name="x5-fullscreen" content="true" />
        <meta name="browsermode" content="application" />
        <meta name="x5-page-mode" content="app" />
        <meta name="msapplication-navbutton-color" content="#1890ff" />
        <meta name="theme-color" content="#1890ff" />

        {/* CRITICAL: Force hide address bar */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui"
        />

        {/* Microsoft Edge */}
        <meta
          name="msapplication-TileImage"
          content="/icons/manifest-icon-144.png"
        />

        {/* Force Hide URL Bar Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Force hide address bar on mobile
                function hideAddressBar() {
                  if (window.innerHeight !== screen.height) {
                    setTimeout(function() {
                      window.scrollTo(0, 1);
                      setTimeout(function() {
                        window.scrollTo(0, 0);
                      }, 50);
                    }, 100);
                  }
                }
                
                // Run on load and resize
                window.addEventListener('load', hideAddressBar);
                window.addEventListener('orientationchange', function() {
                  setTimeout(hideAddressBar, 500);
                });
                
                // Continuous attempt to hide address bar
                setInterval(function() {
                  if (window.pageYOffset === 0) {
                    window.scrollTo(0, 1);
                    setTimeout(function() {
                      window.scrollTo(0, 0);
                    }, 100);
                  }
                }, 3000);

                // PWA Navigation Enhancement - Prevent browser confirmations
                if (window.matchMedia('(display-mode: standalone)').matches) {
                  // Disable browser navigation confirmations in PWA mode
                  window.addEventListener('beforeunload', function(e) {
                    // In PWA mode, allow smooth navigation without confirmation
                    delete e['returnValue'];
                  });
                  
                  // Prevent right-click context menu in PWA mode
                  document.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                  });
                  
                  // Handle back button navigation smoothly
                  window.addEventListener('popstate', function(event) {
                    // Allow normal navigation without confirmation
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${manrope.className} pwa-viewport`}>
        <div className="status-bar-safe">
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
        </div>
      </body>
    </html>
  );
}
