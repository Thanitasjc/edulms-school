"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { listMyCertificates } from "@/features/certificate/api";
import { useAuth } from "@/providers/auth-provider";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function MyCertificatesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: certificates = [], isLoading, isError, error } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: async () => {
      const response = await listMyCertificates();
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: isAuthenticated,
  });

  return (
    <>
      <PageBreadcrumb title="Certificates" items={[{ label: "Certificates" }]} />
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">My Certificates</h1>
          <p className="mt-1 text-sm text-slate-500">Certificates earned from completed courses.</p>
        </div>

        {authLoading || isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : !isAuthenticated ? (
          <p className="text-sm text-slate-600">
            Please{" "}
            <Link href="/login?next=/certificates" className="text-blue-600 underline">
              sign in
            </Link>{" "}
            to view your certificates.
          </p>
        ) : isError ? (
          <p className="text-sm text-red-500">
            {error instanceof ApiClientError ? error.message : "Failed to load certificates"}
          </p>
        ) : certificates.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-slate-950">
            <Award className="mx-auto size-10 text-slate-300" />
            <p className="mt-4 font-medium text-slate-900 dark:text-white">No certificates yet</p>
            <p className="mt-2 text-sm text-slate-500">Complete a course and pass its quiz to earn a certificate.</p>
            <Link href="/courses" className={cn(buttonVariants(), "mt-6 inline-flex h-10 rounded-full")}>
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {certificates.map((cert) => (
              <Link
                key={cert.id}
                href={`/certificates/${cert.code}`}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-slate-950 dark:hover:border-blue-500/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10">
                    <Award className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{cert.course_title}</p>
                    <p className="mt-1 text-sm text-slate-500">Issued {formatDate(cert.issued_at)}</p>
                    <p className="mt-2 font-mono text-xs text-slate-400">{cert.code}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
