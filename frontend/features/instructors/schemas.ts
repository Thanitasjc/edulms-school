import { z } from "zod";

export const instructorFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  role: z.string().optional(),
  subtitle: z.string().optional(),
  avatar_url: z.string().optional(),
  rating: z.number().min(0).max(5),
  reviews_count: z.number().int().min(0),
  about: z.string().optional(),
  address: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  skill_labels: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
});

export type InstructorFormInput = z.infer<typeof instructorFormSchema>;

export type AdminInstructor = {
  id: number;
  company_id: number;
  name: string;
  slug: string;
  role?: string | null;
  subtitle?: string | null;
  avatar_url?: string | null;
  rating: number;
  reviews_count: number;
  about?: string[];
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  skill_labels?: string[];
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type PublicInstructor = AdminInstructor;
