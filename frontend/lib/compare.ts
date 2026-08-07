export type CompareCourse = {
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

const STORAGE_KEY = "edulms.compare";
const MAX_COMPARE = 4;

export function getCompareCourses(): CompareCourse[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CompareCourse[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isCompareCourse(slug: string): boolean {
  return getCompareCourses().some((course) => course.slug === slug);
}

export function toggleCompareCourse(course: CompareCourse): CompareCourse[] {
  const current = getCompareCourses();
  const exists = current.some((item) => item.slug === course.slug);

  let next: CompareCourse[];
  if (exists) {
    next = current.filter((item) => item.slug !== course.slug);
  } else {
    next = [course, ...current.filter((item) => item.slug !== course.slug)].slice(0, MAX_COMPARE);
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("edulms:compare-changed"));

  return next;
}
