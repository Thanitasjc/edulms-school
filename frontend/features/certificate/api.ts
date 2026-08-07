import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";

export type Certificate = {
  id: number;
  company_id?: number;
  course_id: number;
  user_id: number;
  enrollment_id?: number | null;
  code: string;
  learner_name: string;
  course_title: string;
  issued_at?: string | null;
  quiz_attempt_id?: number | null;
  course?: { id: number; title: string; slug: string } | null;
  user?: { id: number; name: string; email: string } | null;
  created_at?: string | null;
};

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

export async function listMyCertificates() {
  return apiClient<Certificate[]>("/certificates/mine", { token: getStoredToken() });
}

export async function getPublicCertificate(code: string) {
  return apiClient<Certificate>(`/public/certificates/${code}`);
}

export async function listAdminCertificates(params?: { page?: number }) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "issued_at");
  query.set("direction", "desc");
  if (params?.page) query.set("page", String(params.page));

  return apiClient<Certificate[]>(`/certificates?${query.toString()}`, authOptions());
}
