import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  device_name: z.string().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.email("Enter a valid email"),
    phone: z.string().optional(),
    company_name: z.string().min(2, "Company name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar_path?: string | null;
  status: string;
  is_super_admin: boolean;
  current_company_id?: number | null;
  roles: string[];
  permissions: string[];
};

export type AuthPayload = {
  token: string;
  token_type: string;
  user: AuthUser;
  enabled_modules: string[];
};
