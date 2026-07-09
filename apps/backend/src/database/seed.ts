import { eq } from "drizzle-orm";

import { auth } from "../core/auth";
import { ROLE } from "../modules/rbac";
import { db } from "./client";
import { user } from "./schema";

const ADMIN_EMAIL = "admin@anthiel.com";
const ADMIN_USERNAME = "admin@anthiel.com";
const ADMIN_PASSWORD = "12345678";
const ADMIN_NAME = "Anthiel Admin";

async function seed() {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, ADMIN_EMAIL),
  });

  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL} (id=${existing.id}, role=${existing.role})`);
    return;
  }

  const created = await auth.api.createUser({
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
      role: ROLE.admin,
      data: {
        username: ADMIN_USERNAME,
        displayUsername: ADMIN_USERNAME,
      },
    },
  });

  console.log(
    `Seeded admin user: ${created.user.email} (id=${created.user.id}, role=${created.user.role})`,
  );
}

seed()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
