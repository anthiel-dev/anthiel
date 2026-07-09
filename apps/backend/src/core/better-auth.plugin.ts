import { Elysia } from "elysia";

import { isAdmin } from "../modules/rbac";
import { auth } from "./auth";

export const betterAuthPlugin = new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
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
