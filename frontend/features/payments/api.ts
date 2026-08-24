import { apiClient } from "@/lib/api-client";
import { getStoredToken } from "@/features/auth/api";
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
  status: string;
  gateway: string;
  amount: number;
  currency: string;
  external_id?: string | null;
  checkout_url?: string | null;
  paid_at?: string | null;
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
  };
}

export async function checkoutPayments(courseIds: number[]) {
  return apiClient<CheckoutResult>("/payments/checkout", {
    ...authOptions(),
    method: "POST",
    body: { course_ids: courseIds },
  });
}

export async function getPayment(uuid: string) {
  return apiClient<Payment>(`/payments/${uuid}`, authOptions());
}

export async function confirmDemoPayment(uuid: string) {
  return apiClient<Payment>(`/payments/${uuid}/confirm`, {
    ...authOptions(),
    method: "POST",
  });
}

export async function syncPayment(uuid: string) {
  return apiClient<Payment>(`/payments/${uuid}/sync`, {
    ...authOptions(),
    method: "POST",
  });
}
