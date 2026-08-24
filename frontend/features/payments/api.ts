import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";
import type { Enrollment } from "@/features/enrollments/api";

export type PaymentItem = {
  id: number;
  course_id: number;
  title: string;
  amount: number;
  course?: {
    id: number;
    title: string;
    slug: string;
  } | null;
};

export type Payment = {
  id: number;
  uuid: string;
  user_id?: number;
  status: string;
  gateway: string;
  amount: number;
  currency: string;
  external_id?: string | null;
  checkout_url?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  items?: PaymentItem[];
};

export type CheckoutResult = {
  mode: "enrolled" | "payment_required";
  checkout_url?: string | null;
  payment?: Payment | null;
  enrollments?: Enrollment[];
  enrollment?: Enrollment | null;
  skipped_course_ids?: number[];
  purchased_count?: number;
};

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

function publicAuthOptions() {
  return {
    token: getStoredToken(),
  };
}

export async function checkoutPayments(courseIds: number[]) {
  return apiClient<CheckoutResult>("/payments/checkout", {
    ...publicAuthOptions(),
    method: "POST",
    body: { course_ids: courseIds },
  });
}

export async function getPayment(uuid: string) {
  return apiClient<Payment>(`/payments/${uuid}`, publicAuthOptions());
}

export async function confirmDemoPayment(uuid: string) {
  return apiClient<Payment>(`/payments/${uuid}/confirm`, {
    ...publicAuthOptions(),
    method: "POST",
  });
}

export async function syncPayment(uuid: string) {
  return apiClient<Payment>(`/payments/${uuid}/sync`, {
    ...publicAuthOptions(),
    method: "POST",
  });
}

export async function listAdminPayments(params?: {
  search?: string;
  status?: string;
  gateway?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "created_at");
  query.set("direction", "desc");
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("filters[status]", params.status);
  if (params?.gateway) query.set("filters[gateway]", params.gateway);
  if (params?.page) query.set("page", String(params.page));

  return apiClient<Payment[]>(`/payments?${query.toString()}`, authOptions());
}
