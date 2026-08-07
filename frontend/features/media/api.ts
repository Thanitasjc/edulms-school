import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";

export type MediaAsset = {
  id: number;
  company_id?: number;
  disk?: string;
  path: string;
  url: string;
  original_name: string;
  mime?: string;
  size?: number;
  collection?: string | null;
  uploaded_by?: number | null;
  uploader?: { id: number; name: string; email: string } | null;
  created_at?: string | null;
};

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

export async function listAdminMedia(params?: { page?: number }) {
  const query = new URLSearchParams();
  query.set("per_page", "30");
  query.set("sort", "created_at");
  query.set("direction", "desc");
  if (params?.page) query.set("page", String(params.page));

  return apiClient<MediaAsset[]>(`/media?${query.toString()}`, authOptions());
}

export async function deleteAdminMedia(id: number | string) {
  return apiClient<null>(`/media/${id}`, { ...authOptions(), method: "DELETE" });
}
