import { Elysia } from "elysia";

import { isAdmin } from "../modules/rbac/catalog";
import { auth } from "./auth";

/** Session macros only — mount `auth.handler` once from `app.ts`. */
export const authGuardPlugin = new Elysia({ name: "auth-guard" }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });
      if (!session) return status(401);
      return {
        user: session.user,
        session: session.session,
      };
    },
  },
  admin: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });
      if (!session) return status(401);
      if (!isAdmin(session.user.role)) return status(403);
      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});

export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .use(authGuardPlugin);
