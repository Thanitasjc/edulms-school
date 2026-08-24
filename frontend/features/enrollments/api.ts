import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";
import type { CheckoutResult } from "@/features/payments/api";

export type Enrollment = {
  id: number;
  course_id: number;
  user_id: number;
  status: string;
  amount_paid: number;
  currency: string;
  source: string;
  enrolled_at?: string | null;
  progress_percent?: number;
  completed_lessons?: number;
  total_lessons?: number;
  last_lesson_key?: string | null;
  last_section_index?: number | null;
  last_lesson_index?: number | null;
  progress_updated_at?: string | null;
  course?: {
    id: number;
    title: string;
    slug: string;
    thumbnail_url?: string | null;
    price: number;
    sale_price?: number | null;
  } | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export type AdminEnrollmentInput = {
  course_id: number;
  user_id: number;
  status?: string;
  amount_paid?: number;
  currency?: string;
  source?: string;
  enrolled_at?: string;
};

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

export async function purchaseCourse(courseId: number) {
  return apiClient<CheckoutResult>("/enrollments/purchase", {
    token: getStoredToken(),
    method: "POST",
    body: { course_id: courseId },
  });
}

export async function checkoutCourses(courseIds: number[]) {
  return apiClient<CheckoutResult>("/enrollments/checkout", {
    token: getStoredToken(),
    method: "POST",
    body: { course_ids: courseIds },
  });
}

export async function listMyEnrollments() {
  return apiClient<Enrollment[]>("/enrollments/mine?per_page=50&sort=enrolled_at&direction=desc", {
    token: getStoredToken(),
  });
}

export async function listAdminEnrollments(params?: {
  search?: string;
  status?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "created_at");
  query.set("direction", "desc");
  if (params?.status) query.set("filters[status]", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));

  return apiClient<Enrollment[]>(`/enrollments?${query.toString()}`, authOptions());
}

export async function createAdminEnrollment(input: AdminEnrollmentInput) {
  return apiClient<Enrollment>("/enrollments", {
    ...authOptions(),
    method: "POST",
    body: input,
  });
}

export async function updateAdminEnrollment(
  id: number,
  input: Partial<Pick<AdminEnrollmentInput, "status" | "amount_paid" | "currency" | "source" | "enrolled_at">>,
) {
  return apiClient<Enrollment>(`/enrollments/${id}`, {
    ...authOptions(),
    method: "PUT",
    body: input,
  });
}

export async function cancelEnrollment(id: number) {
  return apiClient<Enrollment>(`/enrollments/${id}/cancel`, {
    ...authOptions(),
    method: "POST",
  });
}

export async function deleteAdminEnrollment(id: number) {
  return apiClient<null>(`/enrollments/${id}`, {
    ...authOptions(),
    method: "DELETE",
  });
}
