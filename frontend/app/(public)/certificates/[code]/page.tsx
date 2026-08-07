"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { getPublicCertificate } from "@/features/certificate/api";
import { ApiClientError } from "@/lib/api-client";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function PublicCertificatePage() {
  const params = useParams<{ code: string }>();
  const code = params.code;

  const { data: cert, isLoading, isError, error } = useQuery({
    queryKey: ["public-certificate", code],
    queryFn: async () => {
      const response = await getPublicCertificate(code);
      return response.data;
    },
    enabled: Boolean(code),
  });

  if (isLoading) {
    return (
      <>
        <PageBreadcrumb title="Certificate" items={[{ label: "Certificates", href: "/certificates" }, { label: "Loading..." }]} />
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">Loading certificate...</p>
        </div>
      </>
    );
  }

  if (isError || !cert) {
    return (
      <>
        <PageBreadcrumb title="Certificate" items={[{ label: "Certificates", href: "/certificates" }, { label: "Not found" }]} />
        <div className="mx-auto w-full max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Certificate not found</p>
          <p className="mt-2 text-sm text-red-500">
            {error instanceof ApiClientError ? error.message : "Invalid or expired certificate code."}
          </p>
          <Link href="/certificates" className="mt-6 inline-flex text-sm font-medium text-blue-600 hover:underline">
            Back to certificates
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadcrumb
        title="Certificate"
        items={[{ label: "Certificates", href: "/certificates" }, { label: cert.course_title }]}
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8 print:py-8">
        <div className="overflow-hidden rounded-[1.75rem] border-2 border-amber-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] print:border-amber-300 print:shadow-none dark:border-amber-500/20 dark:bg-slate-950">
          <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-sky-50 px-8 py-10 text-center dark:border-amber-500/10 dark:from-amber-500/5 dark:via-slate-950 dark:to-sky-500/5">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              <Award className="size-8" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
              Certificate of Completion
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {cert.learner_name}
            </h1>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">has successfully completed</p>
            <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{cert.course_title}</p>
          </div>

          <div className="grid gap-6 px-8 py-8 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Certificate code</p>
              <p className="mt-1 font-mono text-sm font-medium text-slate-900 dark:text-white">{cert.code}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Issued on</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{formatDate(cert.issued_at)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4 print:hidden">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            onClick={() => window.print()}
          >
            Print certificate
          </button>
          <Link href="/certificates" className="rounded-full px-5 py-2 text-sm font-medium text-blue-600 hover:underline">
            My certificates
          </Link>
        </div>
      </div>
    </>
  );
}
