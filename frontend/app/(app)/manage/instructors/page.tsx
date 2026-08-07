"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteAdminInstructor,
  listAdminInstructors,
  restoreAdminInstructor,
} from "@/features/instructors/api";
import type { AdminInstructor } from "@/features/instructors/schemas";
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
import { cn } from "@/lib/utils";

export default function ManageInstructorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [trashed, setTrashed] = useState("without");

  const queryKey = useMemo(
    () => ["admin-instructors", search, status, trashed] as const,
    [search, status, trashed],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminInstructors({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        trashed: trashed === "without" ? undefined : trashed,
      });
      return {
        instructors: Array.isArray(response.data) ? response.data : [],
      };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminInstructor(id),
    onSuccess: () => {
      toast.success("Instructor deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Delete failed");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreAdminInstructor(id),
    onSuccess: () => {
      toast.success("Instructor restored");
      void queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Restore failed");
    },
  });

  const instructors = data?.instructors ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Instructors</h1>
          <p className="mt-1 text-sm text-slate-500">CRUD for teacher profiles shown on the public site.</p>
        </div>
        <Link href="/manage/instructors/new" className={cn(buttonVariants())}>
          <Plus className="size-4" />
          New Instructor
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search instructors..."
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
            <SelectItem value="only">Trashed</SelectItem>
            <SelectItem value="with">All</SelectItem>
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
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((instructor: AdminInstructor) => (
                <TableRow key={instructor.id}>
                  <TableCell className="font-medium">{instructor.name}</TableCell>
                  <TableCell>{instructor.role || "—"}</TableCell>
                  <TableCell>{instructor.status}</TableCell>
                  <TableCell>{instructor.rating.toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      {instructor.deleted_at ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restoreMutation.mutate(instructor.id)}
                        >
                          <RotateCcw className="size-4" />
                        </Button>
                      ) : (
                        <>
                          <Link
                            href={`/manage/instructors/${instructor.id}/edit`}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                          >
                            Edit
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Delete ${instructor.name}?`)) {
                                deleteMutation.mutate(instructor.id);
                              }
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {instructors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                    No instructors found.
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
