import { z } from "zod";

export const settingTypes = ["string", "boolean", "integer", "float", "json", "array"] as const;

export type SettingType = (typeof settingTypes)[number];

export type AdminSetting = {
  id: number;
  company_id?: number | null;
  group?: string | null;
  key: string;
  value: unknown;
  raw_value?: string | null;
  type: SettingType | string;
  is_public: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export const settingFormSchema = z.object({
  group: z.string().min(1, "Group is required").max(100, "Group is too long"),
  key: z.string().min(1, "Key is required").max(150, "Key is too long"),
  type: z.enum(settingTypes),
  value_text: z.string().optional(),
  is_public: z.boolean(),
});

export type SettingFormInput = z.infer<typeof settingFormSchema>;

export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data;
  }

  return [];
}

export function stringifySettingValue(value: unknown, type?: string) {
  if (value === null || value === undefined) return "";

  if (type === "json" || type === "array" || typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

export function parseSettingValue(input: string | undefined, type: SettingType) {
  const text = input?.trim() ?? "";

  if (text === "") {
    return null;
  }

  switch (type) {
    case "boolean": {
      if (text === "true") return true;
      if (text === "false") return false;
      throw new SyntaxError("Boolean values must be true or false");
    }
    case "integer": {
      const value = Number.parseInt(text, 10);
      if (Number.isNaN(value)) {
        throw new SyntaxError("Integer values must be valid numbers");
      }
      return value;
    }
    case "float": {
      const value = Number.parseFloat(text);
      if (Number.isNaN(value)) {
        throw new SyntaxError("Float values must be valid numbers");
      }
      return value;
    }
    case "json":
    case "array":
      return JSON.parse(text) as unknown;
    case "string":
    default:
      return text;
  }
}

export function formatSettingValue(setting: Pick<AdminSetting, "type" | "value">) {
  const text = stringifySettingValue(setting.value, setting.type);
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}
