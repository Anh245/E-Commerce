import type { CookieOptions, Request } from 'express';

export const REFRESH_COOKIE = 'refresh_session';
export const REFRESH_COOKIE_PATH = '/api/v1/auth';
export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
  };
}

export function readRefreshCookie(req: Request): string | null {
  const entry = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${REFRESH_COOKIE}=`));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(REFRESH_COOKIE.length + 1));
  } catch {
    return null;
  }
}
