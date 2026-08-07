"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GitCompareArrows } from "lucide-react";
import { FeaturedCourseCard } from "@/components/public/featured-course-card";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { CompareCourse, getCompareCourses } from "@/lib/compare";

export default function ComparePage() {
  const [courses, setCourses] = useState<CompareCourse[]>([]);

  useEffect(() => {
    const sync = () => setCourses(getCompareCourses());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("edulms:compare-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("edulms:compare-changed", sync);
    };
  }, []);

  return (
    <>
      <PageBreadcrumb title="Compare" items={[{ label: "Compare" }]} />
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {courses.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-slate-950">
            <GitCompareArrows className="mx-auto size-10 text-slate-300" />
            <p className="mt-4 font-medium text-slate-900 dark:text-white">No courses to compare</p>
            <p className="mt-2 text-sm text-slate-500">
              Use the compare icon on course cards to add up to 4 courses.
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex h-10 items-center rounded-full bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-500"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <FeaturedCourseCard
                key={course.slug}
                slug={course.slug}
                title={course.title}
                category={course.category}
                lessonsCount={course.lessonsCount}
                studentsCount={course.studentsCount}
                durationHours={course.durationHours}
                price={course.price}
                salePrice={course.salePrice}
                isFree={course.isFree}
                instructorName={course.instructorName}
                instructorAvatarUrl={course.instructorAvatarUrl}
                thumbnailUrl={course.thumbnailUrl}
                rating={course.rating}
                reviewsCount={course.reviewsCount}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
