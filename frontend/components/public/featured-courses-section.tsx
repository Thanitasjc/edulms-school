"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeaturedCourseCard } from "@/components/public/featured-course-card";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type PublicCourse = {
  id: number;
  title: string;
  slug: string;
  category: string;
  thumbnail_url?: string | null;
  lessons_count: number;
  students_count: number;
  duration_hours: number;
  price: number;
  sale_price?: number | null;
  is_free: boolean;
  instructor_name: string;
  instructor_avatar_url?: string | null;
  rating: number;
  reviews_count: number;
};

const tabs = [
  { key: "all", label: "See All" },
  { key: "trending", label: "Trending" },
  { key: "featured", label: "Featured" },
  { key: "web", label: "Web" },
  { key: "popular", label: "Popular" },
] as const;

async function fetchCourses(tab: string) {
  const query = new URLSearchParams({
    featured_home: "1",
    limit: "6",
  });

  if (tab !== "all") {
    query.set("tab", tab);
  }

  const response = await apiClient<PublicCourse[]>(`/public/courses?${query.toString()}`);
  return Array.isArray(response.data) ? response.data : [];
}

export function FeaturedCoursesSection() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("all");

  const { data = [], isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["public-courses", activeTab],
    queryFn: () => fetchCourses(activeTab),
    // Render free tier can take 30–60s to wake; mobile networks often abort once.
    retry: 4,
    retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 12000),
  });

  const title = useMemo(() => "Explore Featured Courses", []);

  return (
    <section className="overflow-hidden bg-[#f7f9fc] py-20 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
            Top Popular Courses
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {title}
          </h2>
        </div>

        <div className="mb-10 flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm dark:border-white/10 dark:bg-slate-900">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  activeTab === tab.key
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading || (isFetching && data.length === 0) ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-slate-500">
              กำลังโหลดคอร์ส… หาก API พักอยู่ อาจใช้เวลาสักครู่
            </p>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[420px] animate-pulse rounded-[1.75rem] bg-white dark:bg-slate-900"
                />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-slate-900">
            <p className="font-medium text-slate-900 dark:text-white">ไม่สามารถโหลดคอร์สได้</p>
            <p className="mt-2 text-sm text-slate-500">
              การเชื่อมต่อ API ล่าช้าหรือหลุดชั่วคราว — ลองใหม่อีกครั้ง
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              ลองใหม่
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-slate-900">
            <p className="font-medium text-slate-900 dark:text-white">ยังไม่มีคอร์สในหมวดนี้</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.map((course) => (
              <FeaturedCourseCard
                key={course.id}
                id={course.id}
                slug={course.slug}
                title={course.title}
                category={course.category}
                lessonsCount={course.lessons_count}
                studentsCount={course.students_count}
                durationHours={course.duration_hours}
                price={course.price}
                salePrice={course.sale_price}
                isFree={course.is_free}
                instructorName={course.instructor_name}
                instructorAvatarUrl={course.instructor_avatar_url}
                thumbnailUrl={course.thumbnail_url}
                rating={course.rating}
                reviewsCount={course.reviews_count}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
