import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";

export type PublicCategory = {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  accent?: string | null;
  courses_count: number;
};

export type PublicHeroSlide = {
  id: number;
  subtitle?: string | null;
  title: string;
  title_accent?: string | null;
  description?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  image_url?: string | null;
  sort_order: number;
};

export type AdminCategory = PublicCategory & {
  sort_order: number;
  is_featured: boolean;
  status: string;
};

export type AdminHeroSlide = PublicHeroSlide & {
  is_active: boolean;
};

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

export async function listPublicCategories() {
  return apiClient<PublicCategory[]>("/public/categories");
}

export async function listPublicHeroSlides() {
  return apiClient<PublicHeroSlide[]>("/public/hero-slides");
}

export async function listAdminCategories() {
  return apiClient<AdminCategory[]>(
    "/categories?per_page=50&sort=sort_order&direction=asc",
    authOptions(),
  );
}

export async function createAdminCategory(body: Partial<AdminCategory> & { name: string }) {
  return apiClient<AdminCategory>("/categories", { ...authOptions(), method: "POST", body });
}

export async function updateAdminCategory(id: number, body: Partial<AdminCategory>) {
  return apiClient<AdminCategory>(`/categories/${id}`, { ...authOptions(), method: "PUT", body });
}

export async function deleteAdminCategory(id: number) {
  return apiClient<null>(`/categories/${id}`, { ...authOptions(), method: "DELETE" });
}

export async function listAdminHeroSlides() {
  return apiClient<AdminHeroSlide[]>(
    "/hero-slides?per_page=50&sort=sort_order&direction=asc",
    authOptions(),
  );
}

export async function createAdminHeroSlide(body: Partial<AdminHeroSlide> & { title: string }) {
  return apiClient<AdminHeroSlide>("/hero-slides", { ...authOptions(), method: "POST", body });
}

export async function updateAdminHeroSlide(id: number, body: Partial<AdminHeroSlide>) {
  return apiClient<AdminHeroSlide>(`/hero-slides/${id}`, { ...authOptions(), method: "PUT", body });
}

export async function deleteAdminHeroSlide(id: number) {
  return apiClient<null>(`/hero-slides/${id}`, { ...authOptions(), method: "DELETE" });
}
