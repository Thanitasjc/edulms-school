"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { confirmDemoPayment, getPayment } from "@/features/payments/api";
import { useAuth } from "@/providers/auth-provider";
import { ApiClientError } from "@/lib/api-client";
import { clearCart } from "@/lib/cart";
import { formatBaht } from "@/lib/money";
import { useEffect } from "react";

export default function DemoPayPage() {
  const params = useParams<{ uuid: string }>();
  const uuid = params.uuid;
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?next=/checkout/pay/${uuid}`);
    }
  }, [authLoading, isAuthenticated, router, uuid]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["payment", uuid],
    queryFn: async () => {
      const response = await getPayment(uuid);
      return response.data;
    },
    enabled: Boolean(uuid) && isAuthenticated,
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmDemoPayment(uuid),
    onSuccess: () => {
      clearCart();
      toast.success("Payment completed");
      router.push(`/checkout/success?payment=${uuid}`);
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Payment failed");
    },
  });

  if (authLoading || isLoading) {
    return <p className="px-4 py-14 text-sm text-slate-500">Loading payment...</p>;
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-sm text-red-500">
          {error instanceof ApiClientError ? error.message : "Payment not found"}
        </p>
        <Link href="/checkout" className="mt-4 inline-block text-blue-600 underline">
          Back to checkout
        </Link>
      </div>
    );
  }

  const paid = data.status === "paid";

  return (
    <>
      <PageBreadcrumb
        title="Pay"
        items={[{ label: "Checkout", href: "/checkout" }, { label: "Payment" }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950">
          <h1 className="text-2xl font-semibold tracking-tight">Complete payment</h1>
          <p className="mt-2 text-sm text-slate-500">
            {data.gateway === "demo"
              ? "Demo gateway — no real charge. Confirm to unlock the courses."
              : "Complete payment with your configured gateway."}
          </p>

          <div className="mt-6 space-y-3">
            {(data.items ?? []).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{item.title}</span>
                <span className="shrink-0 font-medium">{formatBaht(item.amount)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
            <span className="text-sm text-slate-500">Total</span>
            <span className="text-2xl font-semibold">{formatBaht(data.amount)}</span>
          </div>

          {paid ? (
            <Button className="mt-6 h-12 w-full rounded-full" onClick={() => router.push("/my-courses")}>
              Go to My Courses
            </Button>
          ) : data.gateway === "demo" ? (
            <Button
              className="mt-6 h-12 w-full rounded-full"
              disabled={confirmMutation.isPending}
              onClick={() => confirmMutation.mutate()}
            >
              {confirmMutation.isPending ? "Processing..." : "Pay now (demo)"}
            </Button>
          ) : data.checkout_url ? (
            <Button
              className="mt-6 h-12 w-full rounded-full"
              onClick={() => {
                window.location.href = data.checkout_url!;
              }}
            >
              Continue to Stripe
            </Button>
          ) : (
            <p className="mt-6 text-sm text-slate-500">Waiting for payment provider...</p>
          )}
        </div>
      </div>
    </>
  );
}
