"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAdminCourse, listAdminCourses, restoreAdminCourse } from "@/features/courses/api";
import type { AdminCourse } from "@/features/courses/schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function ManageCoursesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [trashed, setTrashed] = useState("without");

  const queryKey = useMemo(
    () => ["admin-courses", search, status, trashed] as const,
    [search, status, trashed],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminCourses({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        trashed: trashed === "without" ? undefined : trashed,
      });
      return {
        courses: Array.isArray(response.data) ? response.data : [],
        meta: response.meta,
      };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminCourse(id),
    onSuccess: () => {
      toast.success("Course deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Delete failed");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreAdminCourse(id),
    onSuccess: () => {
      toast.success("Course restored");
      void queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Restore failed");
    },
  });

  const courses = data?.courses ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
          <p className="mt-1 text-sm text-slate-500">Create, edit, publish, and restore courses.</p>
        </div>
        <Link href="/manage/courses/new" className={cn(buttonVariants())}>
          <Plus className="size-4" />
          New Course
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses..."
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={trashed} onValueChange={(value) => setTrashed(value ?? "without")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Trash" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="without">Active</SelectItem>
            <SelectItem value="only">Trash only</SelectItem>
            <SelectItem value="with">Include trash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        {isLoading ? (
          <div className="p-8 text-sm text-slate-500">Loading courses...</div>
        ) : isError ? (
          <div className="p-8 text-sm text-red-600">
            {error instanceof ApiClientError ? error.message : "Failed to load courses"}
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-sm text-slate-500">No courses found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course: AdminCourse) => {
                const isDeleted = Boolean(course.deleted_at);
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-xs text-slate-500">{course.slug}</div>
                    </TableCell>
                    <TableCell>{course.category ?? "—"}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize dark:bg-white/10">
                        {course.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatBaht(course.price)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!isDeleted ? (
                          <>
                            <Link
                              href={`/manage/courses/${course.id}/edit`}
                              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                            >
                              Edit
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (window.confirm(`Delete "${course.title}"?`)) {
                                  deleteMutation.mutate(course.id);
                                }
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreMutation.mutate(course.id)}
                          >
                            <RotateCcw className="size-4" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
