import type { AuthUser } from "./schemas";

function roleList(user: Pick<AuthUser, "roles">): string[] {
  if (Array.isArray(user.roles)) return user.roles;
  if (user.roles && typeof user.roles === "object") {
    return Object.values(user.roles as Record<string, string>);
  }
  return [];
}

function permissionList(user: Pick<AuthUser, "permissions">): string[] {
  if (Array.isArray(user.permissions)) return user.permissions;
  if (user.permissions && typeof user.permissions === "object") {
    return Object.values(user.permissions as Record<string, string>);
  }
  return [];
}

export function isLearnerUser(
  user: Pick<AuthUser, "is_super_admin" | "roles"> | null | undefined,
): boolean {
  if (!user || user.is_super_admin) return false;
  const roles = roleList(user);
  if (
    roles.includes("company_admin") ||
    roles.includes("super_admin") ||
    roles.includes("instructor")
  ) {
    return false;
  }
  return roles.includes("student") || roles.length === 0;
}

/** Staff → admin dashboard. Learners → student dashboard. */
export function getPostAuthRoute(
  user: Pick<AuthUser, "is_super_admin" | "roles" | "permissions">,
): string {
  if (user.is_super_admin) return "/dashboard";

  const roles = roleList(user);
  if (
    roles.includes("company_admin") ||
    roles.includes("super_admin") ||
    roles.includes("instructor")
  ) {
    return "/dashboard";
  }

  const permissions = permissionList(user);
  if (permissions.some((permission) => permission.startsWith("user.") || permission.startsWith("course."))) {
    return "/dashboard";
  }

  return "/my-dashboard";
}
