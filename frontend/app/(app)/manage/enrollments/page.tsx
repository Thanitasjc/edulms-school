"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listAdminCourses } from "@/features/courses/api";
import {
  cancelEnrollment,
  createAdminEnrollment,
  deleteAdminEnrollment,
  listAdminEnrollments,
  updateAdminEnrollment,
  type Enrollment,
} from "@/features/enrollments/api";
import { listAdminUsers } from "@/features/users/api";
import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";

type EnrollmentFormState = {
  course_id: string;
  user_id: string;
  status: string;
  amount_paid: string;
  currency: string;
  source: string;
};

const emptyForm = (): EnrollmentFormState => ({
  course_id: "",
  user_id: "",
  status: "active",
  amount_paid: "0",
  currency: "THB",
  source: "admin",
});

function toFormState(item: Enrollment): EnrollmentFormState {
  return {
    course_id: String(item.course_id),
    user_id: String(item.user_id),
    status: item.status || "active",
    amount_paid: String(item.amount_paid ?? 0),
    currency: item.currency || "THB",
    source: item.source || "admin",
  };
}

function statusVariant(status: string) {
  if (status === "active") return "default" as const;
  if (status === "cancelled") return "destructive" as const;
  return "secondary" as const;
}

export default function ManageEnrollmentsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<EnrollmentFormState>(emptyForm);
  const [editing, setEditing] = useState<Enrollment | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const can = (permission: string) =>
    Boolean(user?.is_super_admin || user?.permissions.includes(permission));

  const queryKey = useMemo(
    () => ["admin-enrollments", statusFilter, search] as const,
    [statusFilter, search],
  );

  const { data: enrollments = [], isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminEnrollments({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses-options"],
    queryFn: async () => {
      const response = await listAdminCourses({ page: 1 });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users-options"],
    queryFn: async () => {
      const response = await listAdminUsers({ page: 1 });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm());
  };

  const setField = <K extends keyof EnrollmentFormState>(key: K, value: EnrollmentFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const startEdit = (item: Enrollment) => {
    setEditing(item);
    setForm(toFormState(item));
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const amount = Number.parseFloat(form.amount_paid);
      const payload = {
        status: form.status,
        amount_paid: Number.isNaN(amount) ? 0 : amount,
        currency: form.currency.trim() || "THB",
        source: form.source.trim() || "admin",
      };

      if (editing) {
        return updateAdminEnrollment(editing.id, payload);
      }

      return createAdminEnrollment({
        course_id: Number(form.course_id),
        user_id: Number(form.user_id),
        ...payload,
      });
    },
    onSuccess: () => {
      toast.success(editing ? "Enrollment updated" : "Enrollment created");
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Save failed");
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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminEnrollment(id),
    onSuccess: (_, id) => {
      toast.success("Enrollment deleted");
      if (editing?.id === id) {
        resetForm();
      }
      void queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Delete failed");
    },
  });

  const canSave = editing
    ? can("enrollment.update")
    : can("enrollment.create") && Boolean(form.course_id) && Boolean(form.user_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Enrollments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, edit, cancel, and delete course enrollments.
          </p>
        </div>
        {editing ? (
          <Button variant="outline" onClick={resetForm}>
            <Plus className="size-4" />
            New enrollment
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              {editing ? "Edit enrollment" : "New enrollment"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editing
                ? `Editing #${editing.id}`
                : "Manually enroll a student in a course."}
            </p>
          </div>

          {(editing ? can("enrollment.update") : can("enrollment.create")) ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!canSave) return;
                saveMutation.mutate();
              }}
            >
              {!editing ? (
                <>
                  <Field label="Course">
                    <Select
                      value={form.course_id || undefined}
                      onValueChange={(value) => setField("course_id", value ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={String(course.id)}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Student">
                    <Select
                      value={form.user_id || undefined}
                      onValueChange={(value) => setField("user_id", value ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name} ({item.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              ) : (
                <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-white/10">
                  <p className="font-medium">
                    {editing.course?.title ?? `Course #${editing.course_id}`}
                  </p>
                  <p className="mt-1 text-slate-500">
                    {editing.user?.name ?? `User #${editing.user_id}`}
                    {editing.user?.email ? ` · ${editing.user.email}` : ""}
                  </p>
                </div>
              )}

              <Field label="Status">
                <Select
                  value={form.status}
                  onValueChange={(value) => setField("status", value ?? "active")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Amount paid">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.amount_paid}
                    onChange={(event) => setField("amount_paid", event.target.value)}
                  />
                </Field>
                <Field label="Currency">
                  <Input
                    value={form.currency}
                    onChange={(event) => setField("currency", event.target.value)}
                  />
                </Field>
              </div>

              <Field label="Source">
                <Select
                  value={form.source}
                  onValueChange={(value) => setField("source", value ?? "admin")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="flex gap-2">
                <Button type="submit" disabled={saveMutation.isPending || !canSave}>
                  {saveMutation.isPending
                    ? "Saving..."
                    : editing
                      ? "Update enrollment"
                      : "Create enrollment"}
                </Button>
                {editing ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate-500">
              You do not have permission to manage enrollments.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student or course..."
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value ?? "all")}
            >
              <SelectTrigger className="w-full sm:w-40">
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
                      <TableCell className="font-medium">
                        {item.course?.title ?? `#${item.course_id}`}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{item.user?.name ?? `User #${item.user_id}`}</p>
                          <p className="text-xs text-slate-500">{item.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatBaht(item.amount_paid)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.enrolled_at
                          ? new Date(item.enrolled_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          {can("enrollment.update") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(item)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          ) : null}
                          {can("enrollment.update") && item.status === "active" ? (
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
                          ) : null}
                          {can("enrollment.delete") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm("Delete this enrollment?")) {
                                  deleteMutation.mutate(item.id);
                                }
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : null}
                        </div>
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
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
