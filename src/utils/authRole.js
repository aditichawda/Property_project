import { safeJsonParse } from './safeJsonParse';

export function getStoredAuth() {
  if (typeof window === 'undefined') return null;
  return safeJsonParse(localStorage.getItem('infrioAuth'), null);
}

/** Solar seller session — use solar blog APIs. */
export function isSellerSession() {
  return getStoredAuth()?.role === 'seller';
}
