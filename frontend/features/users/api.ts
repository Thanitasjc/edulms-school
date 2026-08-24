import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";
import {
  asStringArray,
  unwrapList,
  type AdminRoleOption,
  type AdminUser,
  type AdminUserCompany,
  type UserFormInput,
} from "./schemas";

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

function normalizeUser(user: AdminUser): AdminUser {
  return {
    ...user,
    roles: asStringArray(user.roles),
    companies: Array.isArray(user.companies) ? user.companies : unwrapList<AdminUserCompany>(user.companies),
  };
}

function toPayload(input: UserFormInput, isEdit: boolean) {
  const storedCompanyId = Number(getStoredCompanyId() ?? 0);
  const companyIds =
    input.company_ids.length > 0
      ? input.company_ids
      : storedCompanyId
        ? [storedCompanyId]
        : [];

  const payload: Record<string, unknown> = {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    status: input.status,
    roles: input.roles,
    company_ids: companyIds,
    current_company_id: companyIds[0] ?? (storedCompanyId || undefined),
  };

  if (!isEdit || (input.password && input.password.length > 0)) {
    payload.password = input.password;
    payload.password_confirmation = input.password_confirmation;
  }

  return payload;
}

export async function listAdminUsers(params?: {
  search?: string;
  status?: string;
  trashed?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "created_at");
  query.set("direction", "desc");
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("filters[status]", params.status);
  if (params?.trashed) query.set("trashed", params.trashed);
  if (params?.page) query.set("page", String(params.page));

  const response = await apiClient<AdminUser[]>(`/users?${query.toString()}`, authOptions());

  return {
    ...response,
    data: unwrapList<AdminUser>(response.data).map(normalizeUser),
  };
}

export async function getAdminUser(id: number | string) {
  const response = await apiClient<AdminUser>(`/users/${id}`, authOptions());
  return { ...response, data: normalizeUser(response.data) };
}

export async function createAdminUser(input: UserFormInput) {
  const response = await apiClient<AdminUser>("/users", {
    ...authOptions(),
    method: "POST",
    body: toPayload(input, false),
  });

  return { ...response, data: normalizeUser(response.data) };
}

export async function updateAdminUser(id: number | string, input: UserFormInput) {
  const response = await apiClient<AdminUser>(`/users/${id}`, {
    ...authOptions(),
    method: "PUT",
    body: toPayload(input, true),
  });

  return { ...response, data: normalizeUser(response.data) };
}

export async function deleteAdminUser(id: number | string) {
  return apiClient<null>(`/users/${id}`, {
    ...authOptions(),
    method: "DELETE",
  });
}

export async function restoreAdminUser(id: number | string) {
  const response = await apiClient<AdminUser>(`/users/${id}/restore`, {
    ...authOptions(),
    method: "POST",
  });

  return { ...response, data: normalizeUser(response.data) };
}

export async function listAdminRoles() {
  const query = new URLSearchParams();
  query.set("per_page", "100");
  query.set("sort", "name");
  query.set("direction", "asc");

  const response = await apiClient<AdminRoleOption[]>(`/roles?${query.toString()}`, authOptions());

  return unwrapList<AdminRoleOption>(response.data).filter((role) => role?.name);
}

export async function listAdminCompanies() {
  const query = new URLSearchParams();
  query.set("per_page", "100");
  query.set("sort", "name");
  query.set("direction", "asc");

  const response = await apiClient<AdminUserCompany[]>(`/companies?${query.toString()}`, authOptions());

  return unwrapList<AdminUserCompany>(response.data);
}
