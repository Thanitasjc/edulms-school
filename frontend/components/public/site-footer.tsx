import Link from "next/link";

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.7 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1-.1 1.5-.7 2.8-.7s1.7.7 2.8.6c1.2-.1 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.1-2.4-.1 0-2.1-.8-2.1-3.2zM14.6 6.5c.6-.7 1-1.7.9-2.7-0.9.1-1.9.6-2.5 1.3-.6.6-1.1 1.6-1 2.6 1 .1 1.9-.5 2.6-1.2z" />
    </svg>
  );
}

function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3.6 2.3c-.3.2-.6.6-.6 1.1v17.2c0 .5.3.9.6 1.1l9.5-9.7L3.6 2.3zm11.1 7.1L6.3 3.1l10.4 5.9-2 1.4zM6.3 20.9l8.4-6.1 2 1.4-10.4 5.9zm10.2-6.9 2.4 1.4c.9.5.9 1.4 0 1.9l-2.7 1.5-2.2-1.6 2.5-3.2z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.992 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.94 6.5A1.94 1.94 0 1 1 6.94 2.6a1.94 1.94 0 0 1 0 3.9zM4.75 8.75h4.38v12.5H4.75V8.75zm7.13 0h4.2v1.71h.06c.58-1.1 2-2.26 4.12-2.26 4.4 0 5.21 2.9 5.21 6.67v6.38h-4.38v-5.66c0-1.35-.02-3.09-1.88-3.09-1.89 0-2.18 1.47-2.18 2.99v5.76h-4.15V8.75z" />
    </svg>
  );
}

const usefulLinks = [
  { href: "/about", label: "About EduLMS" },
  { href: "/contact", label: "Contact" },
  { href: "/courses", label: "Help Centre" },
  { href: "/courses", label: "Refund" },
  { href: "/about", label: "Conditions" },
  { href: "/about", label: "Privacy Policy" },
];

const categories = [
  { href: "/courses?category=art-design", label: "Art Design" },
  { href: "/courses?category=graphic-design", label: "Graphic Design" },
  { href: "/courses?category=web", label: "Web Design" },
  { href: "/courses?category=graphic-design", label: "UX/UI Design" },
];

export function SiteFooter() {
  return (
    <footer className="relative bg-[#071226] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 -translate-y-1/2">
        <div className="pointer-events-auto mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[1.75rem] bg-blue-600 px-6 py-8 shadow-[0_24px_60px_rgba(37,99,235,0.35)] sm:px-10 sm:py-10 lg:px-12">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Download App
                </span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Are you Ready to Start your Online Course?
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="inline-flex h-12 items-center gap-3 rounded-xl border border-white/40 px-4 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <AppleIcon className="size-5" />
                  Apple Store
                </a>
                <a
                  href="#"
                  className="inline-flex h-12 items-center gap-3 rounded-xl border border-white/40 px-4 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <PlayStoreIcon className="size-5" />
                  Play Store
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-28 pb-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8 lg:pt-36">
        <div>
          <Link href="/" className="text-xl font-semibold tracking-tight">
            EduLMS
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            Through a combination of lectures, readings, discussions, students will gain solid foundation in
            educational.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href="#"
              aria-label="Twitter"
              className="inline-flex size-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-blue-600 hover:text-white"
            >
              <TwitterIcon className="size-3.5" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="inline-flex size-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-blue-600 hover:text-white"
            >
              <FacebookIcon className="size-3.5" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="inline-flex size-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-blue-600 hover:text-white"
            >
              <LinkedinIcon className="size-3.5" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-base font-semibold">Useful Link</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/65">
            {usefulLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-base font-semibold">Categories</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/65">
            {categories.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-base font-semibold">Newsletter</p>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            Sign up for our newsletter and get 34% off your next course.
          </p>
          <form className="mt-5" action="#" method="post">
            <div className="flex overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
              <input
                type="email"
                required
                name="email"
                placeholder="Enter Your Email*"
                aria-label="Email Address"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                className="shrink-0 bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                Subscribe
              </button>
            </div>
            <label className="mt-3 flex items-start gap-2 text-xs text-white/55">
              <input type="checkbox" required name="agree" className="mt-0.5 size-3.5 rounded border-white/20 bg-transparent" />
              I agree to the terms of use and privacy policy.
            </label>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        Copyright © {new Date().getFullYear()} All Rights Reserved by EduLMS
      </div>
    </footer>
  );
}
