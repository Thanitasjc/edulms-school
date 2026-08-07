export function hasPermission(permissions: string[], permission: string, isSuperAdmin = false): boolean {
  if (isSuperAdmin) return true;
  return permissions.includes(permission);
}

export function hasAnyPermission(permissions: string[], required: string[], isSuperAdmin = false): boolean {
  if (isSuperAdmin) return true;
  return required.some((permission) => permissions.includes(permission));
}
