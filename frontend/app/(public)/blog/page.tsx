"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, User } from "lucide-react";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { MediaImage } from "@/components/ui/media-image";
import { listPublicBlogPosts } from "@/features/blog/api";
import { ApiClientError } from "@/lib/api-client";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPage() {
  const { data: posts = [], isLoading, isError, error } = useQuery({
    queryKey: ["public-blog-posts"],
    queryFn: async () => {
      const response = await listPublicBlogPosts();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  return (
    <>
      <PageBreadcrumb title="Blog" items={[{ label: "Blog" }]} />
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading posts...</p>
        ) : isError ? (
          <p className="text-sm text-red-500">
            {error instanceof ApiClientError ? error.message : "Failed to load blog posts"}
          </p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-slate-500">No blog posts published yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950"
              >
                <Link href={`/blog/${post.slug}`} className="relative block overflow-hidden">
                  <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-900">
                    {post.cover_url ? (
                      <MediaImage
                        src={post.cover_url}
                        alt={post.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-100 via-indigo-50 to-slate-100 text-sm text-slate-400 dark:from-slate-800 dark:to-slate-950">
                        No cover
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                    {post.author_name ? (
                      <span className="inline-flex items-center gap-1.5">
                        <User className="size-3.5" />
                        {post.author_name}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    <Link href={`/blog/${post.slug}`} className="transition hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>
                  ) : null}
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
        )}
      </div>
    </>
  );
}
