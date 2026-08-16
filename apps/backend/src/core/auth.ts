import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, magicLink, username } from "better-auth/plugins";

import { CORS_ORIGINS } from "../constants";
import { db } from "../database";
import * as schema from "../database/schema";
import { env } from "../env";
import { ROLE } from "../modules/rbac/catalog";
import { sendClientMagicLink } from "./magic-link-email";

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
    magicLink({
      disableSignUp: true,
      expiresIn: 60 * 10,
      storeToken: "hashed",
      sendMagicLink: async ({ email, url }) => {
        await sendClientMagicLink({ email, url });
      },
    }),
  ],
});

export type Auth = typeof auth;
