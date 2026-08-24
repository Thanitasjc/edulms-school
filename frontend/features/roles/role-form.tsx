"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAdminRole, listPermissions, updateAdminRole } from "./api";
import {
  formatPermissionName,
  formatRoleName,
  groupPermissions,
  isSystemRole,
  roleFormSchema,
  type AdminRole,
  type RoleFormInput,
} from "./schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

function slugifyRoleName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replaceAll(/^_+|_+$/g, "");
}

export function RoleForm({ role }: { role?: AdminRole | null }) {
  const router = useRouter();
  const isEdit = Boolean(role?.id);
  const lockedName = isEdit && role ? isSystemRole(role.name) : false;

  const form = useForm<RoleFormInput>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name ?? "",
      permissions: role?.permissions ?? [],
    },
  });

  const { data: catalog = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: listPermissions,
  });

  const selected = form.watch("permissions");
  const groups = groupPermissions(catalog);

  const mutation = useMutation({
    mutationFn: (values: RoleFormInput) =>
      isEdit && role ? updateAdminRole(role.id, values) : createAdminRole(values),
    onSuccess: () => {
      toast.success(isEdit ? "Role updated" : "Role created");
      router.push("/roles");
    },
    onError: (err) => {
      if (err instanceof ApiClientError && err.errors) {
        for (const [field, messages] of Object.entries(err.errors)) {
          form.setError(field as keyof RoleFormInput, { message: messages[0] });
        }
      }
      toast.error(err instanceof ApiClientError ? err.message : "Save failed");
    },
  });

  function togglePermission(name: string, checked: boolean) {
    const next = checked
      ? Array.from(new Set([...selected, name]))
      : selected.filter((permission) => permission !== name);
    form.setValue("permissions", next, { shouldDirty: true });
  }

  function toggleGroup(permissions: string[], checked: boolean) {
    const next = checked
      ? Array.from(new Set([...selected, ...permissions]))
      : selected.filter((permission) => !permissions.includes(permission));
    form.setValue("permissions", next, { shouldDirty: true });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? `Edit ${formatRoleName(role?.name ?? "role")}` : "New Role"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Assign permissions this role can use in the admin workspace.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/roles" className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
        <div className="space-y-2 max-w-md">
          <Label htmlFor="name">Role key</Label>
          <Input
            id="name"
            disabled={lockedName}
            placeholder="content_editor"
            {...form.register("name", {
              onBlur: (event) => {
                if (lockedName) return;
                form.setValue("name", slugifyRoleName(event.target.value), { shouldValidate: true });
              },
            })}
          />
          {lockedName ? (
            <p className="text-xs text-slate-500">System role names cannot be changed.</p>
          ) : (
            <p className="text-xs text-slate-500">Lowercase, numbers, and underscores only.</p>
          )}
          {form.formState.errors.name ? (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label>Permissions</Label>
            {catalog.length > 0 ? (
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline"
                onClick={() =>
                  form.setValue(
                    "permissions",
                    selected.length === catalog.length ? [] : catalog,
                    { shouldDirty: true },
                  )
                }
              >
                {selected.length === catalog.length ? "Clear all" : "Select all"}
              </button>
            ) : null}
          </div>
          {loadingPermissions ? (
            <p className="text-sm text-slate-500">Loading permissions...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {groups.map((group) => {
                const allChecked = group.permissions.every((permission) => selected.includes(permission));
                return (
                  <div
                    key={group.module}
                    className="rounded-xl border border-slate-200 p-4 dark:border-white/10"
                  >
                    <label className="mb-3 flex items-center gap-2 text-sm font-medium capitalize">
                      <input
                        type="checkbox"
                        className="size-4 rounded border border-input"
                        checked={allChecked}
                        onChange={(event) => toggleGroup(group.permissions, event.target.checked)}
                      />
                      {group.label}
                    </label>
                    <div className="space-y-2">
                      {group.permissions.map((permission) => (
                        <label key={permission} className="flex items-center gap-2 text-sm capitalize">
                          <input
                            type="checkbox"
                            className="size-4 rounded border border-input"
                            checked={selected.includes(permission)}
                            onChange={(event) => togglePermission(permission, event.target.checked)}
                          />
                          {formatPermissionName(permission)}
                          <span className="text-xs text-slate-400">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
