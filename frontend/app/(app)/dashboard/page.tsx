"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAdminCourses } from "@/features/courses/api";
import { listAdminEnrollments } from "@/features/enrollments/api";
import { listAdminCourseReviews } from "@/features/reviews/api";
import { listAdminCertificates } from "@/features/certificate/api";
import { listAdminLeads } from "@/features/crm/api";
import { ApiClientError } from "@/lib/api-client";

function totalFromMeta(meta?: Record<string, unknown>): number | null {
  if (!meta || typeof meta.total !== "number") return null;
  return meta.total;
}

export default function DashboardPage() {
  const { user, enabledModules } = useAuth();

  const can = (permission?: string) =>
    !permission || Boolean(user?.is_super_admin || user?.permissions.includes(permission));

  const coursesQuery = useQuery({
    queryKey: ["dashboard-courses"],
    queryFn: async () => listAdminCourses({ page: 1 }),
    enabled: can("course.view") && enabledModules.includes("course"),
  });

  const enrollmentsQuery = useQuery({
    queryKey: ["dashboard-enrollments"],
    queryFn: async () => listAdminEnrollments({ page: 1 }),
    enabled: can("enrollment.view") && enabledModules.includes("enrollment"),
  });

  const reviewsQuery = useQuery({
    queryKey: ["dashboard-reviews"],
    queryFn: async () => listAdminCourseReviews({ page: 1 }),
    enabled: can("course.view") && enabledModules.includes("course"),
  });

  const certificatesQuery = useQuery({
    queryKey: ["dashboard-certificates"],
    queryFn: async () => listAdminCertificates({ page: 1 }),
    enabled: can("certificate.view") && enabledModules.includes("certificate"),
  });

  const leadsQuery = useQuery({
    queryKey: ["dashboard-leads"],
    queryFn: async () => listAdminLeads({ page: 1 }),
    enabled: can("crm.view") && enabledModules.includes("crm"),
  });

  const cards = [
    {
      label: "Courses",
      value:
        totalFromMeta(coursesQuery.data?.meta) ??
        (Array.isArray(coursesQuery.data?.data) ? coursesQuery.data.data.length : "—"),
      href: "/manage/courses",
      show: can("course.view") && enabledModules.includes("course"),
    },
    {
      label: "Enrollments",
      value:
        totalFromMeta(enrollmentsQuery.data?.meta) ??
        (Array.isArray(enrollmentsQuery.data?.data) ? enrollmentsQuery.data.data.length : "—"),
      href: "/manage/enrollments",
      show: can("enrollment.view") && enabledModules.includes("enrollment"),
    },
    {
      label: "Reviews",
      value:
        totalFromMeta(reviewsQuery.data?.meta) ??
        (Array.isArray(reviewsQuery.data?.data) ? reviewsQuery.data.data.length : "—"),
      href: "/manage/reviews",
      show: can("course.view") && enabledModules.includes("course"),
    },
    {
      label: "Certificates",
      value:
        totalFromMeta(certificatesQuery.data?.meta) ??
        (Array.isArray(certificatesQuery.data?.data) ? certificatesQuery.data.data.length : "—"),
      href: "/manage/certificates",
      show: can("certificate.view") && enabledModules.includes("certificate"),
    },
    {
      label: "Leads",
      value:
        totalFromMeta(leadsQuery.data?.meta) ??
        (Array.isArray(leadsQuery.data?.data) ? leadsQuery.data.data.length : "—"),
      href: "/manage/leads",
      show: can("crm.view") && enabledModules.includes("crm"),
    },
    {
      label: "Enabled Modules",
      value: enabledModules.length,
      href: "/dashboard",
      show: true,
    },
  ].filter((card) => card.show);

  const loadError =
    [coursesQuery, enrollmentsQuery, reviewsQuery, certificatesQuery, leadsQuery].find((q) => q.isError)
      ?.error ?? null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {user?.name}. Overview of enrollments, reviews, and academy activity.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
        >
          View public site
        </Link>
      </div>

      {loadError ? (
        <p className="text-sm text-red-500">
          {loadError instanceof ApiClientError ? loadError.message : "Failed to load some stats"}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition hover:border-slate-300 dark:hover:border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{card.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {can("course.view") && enabledModules.includes("course") ? (
            <Link
              href="/manage/courses"
              className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/80"
            >
              Courses
            </Link>
          ) : null}
          {can("enrollment.view") && enabledModules.includes("enrollment") ? (
            <Link
              href="/manage/enrollments"
              className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
            >
              Enrollments
            </Link>
          ) : null}
          {can("quiz.view") && enabledModules.includes("quiz") ? (
            <Link
              href="/manage/quizzes"
              className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
            >
              Quizzes
            </Link>
          ) : null}
          {can("crm.view") && enabledModules.includes("crm") ? (
            <Link
              href="/manage/leads"
              className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
            >
              Leads
            </Link>
          ) : null}
          <Link
            href="/users"
            className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
          >
            Users
          </Link>
          <Link
            href="/settings"
            className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
          >
            Settings
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
