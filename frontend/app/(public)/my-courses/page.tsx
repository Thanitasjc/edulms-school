"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, PlayCircle } from "lucide-react";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { MediaImage } from "@/components/ui/media-image";
import { buttonVariants } from "@/components/ui/button";
import { listMyEnrollments } from "@/features/enrollments/api";
import { useAuth } from "@/providers/auth-provider";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function MyLearningPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: enrollments = [], isLoading, isError, error } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const response = await listMyEnrollments();
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: isAuthenticated,
  });

  return (
    <>
      <PageBreadcrumb title="My Learning" items={[{ label: "My Learning" }]} />
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">My Learning</h1>
          <p className="mt-1 text-sm text-slate-500">Continue where you left off and track course progress.</p>
        </div>

        {authLoading || isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : !isAuthenticated ? (
          <p className="text-sm text-slate-600">
            Please{" "}
            <Link href="/login?next=/my-courses" className="text-blue-600 underline">
              sign in
            </Link>{" "}
            to view your learning progress.
          </p>
        ) : isError ? (
          <p className="text-sm text-red-500">
            {error instanceof ApiClientError ? error.message : "Failed to load enrollments"}
          </p>
        ) : enrollments.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-slate-950">
            <BookOpen className="mx-auto size-10 text-slate-300" />
            <p className="mt-4 font-medium text-slate-900 dark:text-white">No courses yet</p>
            <p className="mt-2 text-sm text-slate-500">Enroll in a course to start tracking progress.</p>
            <Link
              href="/courses"
              className={cn(buttonVariants(), "mt-6 inline-flex h-10 rounded-full")}
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((item) => {
              const course = item.course;
              if (!course) return null;
              const percent = item.progress_percent ?? 0;
              const thumb = course.thumbnail_url;
              const isLocal = Boolean(thumb && (thumb.includes("localhost") || thumb.includes("127.0.0.1")));
              const continueHref =
                item.last_section_index != null
                  ? `/courses/${course.slug}?tab=curriculum`
                  : `/courses/${course.slug}`;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950"
                >
                  <Link href={`/courses/${course.slug}`} className="block">
                    <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-900">
                      {thumb ? (
                        isLocal ? (
                          <MediaImage src={thumb} alt={course.title} fill className="object-cover" sizes="33vw" />
                        ) : (
                          <Image src={thumb} alt={course.title} fill className="object-cover" sizes="33vw" />
                        )
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-sky-100 via-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-950" />
                      )}
                    </div>
                  </Link>

                  <div className="space-y-4 p-5">
                    <div>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="line-clamp-2 font-semibold text-slate-900 hover:text-blue-600 dark:text-white"
                      >
                        {course.title}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.completed_lessons ?? 0}/{item.total_lessons ?? 0} lessons completed
                      </p>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>Progress</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{percent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={continueHref}
                      className={cn(buttonVariants(), "inline-flex h-10 w-full items-center justify-center gap-2 rounded-full")}
                    >
                      <PlayCircle className="size-4" />
                      {percent > 0 ? "Continue learning" : "Start learning"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
