"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAdminUser, listAdminCompanies, listAdminRoles, updateAdminUser } from "./api";
import {
  createUserFormSchema,
  formatRoleName,
  type AdminUser,
  type UserFormInput,
} from "./schemas";
import { getStoredCompanyId } from "@/features/auth/api";
import { useAuth } from "@/providers/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const FALLBACK_ROLES = ["student", "instructor", "company_admin", "super_admin"];

function defaultCompanyIds(user?: AdminUser | null) {
  if (user?.companies?.length) {
    return user.companies.map((company) => company.id);
  }

  if (user?.current_company_id) {
    return [user.current_company_id];
  }

  const stored = Number(getStoredCompanyId() ?? 0);
  return stored ? [stored] : [];
}

function toFormValues(user?: AdminUser | null): UserFormInput {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    password: "",
    password_confirmation: "",
    status: (user?.status as UserFormInput["status"]) || "active",
    roles: user?.roles?.length ? user.roles : ["student"],
    company_ids: defaultCompanyIds(user),
  };
}

export function UserForm({ user }: { user?: AdminUser | null }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isEdit = Boolean(user?.id);
  const isSuperAdmin = Boolean(currentUser?.is_super_admin);

  const schema = useMemo(() => createUserFormSchema(isEdit), [isEdit]);
  const form = useForm<UserFormInput>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(user),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      try {
        return await listAdminRoles();
      } catch {
        return FALLBACK_ROLES.map((name, index) => ({ id: index + 1, name }));
      }
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: async () => {
      try {
        return await listAdminCompanies();
      } catch {
        return [];
      }
    },
  });

  const roleOptions = roles.filter((role) => isSuperAdmin || role.name !== "super_admin");
  const selectedRoles = form.watch("roles");
  const selectedCompanies = form.watch("company_ids");

  const mutation = useMutation({
    mutationFn: (values: UserFormInput) =>
      isEdit && user ? updateAdminUser(user.id, values) : createAdminUser(values),
    onSuccess: () => {
      toast.success(isEdit ? "User updated" : "User created");
      router.push("/users");
    },
    onError: (err) => {
      if (err instanceof ApiClientError && err.errors) {
        for (const [field, messages] of Object.entries(err.errors)) {
          form.setError(field as keyof UserFormInput, { message: messages[0] });
        }
      }
      toast.error(err instanceof ApiClientError ? err.message : "Save failed");
    },
  });

  function toggleRole(name: string, checked: boolean) {
    const next = checked
      ? Array.from(new Set([...selectedRoles, name]))
      : selectedRoles.filter((role) => role !== name);
    form.setValue("roles", next, { shouldDirty: true });
  }

  function toggleCompany(id: number, checked: boolean) {
    const next = checked
      ? Array.from(new Set([...selectedCompanies, id]))
      : selectedCompanies.filter((companyId) => companyId !== id);
    form.setValue("company_ids", next, { shouldDirty: true });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? "Edit User" : "New User"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit ? "Update account details, role, and status." : "Create an account and assign a role."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/users" className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900 lg:grid-cols-2">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} />
        </Field>
        <Field label="Status" error={form.formState.errors.status?.message}>
          <Select
            value={form.watch("status")}
            onValueChange={(value) =>
              form.setValue("status", (value as UserFormInput["status"]) ?? "active")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field
          label={isEdit ? "New password (optional)" : "Password"}
          error={form.formState.errors.password?.message}
        >
          <Input type="password" autoComplete="new-password" {...form.register("password")} />
        </Field>
        <Field
          label={isEdit ? "Confirm new password" : "Confirm password"}
          error={form.formState.errors.password_confirmation?.message}
        >
          <Input
            type="password"
            autoComplete="new-password"
            {...form.register("password_confirmation")}
          />
        </Field>
        <Field label="Roles" className="lg:col-span-2" error={form.formState.errors.roles?.message}>
          <div className="flex flex-wrap gap-3">
            {roleOptions.map((role) => (
              <label key={role.name} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border border-input"
                  checked={selectedRoles.includes(role.name)}
                  onChange={(event) => toggleRole(role.name, event.target.checked)}
                />
                {formatRoleName(role.name)}
              </label>
            ))}
          </div>
        </Field>
        {companies.length > 1 ? (
          <Field
            label="Companies"
            className="lg:col-span-2"
            error={form.formState.errors.company_ids?.message}
          >
            <div className="flex flex-wrap gap-3">
              {companies.map((company) => (
                <label key={company.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border border-input"
                    checked={selectedCompanies.includes(company.id)}
                    onChange={(event) => toggleCompany(company.id, event.target.checked)}
                  />
                  {company.name}
                </label>
              ))}
            </div>
          </Field>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
