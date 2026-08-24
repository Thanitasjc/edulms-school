"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createAdminSetting,
  deleteAdminSetting,
  listAdminSettings,
  restoreAdminSetting,
  updateAdminSetting,
} from "./api";
import {
  formatSettingValue,
  settingFormSchema,
  settingTypes,
  stringifySettingValue,
  type AdminSetting,
  type SettingFormInput,
} from "./schemas";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

function toFormValues(setting?: AdminSetting | null): SettingFormInput {
  return {
    group: setting?.group ?? "general",
    key: setting?.key ?? "",
    type: (setting?.type as SettingFormInput["type"]) || "string",
    value_text: stringifySettingValue(setting?.value, setting?.type),
    is_public: Boolean(setting?.is_public),
  };
}

function formatTypeLabel(type: string) {
  return type === "json" ? "JSON" : type.charAt(0).toUpperCase() + type.slice(1);
}

export function SettingsManager() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [isPublic, setIsPublic] = useState("all");
  const [trashed, setTrashed] = useState("without");
  const [page, setPage] = useState(1);
  const [editingSetting, setEditingSetting] = useState<AdminSetting | null>(null);

  const can = (permission: string) =>
    Boolean(currentUser?.is_super_admin || currentUser?.permissions.includes(permission));

  const form = useForm<SettingFormInput>({
    resolver: zodResolver(settingFormSchema),
    defaultValues: toFormValues(),
  });

  const selectedType = form.watch("type");
  const isEdit = Boolean(editingSetting?.id);

  useEffect(() => {
    setPage(1);
  }, [search, type, isPublic, trashed]);

  useEffect(() => {
    form.reset(toFormValues(editingSetting));
  }, [editingSetting, form]);

  const queryKey = useMemo(
    () => ["admin-settings", search, type, isPublic, trashed, page] as const,
    [search, type, isPublic, trashed, page],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminSettings({
        search: search.trim() || undefined,
        type: type === "all" ? undefined : type,
        isPublic: isPublic === "all" ? undefined : isPublic,
        trashed: trashed === "without" ? undefined : trashed,
        page,
      });

      return {
        settings: response.data,
        meta: response.meta,
      };
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: SettingFormInput) =>
      isEdit && editingSetting
        ? updateAdminSetting(editingSetting.id, values)
        : createAdminSetting(values),
    onSuccess: () => {
      toast.success(isEdit ? "Setting updated" : "Setting created");
      setEditingSetting(null);
      form.reset(toFormValues());
      void queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (err) => {
      if (err instanceof ApiClientError && err.errors) {
        for (const [field, messages] of Object.entries(err.errors)) {
          const mappedField = field === "value" ? "value_text" : field;
          form.setError(mappedField as keyof SettingFormInput, { message: messages[0] });
        }
      } else if (err instanceof SyntaxError) {
        form.setError("value_text", { message: err.message });
      }

      toast.error(
        err instanceof SyntaxError
          ? err.message
          : err instanceof ApiClientError
            ? err.message
            : "Save failed",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminSetting(id),
    onSuccess: () => {
      toast.success("Setting deleted");
      if (editingSetting) {
        setEditingSetting(null);
        form.reset(toFormValues());
      }
      void queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Delete failed");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreAdminSetting(id),
    onSuccess: () => {
      toast.success("Setting restored");
      void queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Restore failed");
    },
  });

  const settings = data?.settings ?? [];
  const lastPage = Number(data?.meta?.last_page ?? 1);
  const total = Number(data?.meta?.total ?? settings.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage tenant configuration keys, typed values, and public settings.
          </p>
        </div>
        {editingSetting ? (
          <Button
            variant="outline"
            onClick={() => {
              setEditingSetting(null);
              form.reset(toFormValues());
            }}
          >
            <Plus className="size-4" />
            New Setting
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{isEdit ? "Edit Setting" : "New Setting"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Update this tenant configuration key."
                : "Create a tenant-scoped configuration entry."}
            </p>
          </div>

          {can(isEdit ? "setting.update" : "setting.create") ? (
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
            >
              <Field label="Group" error={form.formState.errors.group?.message}>
                <Input placeholder="general" {...form.register("group")} />
              </Field>

              <Field label="Key" error={form.formState.errors.key?.message}>
                <Input placeholder="site_name" {...form.register("key")} />
              </Field>

              <Field label="Type" error={form.formState.errors.type?.message}>
                <Select
                  value={selectedType}
                  onValueChange={(value) =>
                    form.setValue("type", (value as SettingFormInput["type"]) ?? "string")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {settingTypes.map((item) => (
                      <SelectItem key={item} value={item}>
                        {formatTypeLabel(item)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label={selectedType === "json" || selectedType === "array" ? "Value JSON" : "Value"}
                error={form.formState.errors.value_text?.message}
              >
                {selectedType === "json" || selectedType === "array" ? (
                  <Textarea
                    rows={8}
                    placeholder={selectedType === "array" ? '["feature-a","feature-b"]' : '{"theme":"dark"}'}
                    {...form.register("value_text")}
                  />
                ) : (
                  <Input
                    placeholder={
                      selectedType === "boolean"
                        ? "true or false"
                        : selectedType === "integer"
                          ? "1"
                          : selectedType === "float"
                            ? "99.99"
                            : "Enter a value"
                    }
                    {...form.register("value_text")}
                  />
                )}
              </Field>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <Checkbox
                  checked={form.watch("is_public")}
                  onCheckedChange={(checked) => form.setValue("is_public", Boolean(checked))}
                />
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Public setting</Label>
                  <p className="text-xs text-slate-500">
                    Public settings can be exposed to unauthenticated consumers when supported.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : isEdit ? "Update Setting" : "Create Setting"}
                </Button>
                {isEdit ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingSetting(null);
                      form.reset(toFormValues());
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate-500">You do not have permission to manage settings.</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search key or group..."
                className="pl-9"
              />
            </div>
            <Select value={type} onValueChange={(value) => setType(value ?? "all")}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {settingTypes.map((item) => (
                  <SelectItem key={item} value={item}>
                    {formatTypeLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={isPublic} onValueChange={(value) => setIsPublic(value ?? "all")}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visibility</SelectItem>
                <SelectItem value="1">Public</SelectItem>
                <SelectItem value="0">Private</SelectItem>
              </SelectContent>
            </Select>
            <Select value={trashed} onValueChange={(value) => setTrashed(value ?? "without")}>
              <SelectTrigger className="w-full sm:w-32">
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
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell>
                        <div className="font-medium">{setting.key}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{setting.group || "general"}</div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm">{formatSettingValue(setting)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{formatTypeLabel(setting.type)}</Badge>
                          {setting.deleted_at ? <Badge variant="outline">Trashed</Badge> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={setting.is_public ? "default" : "outline"}>
                          {setting.is_public ? "Public" : "Private"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          {setting.deleted_at ? (
                            can("setting.restore") ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => restoreMutation.mutate(setting.id)}
                              >
                                <RotateCcw className="size-4" />
                              </Button>
                            ) : null
                          ) : (
                            <>
                              {can("setting.update") ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingSetting(setting)}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              ) : null}
                              {can("setting.delete") ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (confirm(`Delete setting "${setting.key}"?`)) {
                                      deleteMutation.mutate(setting.id);
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
                  {settings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                        No settings found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-start gap-3">
                <div className="inline-flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Globe className="size-4" />
                </div>
                <div>
                  <h3 className="font-medium">Typed values</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Use `boolean`, `integer`, `float`, `json`, or `array` to control how the API returns
                    each setting value.
                  </p>
                </div>
              </div>
            </div>

            {lastPage > 1 ? (
              <div className="flex items-center justify-between gap-2 text-sm text-slate-500 lg:justify-end">
                <p>{total} settings</p>
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
            ) : (
              <div className="flex items-center justify-end text-sm text-slate-500">{total} settings</div>
            )}
          </div>
        </div>
      </div>
    </div>
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
  children: ReactNode;
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
