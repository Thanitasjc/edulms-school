"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, User } from "lucide-react";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { MediaImage } from "@/components/ui/media-image";
import { getPublicBlogPost } from "@/features/blog/api";
import { ApiClientError } from "@/lib/api-client";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ["public-blog-post", slug],
    queryFn: async () => {
      const response = await getPublicBlogPost(slug);
      return response.data;
    },
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <>
        <PageBreadcrumb title="Blog Details" items={[{ label: "Blog", href: "/blog" }, { label: "Loading..." }]} />
        <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </>
    );
  }

  if (isError || !post) {
    return (
      <>
        <PageBreadcrumb title="Blog Details" items={[{ label: "Blog", href: "/blog" }, { label: "Not found" }]} />
        <div className="mx-auto w-full max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Post not found</p>
          <p className="mt-2 text-sm text-slate-500">
            {error instanceof ApiClientError && error.status !== 404
              ? error.message
              : "This blog post does not exist or is no longer published."}
          </p>
          <Link href="/blog" className="mt-6 inline-flex text-sm font-medium text-blue-600 hover:underline">
            Back to blog
          </Link>
        </div>
      </>
    );
  }

  const bodyParagraphs = (post.body || "").split(/\n\n+/).filter(Boolean);

  return (
    <>
      <PageBreadcrumb title="Blog Details" items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
      <article className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-slate-100 dark:bg-slate-900">
          {post.cover_url ? (
            <MediaImage src={post.cover_url} alt={post.title} fill className="object-cover" sizes="100vw" priority />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-100 via-indigo-50 to-slate-100 text-sm text-slate-400 dark:from-slate-800 dark:to-slate-950">
              No cover image
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {formatDate(post.published_at || post.created_at)}
          </span>
          {post.author_name ? (
            <span className="inline-flex items-center gap-1.5">
              <User className="size-4" />
              {post.author_name}
            </span>
          ) : null}
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{post.excerpt}</p>
        ) : null}

        <div className="mt-6 space-y-4 whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-300">
          {bodyParagraphs.length > 0 ? (
            bodyParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p className="text-slate-500">No content yet.</p>
          )}
        </div>

        <Link href="/blog" className="mt-8 inline-flex text-sm font-medium text-blue-600 hover:underline">
          Back to blog
        </Link>
      </article>
    </>
  );
}
