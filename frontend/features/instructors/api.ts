import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";
import type { AdminInstructor, InstructorFormInput, PublicInstructor } from "./schemas";

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

function normalizePayload(input: InstructorFormInput) {
  return {
    ...input,
    about: (input.about ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
    skill_labels: (input.skill_labels ?? "")
      .split(/,|\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

export async function listAdminInstructors(params?: {
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

  return apiClient<AdminInstructor[]>(`/instructors?${query.toString()}`, authOptions());
}

export async function getAdminInstructor(id: number | string) {
  return apiClient<AdminInstructor>(`/instructors/${id}`, authOptions());
}

export async function createAdminInstructor(input: InstructorFormInput) {
  return apiClient<AdminInstructor>("/instructors", {
    ...authOptions(),
    method: "POST",
    body: normalizePayload(input),
  });
}

export async function updateAdminInstructor(id: number | string, input: InstructorFormInput) {
  return apiClient<AdminInstructor>(`/instructors/${id}`, {
    ...authOptions(),
    method: "PUT",
    body: normalizePayload(input),
  });
}

export async function deleteAdminInstructor(id: number | string) {
  return apiClient<null>(`/instructors/${id}`, {
    ...authOptions(),
    method: "DELETE",
  });
}

export async function restoreAdminInstructor(id: number | string) {
  return apiClient<AdminInstructor>(`/instructors/${id}/restore`, {
    ...authOptions(),
    method: "POST",
  });
}

export async function listPublicInstructors(params?: { limit?: number; featured_home?: boolean }) {
  const query = new URLSearchParams();
  if (params?.featured_home) {
    query.set("featured_home", "1");
    query.set("limit", String(params.limit ?? 8));
  } else {
    query.set("per_page", String(params?.limit ?? 24));
  }
  return apiClient<PublicInstructor[]>(`/public/instructors?${query.toString()}`);
}

export async function getPublicInstructor(slug: string) {
  return apiClient<PublicInstructor>(`/public/instructors/${slug}`);
}
