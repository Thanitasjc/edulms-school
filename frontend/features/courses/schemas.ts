import { z } from "zod";

export const curriculumLessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  duration: z.string().optional().nullable(),
  video_type: z.enum(["youtube", "mp4"]).optional().nullable(),
  video_url: z.string().optional().nullable(),
  is_preview: z.boolean().optional().default(false),
});

export const curriculumSectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  lessons: z.array(curriculumLessonSchema).default([]),
});

export const curriculumSchema = z.object({
  summary: z.string().optional().nullable(),
  sections: z.array(curriculumSectionSchema).default([]),
});

export const courseFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().optional(),
  category: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  curriculum: curriculumSchema,
  thumbnail_url: z.string().optional(),
  lessons_count: z.coerce.number().int().min(0),
  students_count: z.coerce.number().int().min(0),
  duration_hours: z.coerce.number().int().min(0),
  duration_weeks: z.union([z.coerce.number().int().min(0), z.literal("")]).optional().nullable(),
  skill_level: z.string().optional(),
  language: z.string().optional(),
  pass_percentage: z.union([z.coerce.number().int().min(0).max(100), z.literal("")]).optional().nullable(),
  deadline: z.string().optional().nullable(),
  price: z.coerce.number().min(0),
  sale_price: z.union([z.coerce.number().min(0), z.literal("")]).optional().nullable(),
  is_free: z.boolean(),
  instructor_id: z.union([z.coerce.number().int().positive(), z.literal(""), z.null()]).optional(),
  instructor_name: z.string().optional(),
  instructor_title: z.string().optional(),
  instructor_avatar_url: z.string().optional(),
  instructor_bio: z.string().optional(),
  rating: z.coerce.number().min(0).max(5),
  reviews_count: z.coerce.number().int().min(0),
  is_trending: z.boolean(),
  is_featured: z.boolean(),
  is_popular: z.boolean(),
  status: z.enum(["draft", "published", "archived"]),
});

export type CourseFormInput = z.infer<typeof courseFormSchema>;
export type CourseCurriculum = z.infer<typeof curriculumSchema>;
export type CurriculumSection = z.infer<typeof curriculumSectionSchema>;
export type CurriculumLesson = z.infer<typeof curriculumLessonSchema>;

export type AdminCourse = {
  id: number;
  company_id: number;
  instructor_id?: number | null;
  title: string;
  slug: string;
  category?: string | null;
  summary?: string | null;
  description?: string | null;
  curriculum?: CourseCurriculum | null;
  thumbnail_url?: string | null;
  lessons_count: number;
  students_count: number;
  duration_hours: number;
  duration_weeks?: number | null;
  skill_level?: string | null;
  language?: string | null;
  pass_percentage?: number | null;
  deadline?: string | null;
  price: number;
  sale_price?: number | null;
  is_free: boolean;
  instructor_name?: string | null;
  instructor_title?: string | null;
  instructor_avatar_url?: string | null;
  instructor_bio?: string | null;
  rating: number;
  reviews_count: number;
  is_trending: boolean;
  is_featured: boolean;
  is_popular: boolean;
  status: string;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export const emptyCurriculum = (): CourseCurriculum => ({
  summary: "",
  sections: [],
});

export function normalizeCurriculum(value?: CourseCurriculum | null): CourseCurriculum {
  return {
    summary: value?.summary ?? "",
    sections: (value?.sections ?? []).map((section) => ({
      title: section.title ?? "",
      lessons: (section.lessons ?? []).map((lesson) => ({
        title: lesson.title ?? "",
        duration: lesson.duration ?? "",
        video_type: lesson.video_type ?? null,
        video_url: lesson.video_url ?? "",
        is_preview: Boolean(lesson.is_preview),
      })),
    })),
  };
}
