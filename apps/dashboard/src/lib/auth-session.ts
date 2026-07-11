import { authClient } from "#/lib/auth-client";

export type AuthSession = NonNullable<Awaited<ReturnType<typeof authClient.getSession>>["data"]>;

const SESSION_TTL_MS = 30_000;

let cached: { session: AuthSession | null; expiresAt: number } | null = null;
let inflight: Promise<AuthSession | null> | null = null;

/** Drop the in-memory session cache (call after sign-in / sign-out). */
export function invalidateSessionCache() {
  cached = null;
  inflight = null;
}

/** Fetches the current session from the auth API. Returns null when missing or on error. */
export async function fetchSession(): Promise<AuthSession | null> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.session;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const { data } = await authClient.getSession();
      cached = { session: data, expiresAt: Date.now() + SESSION_TTL_MS };
      return data;
    } catch {
      cached = { session: null, expiresAt: Date.now() + SESSION_TTL_MS };
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
