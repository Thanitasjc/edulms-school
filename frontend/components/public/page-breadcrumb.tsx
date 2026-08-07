import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageBreadcrumbProps = {
  title: string;
  items?: BreadcrumbItem[];
};

export function PageBreadcrumb({ title, items }: PageBreadcrumbProps) {
  const crumbs = items ?? [{ label: title }];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#eef4ff] via-[#f3f7fc] to-[#e8f0fb] py-16 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute top-8 right-[12%] size-8 rounded-full border-2 border-blue-300/50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-[8%] size-3 rounded-full bg-amber-400/70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-[18%] size-2 rounded-full bg-blue-400/60"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <nav aria-label="Breadcrumb" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <Link href="/" className="font-medium text-blue-600 transition hover:text-blue-700">
            Home
          </Link>
          {crumbs.map((item) => (
            <span key={`${item.label}-${item.href ?? "current"}`} className="contents">
              <span className="text-slate-400" aria-hidden>
                /
              </span>
              {item.href ? (
                <Link href={item.href} className="font-medium text-blue-600 transition hover:text-blue-700">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}
