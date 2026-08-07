"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminCertificates } from "@/features/certificate/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiClientError } from "@/lib/api-client";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ManageCertificatesPage() {
  const { data: certificates = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: async () => {
      const response = await listAdminCertificates();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Certificates</h1>
        <p className="mt-1 text-sm text-slate-500">View issued course completion certificates.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-red-500">
            {error instanceof ApiClientError ? error.message : "Failed to load"}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Learner</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Issued</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-mono text-sm">{cert.code}</TableCell>
                  <TableCell>{cert.learner_name || cert.user?.name || "—"}</TableCell>
                  <TableCell>{cert.course_title || cert.course?.title || "—"}</TableCell>
                  <TableCell>{formatDate(cert.issued_at)}</TableCell>
                </TableRow>
              ))}
              {certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                    No certificates issued yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
