import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";
import {
  parseSettingsText,
  unwrapList,
  type AdminCompany,
  type CompanyFormInput,
} from "./schemas";

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

function toPayload(input: CompanyFormInput) {
  return {
    name: input.name.trim(),
    slug: input.slug?.trim() || undefined,
    domain: input.domain?.trim() || null,
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    logo_path: input.logo_path?.trim() || null,
    timezone: input.timezone?.trim() || null,
    locale: input.locale?.trim() || null,
    status: input.status,
    settings: parseSettingsText(input.settings_text),
  };
}

export async function listAdminCompanies(params?: {
  search?: string;
  status?: string;
  trashed?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "name");
  query.set("direction", "asc");
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("filters[status]", params.status);
  if (params?.trashed) query.set("trashed", params.trashed);
  if (params?.page) query.set("page", String(params.page));

  const response = await apiClient<AdminCompany[]>(`/companies?${query.toString()}`, authOptions());

  return {
    ...response,
    data: unwrapList<AdminCompany>(response.data),
  };
}

export async function getAdminCompany(id: number | string) {
  return apiClient<AdminCompany>(`/companies/${id}`, authOptions());
}

export async function createAdminCompany(input: CompanyFormInput) {
  return apiClient<AdminCompany>("/companies", {
    ...authOptions(),
    method: "POST",
    body: toPayload(input),
  });
}

export async function updateAdminCompany(id: number | string, input: CompanyFormInput) {
  return apiClient<AdminCompany>(`/companies/${id}`, {
    ...authOptions(),
    method: "PUT",
    body: toPayload(input),
  });
}

export async function deleteAdminCompany(id: number | string) {
  return apiClient<null>(`/companies/${id}`, {
    ...authOptions(),
    method: "DELETE",
  });
}

export async function restoreAdminCompany(id: number | string) {
  return apiClient<AdminCompany>(`/companies/${id}/restore`, {
    ...authOptions(),
    method: "POST",
  });
}
