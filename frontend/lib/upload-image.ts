import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";

export type UploadedImage = {
  url: string;
  path: string;
  original_name: string;
};

/**
 * Shared image upload used by course / instructor / CMS forms.
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const headers = new Headers();
  headers.set("Accept", "application/json");
  const token = getStoredToken();
  const companyId = getStoredCompanyId();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (companyId) headers.set("X-Company-Id", String(companyId));

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/media/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as {
    success: boolean;
    message: string;
    data?: UploadedImage;
  } | null;

  if (!response.ok || !payload || payload.success === false || !payload.data) {
    throw new Error(payload?.message || "Upload failed");
  }

  return payload.data;
}
