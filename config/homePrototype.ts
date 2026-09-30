/**
 * Mock / prototype mode: every Home tab is visible and Home routes skip the
 * permission check. Set NEXT_PUBLIC_HOME_PROTOTYPE=false to gate Home tabs by
 * permission and subscription like the rest of the app.
 */
export const IS_HOME_PROTOTYPE =
  process.env.NEXT_PUBLIC_HOME_PROTOTYPE !== 'false';

export function isHomePrototypePath(pathname: string): boolean {
  return (
    pathname === '/home' ||
    pathname.startsWith('/home/') ||
    pathname === '/dashboard'
  );
}
