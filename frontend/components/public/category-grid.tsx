"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Languages,
  LayoutGrid,
  PenLine,
  PenSquare,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { listPublicCategories } from "@/features/cms/api";

const iconMap: Record<string, LucideIcon> = {
  "pen-square": PenSquare,
  "layout-grid": LayoutGrid,
  "bar-chart-3": BarChart3,
  "pen-line": PenLine,
  languages: Languages,
  smartphone: Smartphone,
};

export function CategoryGrid() {
  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const response = await listPublicCategories();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-20 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
              Popular Categories
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Featured Design Category.
            </h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            All Categories
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const Icon = iconMap[category.icon ?? ""] ?? LayoutGrid;
            const accent =
              category.accent ||
              "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300";

            return (
              <Link
                key={category.id}
                href={`/courses?category=${encodeURIComponent(category.slug)}`}
                className="group flex items-center gap-4 rounded-[1.5rem] border border-slate-200/80 bg-[#f7f9fc] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900 dark:hover:border-blue-400/30 dark:hover:bg-slate-900"
              >
                <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${accent}`}>
                  <Icon className="size-6" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900 transition group-hover:text-blue-600 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {category.courses_count}+ Courses
                  </p>
                </div>
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
