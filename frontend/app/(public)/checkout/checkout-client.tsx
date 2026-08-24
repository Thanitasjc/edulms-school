"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { checkoutCourses } from "@/features/enrollments/api";
import { useAuth } from "@/providers/auth-provider";
import { ApiClientError } from "@/lib/api-client";
import { cartTotal, cartUnitPrice, clearCart, getCartCourses, type CartCourse } from "@/lib/cart";
import { formatBaht } from "@/lib/money";

export default function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [items, setItems] = useState<CartCourse[]>([]);

  useEffect(() => {
    setItems(getCartCourses());
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?next=/checkout");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (searchParams.get("cancelled") === "1") {
      toast.message("Payment cancelled. Your cart is still saved.");
    }
  }, [searchParams]);

  const mutation = useMutation({
    mutationFn: () => checkoutCourses(items.map((item) => item.id)),
    onSuccess: (response) => {
      const data = response.data;

      if (data.mode === "payment_required" && data.checkout_url) {
        toast.message("Redirecting to payment...");
        window.location.href = data.checkout_url;
        return;
      }

      clearCart();
      const skipped = data.skipped_course_ids?.length ?? 0;
      toast.success(
        skipped > 0
          ? `Enrolled ${data.purchased_count ?? 0} course(s). ${skipped} already owned.`
          : `Successfully enrolled in ${data.purchased_count ?? 0} course(s).`,
      );
      router.push("/my-courses");
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Checkout failed");
    },
  });

  const total = cartTotal(items);
  const hasPaidItems = items.some((item) => !item.isFree && cartUnitPrice(item) > 0);

  if (isLoading) {
    return <p className="px-4 py-14 text-sm text-slate-500">Loading...</p>;
  }

  if (items.length === 0) {
    return (
      <>
        <PageBreadcrumb title="Checkout" items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <p className="text-slate-600">Your cart is empty.</p>
          <Link href="/courses" className="mt-4 inline-block text-blue-600 underline">
            Browse courses
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadcrumb title="Checkout" items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950 lg:col-span-7">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Payment</h2>
          <p className="mt-2 text-sm text-slate-500">
            {hasPaidItems
              ? "Paid courses continue to Stripe Checkout when configured, or the demo pay page locally."
              : "All selected courses are free — confirming will enroll you instantly."}
          </p>
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li key={item.slug} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">{item.title}</span>
                <span className="shrink-0 font-medium text-slate-900 dark:text-white">
                  {item.isFree || cartUnitPrice(item) <= 0 ? "Free" : formatBaht(cartUnitPrice(item))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Total</h2>
            <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{formatBaht(total)}</p>
            <Button
              className="mt-6 h-12 w-full rounded-full"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending
                ? "Processing..."
                : hasPaidItems
                  ? "Continue to payment"
                  : "Confirm & Enroll"}
            </Button>
            <p className="mt-3 text-center text-xs text-slate-500">
              Access unlocks after successful payment for paid courses.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
