"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAdminUser, listAdminUsers, restoreAdminUser } from "@/features/users/api";
import { formatRoleName, type AdminUser } from "@/features/users/schemas";
import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
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

function statusVariant(status: string) {
  if (status === "suspended") return "destructive" as const;
  if (status === "inactive") return "secondary" as const;
  return "default" as const;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [trashed, setTrashed] = useState("without");
  const [page, setPage] = useState(1);

  const can = (permission: string) =>
    Boolean(currentUser?.is_super_admin || currentUser?.permissions.includes(permission));

  useEffect(() => {
    setPage(1);
  }, [search, status, trashed]);

  const queryKey = useMemo(
    () => ["admin-users", search, status, trashed, page] as const,
    [search, status, trashed, page],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminUsers({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        trashed: trashed === "without" ? undefined : trashed,
        page,
      });
      return {
        users: response.data,
        meta: response.meta,
      };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminUser(id),
    onSuccess: () => {
      toast.success("User deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Delete failed");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreAdminUser(id),
    onSuccess: () => {
      toast.success("User restored");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Restore failed");
    },
  });

  const users = data?.users ?? [];
  const lastPage = Number(data?.meta?.last_page ?? 1);
  const total = Number(data?.meta?.total ?? users.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage accounts, roles, and access for this school.
          </p>
        </div>
        {can("user.create") ? (
          <Link href="/users/new" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            New User
          </Link>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, or phone..."
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
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
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((account: AdminUser) => {
                const isSelf = currentUser?.id === account.id;
                const visibleRoles = account.roles.filter(
                  (role) => !(account.is_super_admin && role === "super_admin"),
                );
                return (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="font-medium">{account.name}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {account.phone || "—"}
                      </div>
                    </TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {account.is_super_admin ? (
                          <Badge variant="outline">Super Admin</Badge>
                        ) : null}
                        {visibleRoles.length > 0 ? (
                          visibleRoles.map((role) => (
                            <Badge key={role} variant="secondary">
                              {formatRoleName(role)}
                            </Badge>
                          ))
                        ) : account.is_super_admin ? null : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge variant={statusVariant(account.status)}>{account.status}</Badge>
                        {account.deleted_at ? (
                          <Badge variant="outline">Trashed</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        {account.deleted_at ? (
                          can("user.restore") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => restoreMutation.mutate(account.id)}
                            >
                              <RotateCcw className="size-4" />
                            </Button>
                          ) : null
                        ) : (
                          <>
                            {can("user.update") ? (
                              <Link
                                href={`/users/${account.id}/edit`}
                                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                              >
                                Edit
                              </Link>
                            ) : null}
                            {can("user.delete") && !isSelf ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm(`Delete ${account.name}?`)) {
                                    deleteMutation.mutate(account.id);
                                  }
                                }}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </div>

      {lastPage > 1 ? (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <p>{total} users</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= lastPage}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
