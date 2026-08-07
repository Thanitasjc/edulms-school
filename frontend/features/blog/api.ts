import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";

export type BlogPost = {
  id: number;
  company_id?: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  cover_url?: string | null;
  author_name?: string | null;
  status: string;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

export async function listPublicBlogPosts() {
  return apiClient<BlogPost[]>("/public/blog");
}

export async function getPublicBlogPost(slug: string) {
  return apiClient<BlogPost>(`/public/blog/${slug}`);
}

export async function listAdminBlogPosts(params?: { status?: string; page?: number }) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "published_at");
  query.set("direction", "desc");
  if (params?.status) query.set("filters[status]", params.status);
  if (params?.page) query.set("page", String(params.page));

  return apiClient<BlogPost[]>(`/blog-posts?${query.toString()}`, authOptions());
}

export async function createAdminBlogPost(input: {
  title: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  cover_url?: string;
  author_name?: string;
  status?: string;
  published_at?: string;
}) {
  return apiClient<BlogPost>("/blog-posts", { ...authOptions(), method: "POST", body: input });
}

export async function updateAdminBlogPost(
  id: number | string,
  input: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    cover_url: string;
    author_name: string;
    status: string;
    published_at: string;
  }>,
) {
  return apiClient<BlogPost>(`/blog-posts/${id}`, { ...authOptions(), method: "PUT", body: input });
}

export async function deleteAdminBlogPost(id: number | string) {
  return apiClient<null>(`/blog-posts/${id}`, { ...authOptions(), method: "DELETE" });
}
