"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Clock, GitCompareArrows, Heart, Star, Users } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { isFavoriteCourse, toggleFavoriteCourse } from "@/lib/favorites";
import { isCompareCourse, toggleCompareCourse } from "@/lib/compare";
import { addToCart, isInCart } from "@/lib/cart";
import { formatBaht } from "@/lib/money";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type FeaturedCourseCardProps = {
  id?: number;
  slug: string;
  title: string;
  category: string;
  lessonsCount: number;
  studentsCount: number;
  durationHours: number;
  price: number;
  salePrice?: number | null;
  isFree?: boolean;
  instructorName: string;
  instructorAvatarUrl?: string | null;
  thumbnailUrl?: string | null;
  rating?: number;
  reviewsCount?: number;
};

export function FeaturedCourseCard({
  id,
  slug,
  title,
  category,
  lessonsCount,
  studentsCount,
  durationHours,
  price,
  salePrice,
  isFree,
  instructorName,
  instructorAvatarUrl,
  thumbnailUrl,
  rating = 0,
  reviewsCount = 0,
}: FeaturedCourseCardProps) {
  const [favorited, setFavorited] = useState(false);
  const [compared, setCompared] = useState(false);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const syncFavorites = () => setFavorited(isFavoriteCourse(slug));
    const syncCompare = () => setCompared(isCompareCourse(slug));
    const syncCart = () => setInCart(isInCart(slug));
    syncFavorites();
    syncCompare();
    syncCart();
    window.addEventListener("edulms:favorites-changed", syncFavorites);
    window.addEventListener("edulms:compare-changed", syncCompare);
    window.addEventListener("edulms:cart-changed", syncCart);
    return () => {
      window.removeEventListener("edulms:favorites-changed", syncFavorites);
      window.removeEventListener("edulms:compare-changed", syncCompare);
      window.removeEventListener("edulms:cart-changed", syncCart);
    };
  }, [slug]);

  function handleFavoriteClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const next = toggleFavoriteCourse({
      slug,
      title,
      category,
      lessonsCount,
      studentsCount,
      durationHours,
      price,
      salePrice,
      isFree,
      instructorName,
      instructorAvatarUrl,
      thumbnailUrl,
      rating,
      reviewsCount,
    });

    setFavorited(next.some((item) => item.slug === slug));
  }

  function handleCompareClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const next = toggleCompareCourse({
      slug,
      title,
      category,
      lessonsCount,
      studentsCount,
      durationHours,
      price,
      salePrice,
      isFree,
      instructorName,
      instructorAvatarUrl,
      thumbnailUrl,
      rating,
      reviewsCount,
    });

    setCompared(next.some((item) => item.slug === slug));
  }

  function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!id) {
      toast.error("Course id missing — open the course page to add to cart");
      return;
    }

    addToCart({
      id,
      slug,
      title,
      category,
      price,
      salePrice,
      isFree,
      thumbnailUrl,
      instructorName,
    });
    setInCart(true);
    toast.success(inCart ? "Already in cart" : "Added to cart");
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-slate-950">
      <div className="relative">
        <Link href={`/courses/${slug}`} className="block overflow-hidden">
          <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-900">
            {thumbnailUrl ? (
              <MediaImage
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-sky-100 via-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-950" />
            )}

            <div className="pointer-events-none absolute inset-0 bg-slate-950/0 transition duration-300 group-hover:bg-slate-950/45" />
          </div>
        </Link>

        <Link
          href={`/courses?category=${encodeURIComponent(category)}`}
          className="absolute left-4 top-4 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition group-hover:opacity-0 dark:bg-slate-950/90 dark:text-slate-200"
        >
          {category}
        </Link>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 transition duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex h-11 translate-y-2 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-medium text-white shadow-lg transition duration-300 hover:bg-blue-500 group-hover:translate-y-0"
          >
            {inCart ? "In Cart" : "Add to Cart"}
          </button>
        </div>

        <div
          className={cn(
            "absolute top-4 right-4 z-20 flex flex-col gap-2 transition duration-300",
            favorited || compared
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
          )}
        >
          <button
            type="button"
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favorited}
            onClick={handleFavoriteClick}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition hover:text-rose-500 dark:bg-slate-950 dark:text-slate-200",
              favorited && "text-rose-500",
            )}
          >
            <Heart className={cn("size-4", favorited && "fill-current")} />
          </button>
          <button
            type="button"
            aria-label={compared ? "Remove from compare" : "Add to compare"}
            aria-pressed={compared}
            onClick={handleCompareClick}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition hover:text-blue-600 dark:bg-slate-950 dark:text-slate-200",
              compared && "text-blue-600",
            )}
          >
            <GitCompareArrows className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
          <li className="inline-flex items-center gap-1.5">
            <BookOpen className="size-3.5" />
            {lessonsCount} Lessons
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" />
            {studentsCount} Students
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {durationHours} Hours
          </li>
        </ul>

        <h3 className="mt-3 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          <Link href={`/courses/${slug}`} className="transition hover:text-blue-600">
            {title}
          </Link>
        </h3>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="text-sm">
            {salePrice != null ? (
              <span className="text-slate-500">
                <del className="mr-2 text-slate-400">{formatBaht(price)}</del>
                <span className="font-semibold text-slate-900 dark:text-white">{formatBaht(salePrice)}</span>
              </span>
            ) : (
              <span className="font-semibold text-slate-900 dark:text-white">{formatBaht(price)}</span>
            )}
          </div>
          {(isFree || price === 0) && (
            <span className="text-base font-semibold text-emerald-600">Free</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative size-9 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              {instructorAvatarUrl ? (
                <MediaImage src={instructorAvatarUrl} alt={instructorName} fill className="object-cover" sizes="36px" />
              ) : null}
            </div>
            <p className="truncate text-sm text-slate-600 dark:text-slate-300">
              By <span className="font-medium text-slate-900 dark:text-white">{instructorName}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn("size-3.5", index < Math.round(rating) ? "fill-current" : "text-slate-300 dark:text-slate-700")}
              />
            ))}
            <span className="ml-1 text-xs text-slate-500">({reviewsCount})</span>
          </div>
        </div>
      </div>
    </article>
  );
}
