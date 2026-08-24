"use client";

import { Suspense } from "react";
import CheckoutSuccessClient from "./success-client";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<p className="px-4 py-14 text-sm text-slate-500">Verifying payment...</p>}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
