import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";
import { apiClient } from "@/lib/api-client";
import { parseSettingValue, unwrapList, type AdminSetting, type SettingFormInput } from "./schemas";

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

function toPayload(input: SettingFormInput) {
  return {
    group: input.group.trim(),
    key: input.key.trim(),
    type: input.type,
    value: parseSettingValue(input.value_text, input.type),
    is_public: input.is_public,
  };
}

export async function listAdminSettings(params?: {
  search?: string;
  group?: string;
  type?: string;
  isPublic?: string;
  trashed?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "group");
  query.set("direction", "asc");
  if (params?.search) query.set("search", params.search);
  if (params?.group) query.set("filters[group]", params.group);
  if (params?.type) query.set("filters[type]", params.type);
  if (params?.isPublic) query.set("filters[is_public]", params.isPublic);
  if (params?.trashed) query.set("trashed", params.trashed);
  if (params?.page) query.set("page", String(params.page));

  const response = await apiClient<AdminSetting[]>(`/settings?${query.toString()}`, authOptions());

  return {
    ...response,
    data: unwrapList<AdminSetting>(response.data),
  };
}

export async function createAdminSetting(input: SettingFormInput) {
  return apiClient<AdminSetting>("/settings", {
    ...authOptions(),
    method: "POST",
    body: toPayload(input),
  });
}

export async function updateAdminSetting(id: number | string, input: SettingFormInput) {
  return apiClient<AdminSetting>(`/settings/${id}`, {
    ...authOptions(),
    method: "PUT",
    body: toPayload(input),
  });
}

export async function deleteAdminSetting(id: number | string) {
  return apiClient<null>(`/settings/${id}`, {
    ...authOptions(),
    method: "DELETE",
  });
}

export async function restoreAdminSetting(id: number | string) {
  return apiClient<AdminSetting>(`/settings/${id}/restore`, {
    ...authOptions(),
    method: "POST",
  });
}
