export {
  ROLE,
  ROLE_CATALOG,
  RESOURCE_CATALOG,
  hasRole,
  isAdmin,
  permissionKey,
  type Role,
  type RoleName,
  type ResourceKey,
} from "./catalog";
export { rbacRoutes } from "./routes/rbac.route";
export { RbacService } from "./services/rbac.service";
export type {
  PermissionDto,
  ResourceDto,
  RoleDetailDto,
  RoleDto,
} from "./contracts/response.contract";
