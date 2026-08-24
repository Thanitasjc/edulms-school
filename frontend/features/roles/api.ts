import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";
import { asStringArray, unwrapList, type AdminRole, type RoleFormInput } from "./schemas";

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

function normalizeRole(role: AdminRole): AdminRole {
  return {
    ...role,
    permissions: asStringArray(role.permissions),
  };
}

export async function listAdminRoles(params?: { search?: string; page?: number }) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "name");
  query.set("direction", "asc");
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));

  const response = await apiClient<AdminRole[]>(`/roles?${query.toString()}`, authOptions());

  return {
    ...response,
    data: unwrapList<AdminRole>(response.data).map(normalizeRole),
  };
}

export async function getAdminRole(id: number | string) {
  const response = await apiClient<AdminRole>(`/roles/${id}`, authOptions());
  return { ...response, data: normalizeRole(response.data) };
}

export async function createAdminRole(input: RoleFormInput) {
  const response = await apiClient<AdminRole>("/roles", {
    ...authOptions(),
    method: "POST",
    body: {
      name: input.name.trim(),
      permissions: input.permissions,
    },
  });

  return { ...response, data: normalizeRole(response.data) };
}

export async function updateAdminRole(id: number | string, input: RoleFormInput) {
  const response = await apiClient<AdminRole>(`/roles/${id}`, {
    ...authOptions(),
    method: "PUT",
    body: {
      name: input.name.trim(),
      permissions: input.permissions,
    },
  });

  return { ...response, data: normalizeRole(response.data) };
}

export async function deleteAdminRole(id: number | string) {
  return apiClient<null>(`/roles/${id}`, {
    ...authOptions(),
    method: "DELETE",
  });
}

export async function listPermissions() {
  const response = await apiClient<string[]>("/permissions", authOptions());
  return asStringArray(response.data);
}
