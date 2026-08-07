"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteAdminCourseReview,
  listAdminCourseReviews,
  updateAdminCourseReview,
} from "@/features/reviews/api";
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

export default function ManageReviewsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const queryKey = useMemo(() => ["admin-reviews", status] as const, [status]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminCourseReviews({
        status: status === "all" ? undefined : status,
      });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const updateMutation = useMutation({
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
    onSuccess: () => {
      toast.success("Review deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Delete failed");
    },
  });

  const reviews = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-slate-500">Moderate real student course reviews.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:w-56">
        <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
          <SelectTrigger>
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
                  <TableCell className="font-medium">{review.course?.title ?? `#${review.course_id}`}</TableCell>
                  <TableCell>{review.user?.name ?? `User #${review.user_id}`}</TableCell>
                  <TableCell>{review.rating}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="font-medium">{review.title || "—"}</p>
                    <p className="line-clamp-2 text-xs text-slate-500">{review.body}</p>
                  </TableCell>
                  <TableCell>{review.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      {review.status !== "approved" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMutation.mutate({ id: review.id, nextStatus: "approved" })}
                        >
                          Approve
                        </Button>
                      ) : null}
                      {review.status !== "rejected" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMutation.mutate({ id: review.id, nextStatus: "rejected" })}
                        >
                          Reject
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm("Delete this review?")) deleteMutation.mutate(review.id);
                        }}
                      >
                        Delete
                      </Button>
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
  );
}
