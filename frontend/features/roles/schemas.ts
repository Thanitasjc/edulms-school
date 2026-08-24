import { z } from "zod";

export const SYSTEM_ROLES = ["super_admin", "company_admin", "instructor", "student"] as const;

export type AdminRole = {
  id: number;
  name: string;
  guard_name?: string;
  permissions: string[];
  created_at?: string | null;
  updated_at?: string | null;
};

export const roleFormSchema = z.object({
  name: z
    .string()
    .min(2, "Role name is required")
    .regex(/^[a-z][a-z0-9_]*$/, "Use lowercase letters, numbers, and underscores"),
  permissions: z.array(z.string()),
});

export type RoleFormInput = z.infer<typeof roleFormSchema>;

export function isSystemRole(name: string) {
  return (SYSTEM_ROLES as readonly string[]).includes(name);
}

export function formatRoleName(name: string) {
  const labels: Record<string, string> = {
    super_admin: "Super Admin",
    company_admin: "Company Admin",
    instructor: "Instructor",
    student: "Student",
  };

  return labels[name] ?? name.replaceAll("_", " ");
}

export function formatPermissionName(name: string) {
  const parts = name.split(".");
  const action = parts.slice(1).join(" ") || parts[0];
  return action.replaceAll("_", " ");
}

export function groupPermissions(permissions: string[]) {
  const groups = new Map<string, string[]>();

  for (const permission of permissions) {
    const moduleKey = permission.split(".")[0] || "other";
    const list = groups.get(moduleKey) ?? [];
    list.push(permission);
    groups.set(moduleKey, list);
  }

  return Array.from(groups.entries()).map(([moduleKey, items]) => ({
    module: moduleKey,
    label: moduleKey.replaceAll("_", " "),
    permissions: items,
  }));
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(String)
      .filter(Boolean);
  }

  return [];
}

export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data;
  }

  return [];
}
