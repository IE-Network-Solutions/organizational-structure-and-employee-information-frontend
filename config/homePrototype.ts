/**
 * Mock / prototype mode: sidebar shows Home only; all Home tabs visible.
 * Set NEXT_PUBLIC_HOME_PROTOTYPE=false to restore full navigation.
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
