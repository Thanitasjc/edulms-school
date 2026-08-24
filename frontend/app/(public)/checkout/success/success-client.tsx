"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { syncPayment } from "@/features/payments/api";
import { useAuth } from "@/providers/auth-provider";
import { ApiClientError } from "@/lib/api-client";
import { clearCart } from "@/lib/cart";
import { formatBaht } from "@/lib/money";

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const paymentUuid = searchParams.get("payment") ?? "";
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<"checking" | "paid" | "pending" | "error">("checking");
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?next=/checkout/success?payment=${encodeURIComponent(paymentUuid)}`);
    }
  }, [authLoading, isAuthenticated, paymentUuid, router]);

  const syncMutation = useMutation({
    mutationFn: () => syncPayment(paymentUuid),
    onSuccess: (response) => {
      const payment = response.data;
      setAmount(payment.amount);
      if (payment.status === "paid") {
        clearCart();
        setStatus("paid");
        toast.success("Payment confirmed");
      } else {
        setStatus("pending");
      }
    },
    onError: (err) => {
      setStatus("error");
      toast.error(err instanceof ApiClientError ? err.message : "Could not verify payment");
    },
  });

  useEffect(() => {
    if (!paymentUuid || !isAuthenticated) return;
    syncMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentUuid, isAuthenticated]);

  return (
    <>
      <PageBreadcrumb title="Payment result" items={[{ label: "Checkout", href: "/checkout" }, { label: "Success" }]} />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-white/10 dark:bg-slate-950">
          {status === "checking" ? (
            <p className="text-sm text-slate-500">Verifying payment...</p>
          ) : null}

          {status === "paid" ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Payment successful</h1>
              <p className="mt-2 text-sm text-slate-500">
                {amount != null ? `Charged ${formatBaht(amount)}. ` : null}
                Your courses are unlocked.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button className="rounded-full" onClick={() => router.push("/my-courses")}>
                  Go to My Courses
                </Button>
                <Link href="/courses" className="inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm">
                  Browse more
                </Link>
              </div>
            </>
          ) : null}

          {status === "pending" ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Payment pending</h1>
              <p className="mt-2 text-sm text-slate-500">
                We have not confirmed the charge yet. If you just paid, wait a moment and try again.
              </p>
              <Button
                className="mt-6 rounded-full"
                disabled={syncMutation.isPending}
                onClick={() => syncMutation.mutate()}
              >
                {syncMutation.isPending ? "Checking..." : "Check again"}
              </Button>
            </>
          ) : null}

          {status === "error" ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Could not verify payment</h1>
              <p className="mt-2 text-sm text-slate-500">Return to checkout and try again, or contact support.</p>
              <Link href="/checkout" className="mt-6 inline-block text-blue-600 underline">
                Back to checkout
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
