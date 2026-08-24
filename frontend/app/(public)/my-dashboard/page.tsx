"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { listMyCertificates } from "@/features/certificate/api";
import { listMyEnrollments } from "@/features/enrollments/api";
import { learnerSystems } from "@/features/learning/systems";
import { useAuth } from "@/providers/auth-provider";
import { ApiClientError } from "@/lib/api-client";

export default function StudentDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const enrollmentsQuery = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const response = await listMyEnrollments();
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: isAuthenticated,
  });

  const certificatesQuery = useQuery({
    queryKey: ["my-certificates"],
    queryFn: async () => {
      const response = await listMyCertificates();
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: isAuthenticated,
  });

  const enrollments = enrollmentsQuery.data ?? [];
  const certificates = certificatesQuery.data ?? [];
  const avgProgress =
    enrollments.length === 0
      ? 0
      : Math.round(
          enrollments.reduce((sum, item) => sum + (item.progress_percent ?? 0), 0) / enrollments.length,
        );

  const loadError = enrollmentsQuery.error ?? certificatesQuery.error;

  return (
    <>
      <PageBreadcrumb title="Dashboard" items={[{ label: "Dashboard" }]} />
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Student dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.name ? `Welcome back, ${user.name}.` : "Your learning overview."} Courses, quizzes,
            certificates, and progress in one place.
          </p>
        </div>

        {authLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : !isAuthenticated ? (
          <p className="text-sm text-slate-600">
            Please{" "}
            <Link href="/login?next=/my-dashboard" className="text-blue-600 underline">
              sign in
            </Link>{" "}
            to open your student dashboard.
          </p>
        ) : (
          <div className="space-y-10">
            {loadError ? (
              <p className="text-sm text-red-500">
                {loadError instanceof ApiClientError ? loadError.message : "Failed to load dashboard"}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/my-courses"
                className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-6 transition hover:border-blue-200 dark:border-white/10 dark:bg-slate-950 dark:hover:border-blue-500/30"
              >
                <p className="text-sm text-slate-500">Enrolled courses</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{enrollments.length}</p>
              </Link>
              <Link
                href="/my-courses"
                className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-6 transition hover:border-blue-200 dark:border-white/10 dark:bg-slate-950 dark:hover:border-blue-500/30"
              >
                <p className="text-sm text-slate-500">Average progress</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{avgProgress}%</p>
              </Link>
              <Link
                href="/certificates"
                className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-6 transition hover:border-blue-200 dark:border-white/10 dark:bg-slate-950 dark:hover:border-blue-500/30"
              >
                <p className="text-sm text-slate-500">Certificates</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{certificates.length}</p>
              </Link>
            </div>

            <section>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                Learning systems
              </h2>
              <p className="mt-1 text-sm text-slate-500">Tools available in your student workspace.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {learnerSystems
                  .filter((system) => system.key !== "dashboard")
                  .map((system) => {
                  const Icon = system.icon;
                  return (
                    <Link
                      key={system.key}
                      href={system.href}
                      className="rounded-[1.5rem] border border-slate-200 bg-white p-5 transition hover:border-blue-200 dark:border-white/10 dark:bg-slate-950 dark:hover:border-blue-500/30"
                    >
                      <Icon className="size-5 text-blue-600" />
                      <p className="mt-4 font-medium text-slate-900 dark:text-white">{system.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{system.titleTh}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{system.description}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
