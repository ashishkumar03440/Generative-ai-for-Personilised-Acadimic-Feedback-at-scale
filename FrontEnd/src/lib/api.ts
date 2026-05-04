/**
 * src/lib/api.ts
 *
 * Central API configuration.
 * - API_BASE   : backend base URL, reads from VITE_API_URL env var
 * - authFetch  : drop-in replacement for fetch() that automatically
 *                attaches the Bearer token from sessionStorage.
 *
 * Usage:
 *   import { authFetch, API_BASE } from "@/lib/api";
 *
 *   // Protected call (auto-attaches Authorization header):
 *   const res = await authFetch(`${API_BASE}/assignment/list`);
 *
 *   // Public call (login/signup — no token needed):
 *   const res = await fetch(`${API_BASE}/user/login`, { method: "POST", ... });
 */

export const API_BASE: string =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

/**
 * authFetch — wraps the native fetch() and injects the Bearer token.
 * Pass any standard RequestInit options; headers are merged, not replaced.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = sessionStorage.getItem("accessToken");

  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    credentials: "include",   // always send cookies (refresh token)
    headers,
  });
}
