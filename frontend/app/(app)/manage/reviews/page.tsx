"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listAdminCourses } from "@/features/courses/api";
import {
  createAdminCourseReview,
  deleteAdminCourseReview,
  listAdminCourseReviews,
  updateAdminCourseReview,
  type CourseReview,
} from "@/features/reviews/api";
import { listAdminUsers } from "@/features/users/api";
import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";

type ReviewFormState = {
  course_id: string;
  user_id: string;
  rating: string;
  title: string;
  body: string;
  status: string;
};

const emptyForm = (): ReviewFormState => ({
  course_id: "",
  user_id: "",
  rating: "5",
  title: "",
  body: "",
  status: "approved",
});

function toFormState(review: CourseReview): ReviewFormState {
  return {
    course_id: String(review.course_id),
    user_id: String(review.user_id),
    rating: String(review.rating),
    title: review.title ?? "",
    body: review.body ?? "",
    status: review.status || "approved",
  };
}

function statusVariant(status: string) {
  if (status === "approved") return "default" as const;
  if (status === "rejected") return "destructive" as const;
  return "secondary" as const;
}

export default function ManageReviewsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<ReviewFormState>(emptyForm);
  const [editing, setEditing] = useState<CourseReview | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const can = (permission: string) =>
    Boolean(user?.is_super_admin || user?.permissions.includes(permission));

  const queryKey = useMemo(
    () => ["admin-reviews", statusFilter, search] as const,
    [statusFilter, search],
  );

  const { data: reviews = [], isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminCourseReviews({
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

  useEffect(() => {
    if (editing) {
      setForm(toFormState(editing));
    }
  }, [editing]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm());
  };

  const setField = <K extends keyof ReviewFormState>(key: K, value: ReviewFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const rating = Number.parseInt(form.rating, 10);
      const payload = {
        rating,
        title: form.title.trim() || undefined,
        body: form.body.trim() || undefined,
        status: form.status,
      };

      if (editing) {
        return updateAdminCourseReview(editing.id, payload);
      }

      return createAdminCourseReview({
        course_id: Number(form.course_id),
        user_id: Number(form.user_id),
        ...payload,
      });
    },
    onSuccess: () => {
      toast.success(editing ? "Review updated" : "Review created");
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Save failed");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: string }) =>
      updateAdminCourseReview(id, { status: nextStatus }),
    onSuccess: () => {
      toast.success("Review updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Update failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminCourseReview(id),
    onSuccess: (_, id) => {
      toast.success("Review deleted");
      if (editing?.id === id) {
        resetForm();
      }
      void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Delete failed");
    },
  });

  const canSave = editing
    ? can("course.update")
    : can("course.update") && Boolean(form.course_id) && Boolean(form.user_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, edit, approve, reject, and delete course reviews.
          </p>
        </div>
        {editing ? (
          <Button variant="outline" onClick={resetForm}>
            <Plus className="size-4" />
            New review
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{editing ? "Edit review" : "New review"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {editing
                ? `Editing #${editing.id}`
                : "Add a moderated review for a course and student."}
            </p>
          </div>

          {can("course.update") ? (
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
                  <p className="font-medium">{editing.course?.title ?? `Course #${editing.course_id}`}</p>
                  <p className="mt-1 text-slate-500">
                    {editing.user?.name ?? `User #${editing.user_id}`}
                  </p>
                </div>
              )}

              <Field label="Rating">
                <Select
                  value={form.rating}
                  onValueChange={(value) => setField("rating", value ?? "5")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((value) => (
                      <SelectItem key={value} value={String(value)}>
                        {value} stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Title">
                <Input
                  placeholder="Great course"
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                />
              </Field>

              <Field label="Body">
                <Textarea
                  rows={5}
                  placeholder="Write the review..."
                  value={form.body}
                  onChange={(event) => setField("body", event.target.value)}
                />
              </Field>

              <Field label="Status">
                <Select
                  value={form.status}
                  onValueChange={(value) => setField("status", value ?? "approved")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="flex gap-2">
                <Button type="submit" disabled={saveMutation.isPending || !canSave}>
                  {saveMutation.isPending
                    ? "Saving..."
                    : editing
                      ? "Update review"
                      : "Create review"}
                </Button>
                {editing ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate-500">You do not have permission to manage reviews.</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title or body..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">
                        {review.course?.title ?? `#${review.course_id}`}
                      </TableCell>
                      <TableCell>{review.user?.name ?? `User #${review.user_id}`}</TableCell>
                      <TableCell>{review.rating}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="font-medium">{review.title || "—"}</p>
                        <p className="line-clamp-2 text-xs text-slate-500">{review.body}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(review.status)}>{review.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          {can("course.update") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditing(review)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          ) : null}
                          {can("course.update") && review.status !== "approved" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                statusMutation.mutate({ id: review.id, nextStatus: "approved" })
                              }
                            >
                              Approve
                            </Button>
                          ) : null}
                          {can("course.update") && review.status !== "rejected" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                statusMutation.mutate({ id: review.id, nextStatus: "rejected" })
                              }
                            >
                              Reject
                            </Button>
                          ) : null}
                          {can("course.delete") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm("Delete this review?")) {
                                  deleteMutation.mutate(review.id);
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
                  {reviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                        No reviews found.
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
