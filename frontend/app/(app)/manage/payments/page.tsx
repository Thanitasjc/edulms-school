"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Search } from "lucide-react";
import { listAdminPayments, type Payment } from "@/features/payments/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function statusVariant(status: string) {
  if (status === "paid") return "default" as const;
  if (status === "failed" || status === "cancelled") return "destructive" as const;
  return "secondary" as const;
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function courseTitles(payment: Payment) {
  const titles = (payment.items ?? []).map((item) => item.title).filter(Boolean);
  if (titles.length === 0) return "—";
  if (titles.length === 1) return titles[0];
  return `${titles[0]} +${titles.length - 1}`;
}

export default function ManagePaymentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [gateway, setGateway] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, status, gateway]);

  const queryKey = useMemo(
    () => ["admin-payments", search, status, gateway, page] as const,
    [search, status, gateway, page],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminPayments({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        gateway: gateway === "all" ? undefined : gateway,
        page,
      });

      return {
        payments: Array.isArray(response.data) ? response.data : [],
        meta: response.meta,
      };
    },
  });

  const payments = data?.payments ?? [];
  const lastPage = Number(data?.meta?.last_page ?? 1);
  const total = Number(data?.meta?.total ?? payments.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review checkout sessions, gateways, and paid course purchases.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, course, uuid..."
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="requires_action">Requires action</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gateway} onValueChange={(value) => setGateway(value ?? "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Gateway" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All gateways</SelectItem>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="demo">Demo</SelectItem>
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
                <TableHead>Payment</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="inline-flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <CreditCard className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium">#{payment.id}</div>
                        <div className="mt-0.5 max-w-[160px] truncate text-xs text-slate-500">
                          {payment.uuid}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{payment.user?.name ?? `User #${payment.user_id ?? "—"}`}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{payment.user?.email ?? "—"}</div>
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <div className="truncate text-sm">{courseTitles(payment)}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {(payment.items?.length ?? 0)} item(s)
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatBaht(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.gateway}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(payment.status)}>{formatStatus(payment.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {payment.paid_at
                      ? new Date(payment.paid_at).toLocaleString()
                      : payment.created_at
                        ? new Date(payment.created_at).toLocaleString()
                        : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-500">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <p>{total} payments</p>
        {lastPage > 1 ? (
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
        ) : null}
      </div>
    </div>
  );
}
