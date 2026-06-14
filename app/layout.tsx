import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import { App as AntdApp } from 'antd';
import AntdConfigProvider from '@/providers/antdProvider';
import ReactQueryWrapper from '@/providers/reactQueryProvider';
import ConditionalNav from '@/providers/conditionalNav';
import UserSessionRefresher from '@/providers/UserSessionRefresher';
import AuthBridge from '@/providers/AuthBridge';
import RecaptchaProvider from '@/components/recaptcha';
import { PWAProvider } from '@/providers/PWAProvider';
import { NotificationSocketProvider } from '@/providers/NotificationSocketProvider';
import RouteTopLoader from '@/components/RouteTopLoader';

// Disable static prerendering globally; ensure all pages are rendered dynamically
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Keep in sync with `basePath` in next.config.mjs. Next 14 does NOT prefix
// metadata/manifest/icon URLs (or raw <meta> tags) with the configured basePath,
// so we prepend it explicitly for every static asset served from public/.
const BASE_PATH = '/workspace';
const asset = (path: string) => `${BASE_PATH}${path}`;

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
    'employee',
    'PWA',
    'business',
  ],
  authors: [{ name: 'Selamnew' }],
  creator: 'Selamnew',
  publisher: 'Selamnew',
  applicationName: 'Selamnew Workspace',
  generator: 'Next.js',
  manifest: asset('/manifest.json'),
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
        url: asset('/icons/manifest-icon-512.png'),
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
    images: [asset('/icons/manifest-icon-512.png')],
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
        url: asset('/icons/android/android-launchericon-48-48.png'),
        sizes: '48x48',
        type: 'image/png',
      },
      {
        url: asset('/icons/android/android-launchericon-72-72.png'),
        sizes: '72x72',
        type: 'image/png',
      },
      {
        url: asset('/icons/android/android-launchericon-96-96.png'),
        sizes: '96x96',
        type: 'image/png',
      },
      {
        url: asset('/icons/android/android-launchericon-144-144.png'),
        sizes: '144x144',
        type: 'image/png',
      },
      {
        url: asset('/icons/android/android-launchericon-192-192.png'),
        sizes: '192x192',
        type: 'image/png',
      },
      { url: asset('/icons/ios/256.png'), sizes: '256x256', type: 'image/png' },
      {
        url: asset('/icons/android/android-launchericon-512-512.png'),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      { url: asset('/icons/ios/57.png'), sizes: '57x57', type: 'image/png' },
      { url: asset('/icons/ios/60.png'), sizes: '60x60', type: 'image/png' },
      { url: asset('/icons/ios/72.png'), sizes: '72x72', type: 'image/png' },
      { url: asset('/icons/ios/76.png'), sizes: '76x76', type: 'image/png' },
      { url: asset('/icons/ios/114.png'), sizes: '114x114', type: 'image/png' },
      { url: asset('/icons/ios/120.png'), sizes: '120x120', type: 'image/png' },
      { url: asset('/icons/ios/144.png'), sizes: '144x144', type: 'image/png' },
      { url: asset('/icons/ios/152.png'), sizes: '152x152', type: 'image/png' },
      { url: asset('/icons/ios/180.png'), sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: asset('/icons/ios/180.png'),
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
    <html
      lang="en"
      data-test="layout"
      data-cy="root-layout-html"
      suppressHydrationWarning
    >
      <head data-cy="root-layout-head">
        {/* PWA Meta Tags - FORCE FULLSCREEN */}
        <meta
          name="application-name"
          content="Selamnew Workspace"
          data-cy="pwa-meta-application-name"
        />
        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
          data-cy="pwa-meta-apple-mobile-web-app-capable"
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
          data-cy="pwa-meta-apple-mobile-web-app-status-bar-style"
        />
        <meta
          name="apple-mobile-web-app-title"
          content="Selamnew Workspace"
          data-cy="pwa-meta-apple-mobile-web-app-title"
        />
        <meta
          name="format-detection"
          content="telephone=no"
          data-cy="pwa-meta-format-detection"
        />
        <meta
          name="mobile-web-app-capable"
          content="yes"
          data-cy="pwa-meta-mobile-web-app-capable"
        />
        <meta
          name="msapplication-config"
          content={asset('/icons/browserconfig.xml')}
          data-cy="pwa-meta-msapplication-config"
        />
        <meta
          name="msapplication-TileColor"
          content="#1890ff"
          data-cy="pwa-meta-msapplication-tile-color"
        />
        <meta
          name="msapplication-tap-highlight"
          content="no"
          data-cy="pwa-meta-msapplication-tap-highlight"
        />

        {/* Force Fullscreen - Hide URL Bar */}
        <meta
          name="apple-touch-fullscreen"
          content="yes"
          data-cy="pwa-meta-apple-touch-fullscreen"
        />
        <meta
          name="mobile-web-app-capable"
          content="yes"
          data-cy="pwa-meta-mobile-web-app-capable-2"
        />
        <meta
          name="HandheldFriendly"
          content="true"
          data-cy="pwa-meta-handheld-friendly"
        />
        <meta
          name="MobileOptimized"
          content="320"
          data-cy="pwa-meta-mobile-optimized"
        />
        <meta
          name="screen-orientation"
          content="portrait"
          data-cy="pwa-meta-screen-orientation"
        />
        <meta
          name="x5-orientation"
          content="portrait"
          data-cy="pwa-meta-x5-orientation"
        />
        <meta name="full-screen" content="yes" data-cy="pwa-meta-full-screen" />
        <meta
          name="x5-fullscreen"
          content="true"
          data-cy="pwa-meta-x5-fullscreen"
        />
        <meta
          name="browsermode"
          content="application"
          data-cy="pwa-meta-browsermode"
        />
        <meta
          name="x5-page-mode"
          content="app"
          data-cy="pwa-meta-x5-page-mode"
        />
        <meta
          name="msapplication-navbutton-color"
          content="#1890ff"
          data-cy="pwa-meta-msapplication-navbutton-color"
        />
        <meta
          name="theme-color"
          content="#1890ff"
          data-cy="pwa-meta-theme-color"
        />

        {/* CRITICAL: Force hide address bar */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui"
          data-cy="pwa-meta-viewport"
        />

        {/* Microsoft Edge */}
        <meta
          name="msapplication-TileImage"
          content={asset('/icons/manifest-icon-144.png')}
          data-cy="pwa-meta-msapplication-tile-image"
        />

        {/* Force Hide URL Bar Script */}
        <script
          data-cy="pwa-script-hide-address-bar"
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
      <body
        className="pwa-viewport"
        data-cy="root-layout-body"
        suppressHydrationWarning
      >
        <RouteTopLoader />
        <div className="status-bar-safe" data-cy="root-layout-status-bar-safe">
          <PWAProvider>
            {/* <AuthProvider> */}
            <ReactQueryWrapper>
              <AntdRegistry>
                <AntdConfigProvider>
                  <AntdApp>
                    <NotificationSocketProvider>
                      <RecaptchaProvider>
                        <AuthBridge />
                        <UserSessionRefresher />
                        <ConditionalNav>{children}</ConditionalNav>
                        {/* <ChatBotButton /> */}
                      </RecaptchaProvider>
                    </NotificationSocketProvider>
                  </AntdApp>
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
