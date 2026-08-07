export type FavoriteCourse = {
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

const STORAGE_KEY = "edulms.favorites";

export function getFavoriteCourses(): FavoriteCourse[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as FavoriteCourse[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavoriteCourse(slug: string): boolean {
  return getFavoriteCourses().some((course) => course.slug === slug);
}

export function addFavoriteCourse(course: FavoriteCourse): FavoriteCourse[] {
  const current = getFavoriteCourses();
  const next = [course, ...current.filter((item) => item.slug !== course.slug)];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("edulms:favorites-changed"));

  return next;
}

export function toggleFavoriteCourse(course: FavoriteCourse): FavoriteCourse[] {
  const current = getFavoriteCourses();
  const exists = current.some((item) => item.slug === course.slug);
  const next = exists
    ? current.filter((item) => item.slug !== course.slug)
    : [course, ...current.filter((item) => item.slug !== course.slug)];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("edulms:favorites-changed"));

  return next;
}
