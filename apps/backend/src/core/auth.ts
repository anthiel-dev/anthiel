import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, username } from "better-auth/plugins";

import { CORS_ORIGINS } from "../constants";
import { db } from "../database";
import * as schema from "../database/schema";
import { env } from "../env";
import { ROLE } from "../modules/rbac/catalog";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [...CORS_ORIGINS],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      roleId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  plugins: [
    username(),
    adminPlugin({
      defaultRole: ROLE.client,
      adminRoles: [ROLE.admin],
    }),
  ],
});

export type Auth = typeof auth;
