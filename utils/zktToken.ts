/**
 * Get the ZKT authentication token from localStorage
 * @returns The token or null if not found
 */
export function getZktToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem('zktAuthToken');
}

/**
 * Check if ZKT token exists in localStorage
 * @returns true if token exists, false otherwise
 */
export function hasZktToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return !!window.localStorage.getItem('zktAuthToken');
}

/**
 * Get the ZKT passUrl from localStorage
 * @returns The passUrl or null if not found
 */
export function getZktPassUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem('zktPassUrl');
}

/**
 * Set the ZKT passUrl in localStorage
 * @param passUrl The passUrl to store
 */
export function setZktPassUrl(passUrl: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('zktPassUrl', passUrl);
}

/**
 * Remove the ZKT passUrl from localStorage
 */
export function removeZktPassUrl(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('zktPassUrl');
}
