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
