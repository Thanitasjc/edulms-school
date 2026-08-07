"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Share2 } from "lucide-react";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { listPublicInstructors } from "@/features/instructors/api";
import { MediaImage } from "@/components/ui/media-image";

export default function InstructorsPage() {
  const { data: instructors = [], isLoading } = useQuery({
    queryKey: ["public-instructors"],
    queryFn: async () => {
      const response = await listPublicInstructors({ limit: 24 });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  return (
    <>
      <PageBreadcrumb title="Teachers" items={[{ label: "Teachers" }]} />
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-center text-sm text-slate-500">Loading teachers...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {instructors.map((instructor) => (
              <article key={instructor.slug} className="group">
                <div className="relative overflow-hidden rounded-[1.75rem]">
                  <div className="relative aspect-[410/470] bg-slate-100 dark:bg-slate-900">
                    {instructor.avatar_url ? (
                      instructor.avatar_url.includes("localhost") ||
                      instructor.avatar_url.includes("127.0.0.1") ? (
                        <MediaImage
                          src={instructor.avatar_url}
                          alt={instructor.name}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                      ) : (
                        <Image
                          src={instructor.avatar_url}
                          alt={instructor.name}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                      )
                    ) : null}
                  </div>
                  <div className="absolute right-4 bottom-4">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900">
                      <Share2 className="size-4" />
                    </span>
                  </div>
                </div>
                <div className="mt-5 text-center">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    <Link href={`/instructors/${instructor.slug}`} className="transition hover:text-blue-600">
                      {instructor.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {instructor.role || instructor.subtitle}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
