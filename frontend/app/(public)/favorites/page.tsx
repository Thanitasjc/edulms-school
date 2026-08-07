"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { FeaturedCourseCard } from "@/components/public/featured-course-card";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { FavoriteCourse, getFavoriteCourses } from "@/lib/favorites";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteCourse[]>([]);

  useEffect(() => {
    const sync = () => setFavorites(getFavoriteCourses());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("edulms:favorites-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("edulms:favorites-changed", sync);
    };
  }, []);

  return (
    <>
      <PageBreadcrumb title="Favorites" items={[{ label: "Favorites" }]} />
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {favorites.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-slate-950">
            <Heart className="mx-auto size-10 text-slate-300" />
            <p className="mt-4 font-medium text-slate-900 dark:text-white">No favorites yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Save courses with the heart button on course cards to see them here.
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
            {favorites.map((course) => (
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
