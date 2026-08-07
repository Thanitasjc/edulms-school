import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";
import type { AdminCourse, CourseFormInput } from "./schemas";

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

export async function listAdminCourses(params?: {
  search?: string;
  status?: string;
  trashed?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "updated_at");
  query.set("direction", "desc");

  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("filters[status]", params.status);
  if (params?.trashed) query.set("trashed", params.trashed);
  if (params?.page) query.set("page", String(params.page));

  return apiClient<AdminCourse[]>(`/courses?${query.toString()}`, authOptions());
}

export async function getAdminCourse(id: number | string) {
  return apiClient<AdminCourse>(`/courses/${id}`, authOptions());
}

export async function createAdminCourse(input: CourseFormInput) {
  const body = normalizeCoursePayload(input);
  return apiClient<AdminCourse>("/courses", {
    ...authOptions(),
    method: "POST",
    body,
  });
}

export async function updateAdminCourse(id: number | string, input: CourseFormInput) {
  const body = normalizeCoursePayload(input);
  return apiClient<AdminCourse>(`/courses/${id}`, {
    ...authOptions(),
    method: "PUT",
    body,
  });
}

export async function deleteAdminCourse(id: number | string) {
  return apiClient<null>(`/courses/${id}`, {
    ...authOptions(),
    method: "DELETE",
  });
}

export async function restoreAdminCourse(id: number | string) {
  return apiClient<AdminCourse>(`/courses/${id}/restore`, {
    ...authOptions(),
    method: "POST",
  });
}

export async function uploadCourseVideo(file: File) {
  return uploadCourseMedia(file, "/courses/media/video");
}

export async function uploadCourseImage(file: File) {
  return uploadCourseMedia(file, "/courses/media/image");
}

async function uploadCourseMedia(file: File, path: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const headers = new Headers();
  headers.set("Accept", "application/json");
  const token = getStoredToken();
  const companyId = getStoredCompanyId();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (companyId) headers.set("X-Company-Id", String(companyId));

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as {
    success: boolean;
    message: string;
    data?: { url: string; path: string; original_name: string };
  } | null;

  if (!response.ok || !payload || payload.success === false || !payload.data) {
    throw new Error(payload?.message || "Upload failed");
  }

  return payload.data;
}

function normalizeCoursePayload(input: CourseFormInput) {
  const salePrice =
    input.sale_price === "" || input.sale_price === null || input.sale_price === undefined
      ? null
      : Number(input.sale_price);

  const durationWeeks =
    input.duration_weeks === "" || input.duration_weeks === null || input.duration_weeks === undefined
      ? null
      : Number(input.duration_weeks);

  const passPercentage =
    input.pass_percentage === "" || input.pass_percentage === null || input.pass_percentage === undefined
      ? null
      : Number(input.pass_percentage);

  return {
    ...input,
    slug: input.slug?.trim() || undefined,
    sale_price: salePrice,
    duration_weeks: durationWeeks,
    pass_percentage: passPercentage,
    deadline: input.deadline?.trim() || null,
    skill_level: input.skill_level?.trim() || null,
    language: input.language?.trim() || null,
    category: input.category || null,
    summary: input.summary || null,
    description: input.description || null,
    curriculum: {
      summary: input.curriculum?.summary?.trim() || null,
      sections: (input.curriculum?.sections ?? [])
        .filter((section) => section.title.trim())
        .map((section) => ({
          title: section.title.trim(),
          lessons: (section.lessons ?? [])
            .filter((lesson) => lesson.title.trim())
            .map((lesson) => ({
              title: lesson.title.trim(),
              duration: lesson.duration?.trim() || null,
              video_type: lesson.video_type || null,
              video_url: lesson.video_url?.trim() || null,
              is_preview: Boolean(lesson.is_preview),
            })),
        })),
    },
    thumbnail_url: input.thumbnail_url || null,
    instructor_id:
      input.instructor_id === "" || input.instructor_id === null || input.instructor_id === undefined
        ? null
        : Number(input.instructor_id),
    instructor_name: input.instructor_name || null,
    instructor_title: input.instructor_title || null,
    instructor_avatar_url: input.instructor_avatar_url || null,
    instructor_bio: input.instructor_bio || null,
  };
}
