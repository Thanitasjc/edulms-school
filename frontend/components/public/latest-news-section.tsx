import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, User } from "lucide-react";
import { blogPosts } from "@/features/public/blog-posts";

export function LatestNewsSection() {
  return (
    <section className="relative z-[1] -mb-24 bg-white pt-20 pb-32 dark:bg-slate-950 sm:pb-36">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
              Meet Our Mentors
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Read Our Latest News
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            View All Blog
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-slate-950"
            >
              <Link href={`/blog/${post.slug}`} className="relative block overflow-hidden">
                <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-900">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <span className="absolute top-4 right-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                  {post.category}
                </span>
              </Link>

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {post.dateLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <User className="size-3.5" />
                    {post.author}
                  </span>
                </div>

                <h3 className="mt-3 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  <Link href={`/blog/${post.slug}`} className="transition hover:text-blue-600">
                    {post.title}
                  </Link>
                </h3>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {post.excerpt}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-900 transition hover:text-blue-600 dark:text-white"
                >
                  Read More
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
