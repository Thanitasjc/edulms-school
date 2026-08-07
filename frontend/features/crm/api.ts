import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";

export type Lead = {
  id: number;
  company_id?: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: string;
  source?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

export async function createPublicLead(input: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  return apiClient<Lead>("/public/leads", { method: "POST", body: input });
}

export async function listAdminLeads(params?: { status?: string; page?: number }) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "created_at");
  query.set("direction", "desc");
  if (params?.status) query.set("filters[status]", params.status);
  if (params?.page) query.set("page", String(params.page));

  return apiClient<Lead[]>(`/leads?${query.toString()}`, authOptions());
}

export async function updateLeadStatus(id: number | string, status: string) {
  return apiClient<Lead>(`/leads/${id}/status`, {
    ...authOptions(),
    method: "PATCH",
    body: { status },
  });
}

export async function deleteAdminLead(id: number | string) {
  return apiClient<null>(`/leads/${id}`, { ...authOptions(), method: "DELETE" });
}
