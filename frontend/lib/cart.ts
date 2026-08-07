export type CartCourse = {
  id: number;
  slug: string;
  title: string;
  category: string;
  price: number;
  salePrice?: number | null;
  isFree?: boolean;
  thumbnailUrl?: string | null;
  instructorName?: string;
};

const STORAGE_KEY = "edulms.cart";

export function getCartCourses(): CartCourse[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartCourse[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isInCart(slug: string): boolean {
  return getCartCourses().some((course) => course.slug === slug);
}

export function addToCart(course: CartCourse): CartCourse[] {
  const current = getCartCourses();
  const next = [course, ...current.filter((item) => item.slug !== course.slug)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("edulms:cart-changed"));
  return next;
}

export function removeFromCart(slug: string): CartCourse[] {
  const next = getCartCourses().filter((item) => item.slug !== slug);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("edulms:cart-changed"));
  return next;
}

export function clearCart(): CartCourse[] {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event("edulms:cart-changed"));
  return [];
}

export function cartUnitPrice(course: CartCourse): number {
  if (course.isFree) return 0;
  if (course.salePrice != null && course.salePrice >= 0) return Number(course.salePrice);
  return Number(course.price) || 0;
}

export function cartTotal(courses: CartCourse[]): number {
  return courses.reduce((sum, course) => sum + cartUnitPrice(course), 0);
}
