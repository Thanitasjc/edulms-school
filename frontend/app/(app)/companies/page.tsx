"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAdminCompany, listAdminCompanies, restoreAdminCompany } from "@/features/companies/api";
import { formatCompanyStatus, type AdminCompany } from "@/features/companies/schemas";
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

export default function CompaniesPage() {
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
    () => ["admin-companies", search, status, trashed, page] as const,
    [search, status, trashed, page],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminCompanies({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        trashed: trashed === "without" ? undefined : trashed,
        page,
      });
      return {
        companies: response.data,
        meta: response.meta,
      };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminCompany(id),
    onSuccess: () => {
      toast.success("Company deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Delete failed");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreAdminCompany(id),
    onSuccess: () => {
      toast.success("Company restored");
      void queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Restore failed");
    },
  });

  const companies = data?.companies ?? [];
  const lastPage = Number(data?.meta?.last_page ?? 1);
  const total = Number(data?.meta?.total ?? companies.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage school tenants, contact info, locale, and soft-deleted companies.
          </p>
        </div>
        {can("company.create") ? (
          <Link href="/companies/new" className={cn(buttonVariants())}>
            <Plus className="size-4" />
            New Company
          </Link>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company, slug, email, or domain..."
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
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company: AdminCompany) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="inline-flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <Building2 className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{company.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{company.email || "—"}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {company.domain || company.phone || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{company.locale || "—"}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{company.timezone || "—"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge variant={statusVariant(company.status)}>
                        {formatCompanyStatus(company.status)}
                      </Badge>
                      {company.deleted_at ? <Badge variant="outline">Trashed</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      {company.deleted_at ? (
                        can("company.restore") ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreMutation.mutate(company.id)}
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        ) : null
                      ) : (
                        <>
                          {can("company.update") ? (
                            <Link
                              href={`/companies/${company.id}/edit`}
                              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                            >
                              Edit
                            </Link>
                          ) : null}
                          {can("company.delete") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm(`Delete ${company.name}?`)) {
                                  deleteMutation.mutate(company.id);
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
              ))}
              {companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                    No companies found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </div>

      {lastPage > 1 ? (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <p>{total} companies</p>
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
