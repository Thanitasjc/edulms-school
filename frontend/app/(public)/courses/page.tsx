"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FeaturedCourseCard } from "@/components/public/featured-course-card";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { apiClient } from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const subjects = [
  { value: "all", label: "Select Subject" },
  { value: "art-design", label: "Art Design" },
  { value: "graphic-design", label: "Graphic Design" },
  { value: "web", label: "Web" },
] as const;

function CoursesCatalog() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const initialSearch = searchParams.get("search") ?? "";

  const [category, setCategory] = useState(initialCategory);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);

  const queryKey = useMemo(
    () => ["public-courses-page", category, search] as const,
    [category, search],
  );

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        per_page: "12",
        sort: "published_at",
        direction: "desc",
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (category && category !== "all") {
        params.set("filters[category]", category);
      }

      const response = await apiClient<PublicCourse[]>(`/public/courses?${params.toString()}`);

      return {
        courses: Array.isArray(response.data) ? response.data : [],
        total: Number(response.meta?.total ?? (Array.isArray(response.data) ? response.data.length : 0)),
      };
    },
  });

  const courses = data?.courses ?? [];
  const shown = courses.length;
  const total = data?.total ?? 0;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  return (
    <>
      <div className="mt-0 flex flex-col gap-4 rounded-[1.25rem] border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-slate-950">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Showing <span className="font-semibold text-slate-900 dark:text-white">{shown}</span> of{" "}
          <span className="font-semibold text-slate-900 dark:text-white">{total}</span> results
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={category}
            onValueChange={(value) => setCategory(value ?? "all")}
          >
            <SelectTrigger className="h-11 w-full min-w-[180px] rounded-xl border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-slate-900 sm:w-[200px]">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.value} value={subject.value}>
                  {subject.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-[260px]">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search Item"
              aria-label="Search courses"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white py-2 pr-12 pl-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Search className="size-4" />
            </button>
          </form>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[420px] animate-pulse rounded-[1.75rem] bg-white dark:bg-slate-900" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-slate-900">
          <p className="font-medium text-slate-900 dark:text-white">No courses found</p>
          <p className="mt-2 text-sm text-slate-500">Try another subject or search term.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
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
    </>
  );
}

export default function CoursesPage() {
  return (
    <>
      <PageBreadcrumb title="Courses" items={[{ label: "Courses" }]} />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="h-16 animate-pulse rounded-[1.25rem] bg-white dark:bg-slate-900" />
          }
        >
          <CoursesCatalog />
        </Suspense>
      </div>
    </>
  );
}
