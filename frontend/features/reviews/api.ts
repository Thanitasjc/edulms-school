import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";

export type CourseReview = {
  id: number;
  course_id: number;
  user_id: number;
  rating: number;
  title?: string | null;
  body?: string | null;
  status: string;
  created_at?: string | null;
  user?: { id: number; name: string } | null;
  course?: { id: number; title: string; slug: string } | null;
};

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

export async function listPublicCourseReviews(slug: string) {
  return apiClient<CourseReview[]>(
    `/public/courses/${slug}/reviews?per_page=20&sort=created_at&direction=desc`,
    { token: getStoredToken() },
  );
}

export async function createPublicCourseReview(
  slug: string,
  input: { rating: number; title?: string; body?: string },
) {
  return apiClient<CourseReview>(`/public/courses/${slug}/reviews`, {
    token: getStoredToken(),
    method: "POST",
    body: input,
  });
}

export type AdminReviewInput = {
  course_id: number;
  user_id: number;
  rating: number;
  title?: string;
  body?: string;
  status?: string;
};

export async function listAdminCourseReviews(params?: {
  course_id?: number;
  status?: string;
  search?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "created_at");
  query.set("direction", "desc");
  if (params?.course_id) query.set("filters[course_id]", String(params.course_id));
  if (params?.status) query.set("filters[status]", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));

  return apiClient<CourseReview[]>(`/course-reviews?${query.toString()}`, authOptions());
}

export async function createAdminCourseReview(input: AdminReviewInput) {
  return apiClient<CourseReview>("/course-reviews", {
    ...authOptions(),
    method: "POST",
    body: input,
  });
}

export async function updateAdminCourseReview(
  id: number,
  input: Partial<Pick<AdminReviewInput, "rating" | "title" | "body" | "status">>,
) {
  return apiClient<CourseReview>(`/course-reviews/${id}`, {
    ...authOptions(),
    method: "PUT",
    body: input,
  });
}

export async function deleteAdminCourseReview(id: number) {
  return apiClient<null>(`/course-reviews/${id}`, {
    ...authOptions(),
    method: "DELETE",
  });
}
