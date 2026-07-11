import { redirect } from "@tanstack/react-router";

import { fetchSession, type AuthSession } from "#/lib/auth-session";

const LOGIN_PATH = "/dashboard/auth/login";
const APP_HOME = "/dashboard";

/** Require a session; redirect guests to login (with return URL). */
export async function requireAuth(location: {
  pathname: string;
  searchStr: string;
}): Promise<{ session: AuthSession }> {
  const session = await fetchSession();

  if (!session) {
    throw redirect({
      to: LOGIN_PATH,
      search: {
        redirect: `${location.pathname}${location.searchStr}`,
      },
    });
  }

  return { session };
}

/** Require no session; redirect signed-in users into the app. */
export async function requireGuest(): Promise<void> {
  const session = await fetchSession();

  if (session) {
    throw redirect({ to: APP_HOME });
  }
}
