"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAdminCompany, updateAdminCompany } from "./api";
import {
  companyFormSchema,
  slugifyCompanyName,
  stringifySettings,
  type AdminCompany,
  type CompanyFormInput,
} from "./schemas";
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
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

function toFormValues(company?: AdminCompany | null): CompanyFormInput {
  return {
    name: company?.name ?? "",
    slug: company?.slug ?? "",
    domain: company?.domain ?? "",
    email: company?.email ?? "",
    phone: company?.phone ?? "",
    logo_path: company?.logo_path ?? "",
    timezone: company?.timezone ?? "Asia/Bangkok",
    locale: company?.locale ?? "th",
    status: (company?.status as CompanyFormInput["status"]) || "active",
    settings_text: stringifySettings(company?.settings),
  };
}

export function CompanyForm({ company }: { company?: AdminCompany | null }) {
  const router = useRouter();
  const isEdit = Boolean(company?.id);

  const form = useForm<CompanyFormInput>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: toFormValues(company),
  });

  const mutation = useMutation({
    mutationFn: (values: CompanyFormInput) =>
      isEdit && company ? updateAdminCompany(company.id, values) : createAdminCompany(values),
    onSuccess: () => {
      toast.success(isEdit ? "Company updated" : "Company created");
      router.push("/companies");
    },
    onError: (err) => {
      if (err instanceof ApiClientError && err.errors) {
        for (const [field, messages] of Object.entries(err.errors)) {
          const mappedField = field === "settings" ? "settings_text" : field;
          form.setError(mappedField as keyof CompanyFormInput, { message: messages[0] });
        }
      } else if (err instanceof SyntaxError) {
        form.setError("settings_text", { message: "Settings must be valid JSON" });
      }

      const message =
        err instanceof SyntaxError
          ? "Settings must be valid JSON"
          : err instanceof ApiClientError
            ? err.message
            : "Save failed";
      toast.error(message);
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? "Edit Company" : "New Company"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit ? "Update company profile and tenant settings." : "Create a new school or academy tenant."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/companies" className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900 lg:grid-cols-2">
        <Field label="Company name" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="Slug" error={form.formState.errors.slug?.message}>
          <Input
            placeholder="auto-from-name"
            {...form.register("slug", {
              onBlur: (event) => {
                if (!event.target.value.trim()) {
                  form.setValue("slug", slugifyCompanyName(form.getValues("name")), { shouldValidate: true });
                }
              },
            })}
          />
        </Field>
        <Field label="Domain" error={form.formState.errors.domain?.message}>
          <Input placeholder="academy.example.com" {...form.register("domain")} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} />
        </Field>
        <Field label="Logo path" error={form.formState.errors.logo_path?.message}>
          <Input placeholder="/storage/logos/demo.png" {...form.register("logo_path")} />
        </Field>
        <Field label="Timezone" error={form.formState.errors.timezone?.message}>
          <Input placeholder="Asia/Bangkok" {...form.register("timezone")} />
        </Field>
        <Field label="Locale" error={form.formState.errors.locale?.message}>
          <Input placeholder="th" {...form.register("locale")} />
        </Field>
        <Field label="Status" error={form.formState.errors.status?.message}>
          <Select
            value={form.watch("status")}
            onValueChange={(value) =>
              form.setValue("status", (value as CompanyFormInput["status"]) ?? "active")
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
          label="Settings JSON"
          className="lg:col-span-2"
          error={form.formState.errors.settings_text?.message}
        >
          <Textarea
            rows={8}
            placeholder='{"branding":{"primary_color":"#2563eb"}}'
            {...form.register("settings_text")}
          />
        </Field>
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
