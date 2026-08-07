"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GitCompareArrows, Heart, ShoppingCart } from "lucide-react";
import { getFavoriteCourses } from "@/lib/favorites";
import { getCompareCourses } from "@/lib/compare";
import { getCartCourses } from "@/lib/cart";

const navItems = [
  { href: "/courses", label: "Courses" },
  { href: "/instructors", label: "Teachers" },
  { href: "/my-courses", label: "My Learning" },
  { href: "/certificates", label: "Certificates" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function HeaderIconLink({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  const showBadge = typeof count === "number" && count > 0;

  return (
    <Link
      href={href}
      aria-label={showBadge ? `${label} (${count})` : label}
      className="relative inline-flex size-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      {children}
      {showBadge ? (
        <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold leading-4 text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

export function SiteHeader() {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [compareCount, setCompareCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncFavorites = () => setFavoritesCount(getFavoriteCourses().length);
    const syncCompare = () => setCompareCount(getCompareCourses().length);
    const syncCart = () => setCartCount(getCartCourses().length);
    syncFavorites();
    syncCompare();
    syncCart();
    window.addEventListener("storage", syncFavorites);
    window.addEventListener("storage", syncCompare);
    window.addEventListener("storage", syncCart);
    window.addEventListener("edulms:favorites-changed", syncFavorites);
    window.addEventListener("edulms:compare-changed", syncCompare);
    window.addEventListener("edulms:cart-changed", syncCart);
    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener("storage", syncCompare);
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("edulms:favorites-changed", syncFavorites);
      window.removeEventListener("edulms:compare-changed", syncCompare);
      window.removeEventListener("edulms:cart-changed", syncCart);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1b3a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          EduLMS
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white/75 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <HeaderIconLink href="/compare" label="Compare" count={compareCount}>
            <GitCompareArrows className="size-4" />
          </HeaderIconLink>
          <HeaderIconLink href="/favorites" label="Favorites" count={favoritesCount}>
            <Heart className="size-4" />
          </HeaderIconLink>
          <HeaderIconLink href="/cart" label="Cart" count={cartCount}>
            <ShoppingCart className="size-4" />
          </HeaderIconLink>
          <Link
            href="/login"
            className="ml-1 inline-flex h-8 items-center rounded-lg px-3 text-sm text-white hover:bg-white/10"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex h-8 items-center rounded-lg bg-[#3b82f6] px-3 text-sm text-white hover:bg-[#2563eb]"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </header>
  );
}
