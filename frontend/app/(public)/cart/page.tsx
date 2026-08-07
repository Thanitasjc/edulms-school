"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { MediaImage } from "@/components/ui/media-image";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  cartTotal,
  cartUnitPrice,
  getCartCourses,
  removeFromCart,
  type CartCourse,
} from "@/lib/cart";
import { formatBaht } from "@/lib/money";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const [items, setItems] = useState<CartCourse[]>([]);

  useEffect(() => {
    const sync = () => setItems(getCartCourses());
    sync();
    window.addEventListener("edulms:cart-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("edulms:cart-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const total = cartTotal(items);

  if (items.length === 0) {
    return (
      <>
        <PageBreadcrumb title="Cart" items={[{ label: "Cart" }]} />
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-slate-950">
            <ShoppingCart className="mx-auto size-10 text-slate-300" />
            <p className="mt-4 font-medium text-slate-900 dark:text-white">Your cart is empty</p>
            <p className="mt-2 text-sm text-slate-500">
              Add courses from the catalog to continue checkout.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex h-10 items-center rounded-full bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-500"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadcrumb title="Cart" items={[{ label: "Cart" }]} />
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="space-y-4 lg:col-span-8">
          {items.map((item) => {
            const unit = cartUnitPrice(item);
            const thumb = item.thumbnailUrl;
            const isLocal = Boolean(thumb && (thumb.includes("localhost") || thumb.includes("127.0.0.1")));

            return (
              <article
                key={item.slug}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950"
              >
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                  {thumb ? (
                    isLocal ? (
                      <MediaImage src={thumb} alt={item.title} fill className="object-cover" sizes="96px" />
                    ) : (
                      <Image src={thumb} alt={item.title} fill className="object-cover" sizes="96px" />
                    )
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/courses/${item.slug}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 dark:text-white"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">{item.instructorName || item.category}</p>
                  <p className="mt-2 font-medium text-slate-900 dark:text-white">
                    {item.isFree || unit <= 0 ? "Free" : formatBaht(unit)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setItems(removeFromCart(item.slug))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </article>
            );
          })}
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Order summary</h2>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">{items.length} course(s)</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatBaht(total)}</span>
            </div>
            <Link
              href="/checkout"
              className={cn(buttonVariants(), "mt-6 inline-flex h-12 w-full rounded-full")}
            >
              Proceed to Checkout
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
