"use client";

import { Suspense } from "react";
import CheckoutPageClient from "./checkout-client";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="px-4 py-14 text-sm text-slate-500">Loading...</p>}>
      <CheckoutPageClient />
    </Suspense>
  );
}
