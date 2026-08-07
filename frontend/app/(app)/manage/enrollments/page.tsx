"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cancelEnrollment, listAdminEnrollments } from "@/features/enrollments/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiClientError } from "@/lib/api-client";
import { formatBaht } from "@/lib/money";

export default function ManageEnrollmentsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");

  const queryKey = useMemo(() => ["admin-enrollments", status] as const, [status]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminEnrollments({
        status: status === "all" ? undefined : status,
      });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelEnrollment(id),
    onSuccess: () => {
      toast.success("Enrollment cancelled");
      void queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Cancel failed");
    },
  });

  const enrollments = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Enrollments</h1>
        <p className="mt-1 text-sm text-slate-500">Purchases and course enrollments.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:w-56">
        <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
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
                <TableHead>Course</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.course?.title ?? `#${item.course_id}`}</TableCell>
                  <TableCell>
                    <div>
                      <p>{item.user?.name ?? `User #${item.user_id}`}</p>
                      <p className="text-xs text-slate-500">{item.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatBaht(item.amount_paid)}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>
                    {item.enrolled_at ? new Date(item.enrolled_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm("Cancel this enrollment?")) {
                            cancelMutation.mutate(item.id);
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {enrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    No enrollments found.
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
