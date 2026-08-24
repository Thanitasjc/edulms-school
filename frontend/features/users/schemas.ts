import { z } from "zod";

export const userStatuses = ["active", "inactive", "suspended"] as const;

export type UserStatus = (typeof userStatuses)[number];

export type AdminUserCompany = {
  id: number;
  name: string;
  slug?: string | null;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar_path?: string | null;
  status: string;
  is_super_admin: boolean;
  current_company_id?: number | null;
  roles: string[];
  companies: AdminUserCompany[];
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type AdminRoleOption = {
  id: number;
  name: string;
};

export const userFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
  status: z.enum(userStatuses),
  roles: z.array(z.string()),
  company_ids: z.array(z.number()),
});

export type UserFormInput = z.infer<typeof userFormSchema>;

export function createUserFormSchema(isEdit: boolean) {
  return userFormSchema.superRefine((data, ctx) => {
    const password = data.password ?? "";

    if (!isEdit && password.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 8 characters",
        path: ["password"],
      });
    }

    if (isEdit && password.length > 0 && password.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 8 characters",
        path: ["password"],
      });
    }

    if (password.length > 0 && password !== (data.password_confirmation ?? "")) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["password_confirmation"],
      });
    }
  });
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
