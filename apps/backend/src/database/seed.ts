import { eq } from "drizzle-orm";

import { auth } from "../core/auth";
import {
  ROLE,
  ROLE_CATALOG,
  RESOURCE_CATALOG,
  permissionKey,
  type ResourceKey,
} from "../modules/rbac/catalog";
import { db } from "./client";
import { permissions, resources, rolePermission, roles, user } from "./schema";

const ADMIN_EMAIL = "admin@anthiel.com";
const ADMIN_USERNAME = "anthiel";
const ADMIN_PASSWORD = "12345678";
const ADMIN_NAME = "Anthiel Admin";

function idFor(...parts: string[]) {
  return parts.join("_");
}

async function seedResourcesAndPermissions() {
  for (const resource of Object.values(RESOURCE_CATALOG)) {
    const resourceId = idFor("resource", resource.key);

    await db
      .insert(resources)
      .values({
        id: resourceId,
        key: resource.key,
        name: resource.name,
        description: resource.description,
      })
      .onConflictDoUpdate({
        target: resources.key,
        set: {
          name: resource.name,
          description: resource.description,
          updatedAt: new Date(),
        },
      });

    for (const action of resource.actions) {
      const key = permissionKey(resource.key, action);
      await db
        .insert(permissions)
        .values({
          id: idFor("permission", resource.key, action),
          resourceId,
          action,
          key,
          description: `${resource.name}: ${action}`,
        })
        .onConflictDoUpdate({
          target: permissions.key,
          set: {
            resourceId,
            action,
            description: `${resource.name}: ${action}`,
            updatedAt: new Date(),
          },
        });
    }
  }

  console.log("Seeded resources and permissions");
}

async function seedRoles() {
  for (const role of Object.values(ROLE_CATALOG)) {
    const roleId = idFor("role", role.key);

    await db
      .insert(roles)
      .values({
        id: roleId,
        key: role.key,
        name: role.name,
        description: role.description,
      })
      .onConflictDoUpdate({
        target: roles.key,
        set: {
          name: role.name,
          description: role.description,
          updatedAt: new Date(),
        },
      });

    await db.delete(rolePermission).where(eq(rolePermission.roleId, roleId));

    const permissionIds: string[] = [];
    for (const resourceKey of Object.keys(role.permissions) as ResourceKey[]) {
      for (const action of role.permissions[resourceKey]) {
        permissionIds.push(idFor("permission", resourceKey, action));
      }
    }

    if (permissionIds.length > 0) {
      await db.insert(rolePermission).values(
        permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      );
    }
  }

  console.log("Seeded roles: admin, staff, client");
}

async function seedAdminUser() {
  const adminRole = await db.query.roles.findFirst({
    where: eq(roles.key, ROLE.admin),
  });

  if (!adminRole) {
    throw new Error("Admin role missing — seed roles before users");
  }

  const existing = await db.query.user.findFirst({
    where: eq(user.email, ADMIN_EMAIL),
  });

  if (existing) {
    await db
      .update(user)
      .set({
        role: ROLE.admin,
        roleId: adminRole.id,
      })
      .where(eq(user.id, existing.id));

    console.log(`Admin already exists: ${ADMIN_EMAIL} (id=${existing.id}, roleId=${adminRole.id})`);
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

  await db.update(user).set({ roleId: adminRole.id }).where(eq(user.id, created.user.id));

  console.log(
    `Seeded admin user: ${created.user.email} (id=${created.user.id}, roleId=${adminRole.id})`,
  );
}

async function seed() {
  await seedResourcesAndPermissions();
  await seedRoles();
  await seedAdminUser();
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
