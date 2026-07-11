import { authClient } from "#/lib/auth-client";

export type AuthSession = NonNullable<Awaited<ReturnType<typeof authClient.getSession>>["data"]>;

/** Fetches the current session from the auth API. Returns null when missing or on error. */
export async function fetchSession(): Promise<AuthSession | null> {
  try {
    const { data } = await authClient.getSession();
    return data;
  } catch {
    return null;
  }
}
