export {
  ROLE,
  ROLE_CATALOG,
  RESOURCE_CATALOG,
  bypassesInvoiceScope,
  canManage,
  hasRole,
  isAdmin,
  isStaff,
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
