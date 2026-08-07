import { apiClient } from "@/lib/api-client";
import { getStoredToken } from "@/features/auth/api";

export type CourseProgress = {
  enrollment_id: number | null;
  progress_percent: number;
  completed_lessons: number;
  total_lessons: number;
  completed_keys: string[];
  last_lesson_key?: string | null;
  last_section_index?: number | null;
  last_lesson_index?: number | null;
  can_track: boolean;
};

export function lessonKey(sectionIndex: number, lessonIndex: number) {
  return `s${sectionIndex}-l${lessonIndex}`;
}

export async function getCourseProgress(slug: string) {
  return apiClient<CourseProgress>(`/progress/courses/${slug}`, {
    token: getStoredToken(),
  });
}

export async function trackLessonProgress(
  slug: string,
  input: {
    section_index: number;
    lesson_index: number;
    lesson_title?: string;
    status?: "in_progress" | "completed";
  },
) {
  return apiClient<CourseProgress>(`/progress/courses/${slug}/lessons`, {
    token: getStoredToken(),
    method: "POST",
    body: input,
  });
}
