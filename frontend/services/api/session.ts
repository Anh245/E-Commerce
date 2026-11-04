import axios from 'axios';
import type { AuthResponse } from '@/types/auth.type';
import { store } from '@/store';
import { clearAuth, setAuth } from '@/store/slices/authSlice';

export const sessionClient = axios.create({
  baseURL: '/api/v1/auth', withCredentials: true, timeout: 15000,
  headers: { 'Content-Type': 'application/json', 'X-CSRF-Protection': '1' },
});
let pending: Promise<AuthResponse | null> | null = null;
let epoch = 0;
const channel = typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('ecommerce-session') : null;
if (channel) channel.onmessage = () => { epoch++; store.dispatch(clearAuth()); };

async function sessionLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('ecommerce-session', operation);
  }
  return operation();
}

export function clearSession() {
  epoch++;
  store.dispatch(clearAuth());
  channel?.postMessage('logout');
}

export function refreshSession(): Promise<AuthResponse | null> {
  if (!pending) {
    const generation = epoch;
    pending = sessionLock(async () => {
      if (generation !== epoch) return null;
      try {
        const { data } = await sessionClient.post<AuthResponse>('/refresh', {});
        if (generation !== epoch) return null;
        store.dispatch(setAuth(data));
        return data;
      } catch {
        if (generation === epoch) store.dispatch(clearAuth());
        return null;
      }
    }).finally(() => { pending = null; });
  }
  return pending;
}

export async function logoutSession(): Promise<void> {
  clearSession();
  await pending;
  await sessionLock(async () => { await sessionClient.post('/logout', {}); });
}
