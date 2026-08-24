import { z } from "zod";

export const companyStatuses = ["active", "inactive", "suspended"] as const;

export type CompanyStatus = (typeof companyStatuses)[number];

export type AdminCompany = {
  id: number;
  name: string;
  slug: string;
  domain?: string | null;
  email?: string | null;
  phone?: string | null;
  logo_path?: string | null;
  timezone?: string | null;
  locale?: string | null;
  status: string;
  settings?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export const companyFormSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  slug: z.string().optional(),
  domain: z.string().optional(),
  email: z.email("Enter a valid email").or(z.literal("")).optional(),
  phone: z.string().optional(),
  logo_path: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  status: z.enum(companyStatuses),
  settings_text: z.string().optional(),
});

export type CompanyFormInput = z.infer<typeof companyFormSchema>;

export function formatCompanyStatus(status: string) {
  const labels: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

export function slugifyCompanyName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

export function parseSettingsText(value: string | undefined) {
  const text = value?.trim();
  if (!text) return null;
  return JSON.parse(text) as Record<string, unknown>;
}

export function stringifySettings(settings: Record<string, unknown> | null | undefined) {
  if (!settings || Object.keys(settings).length === 0) return "";
  return JSON.stringify(settings, null, 2);
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
