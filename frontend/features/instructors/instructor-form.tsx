"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAdminInstructor, updateAdminInstructor } from "./api";
import { instructorFormSchema, type AdminInstructor, type InstructorFormInput } from "./schemas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePickerField } from "@/components/ui/image-picker-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const defaults: InstructorFormInput = {
  name: "",
  slug: "",
  role: "",
  subtitle: "",
  avatar_url: "",
  rating: 0,
  reviews_count: 0,
  about: "",
  address: "",
  email: "",
  phone: "",
  skill_labels: "",
  status: "published",
};

function toFormValues(instructor?: AdminInstructor | null): InstructorFormInput {
  if (!instructor) return defaults;
  return {
    name: instructor.name,
    slug: instructor.slug,
    role: instructor.role ?? "",
    subtitle: instructor.subtitle ?? "",
    avatar_url: instructor.avatar_url ?? "",
    rating: instructor.rating,
    reviews_count: instructor.reviews_count,
    about: (instructor.about ?? []).join("\n"),
    address: instructor.address ?? "",
    email: instructor.email ?? "",
    phone: instructor.phone ?? "",
    skill_labels: (instructor.skill_labels ?? []).join(", "),
    status: (instructor.status as InstructorFormInput["status"]) || "published",
  };
}

export function InstructorForm({ instructor }: { instructor?: AdminInstructor | null }) {
  const router = useRouter();
  const isEdit = Boolean(instructor?.id);
  const form = useForm<InstructorFormInput>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: toFormValues(instructor),
  });

  const mutation = useMutation({
    mutationFn: (values: InstructorFormInput) =>
      isEdit && instructor
        ? updateAdminInstructor(instructor.id, values)
        : createAdminInstructor(values),
    onSuccess: () => {
      toast.success(isEdit ? "Instructor updated" : "Instructor created");
      router.push("/manage/instructors");
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Save failed");
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
            {isEdit ? "Edit Instructor" : "New Instructor"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Manage public teacher profiles.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/manage/instructors" className={cn(buttonVariants({ variant: "outline" }))}>
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
        <Field label="Slug" error={form.formState.errors.slug?.message}>
          <Input placeholder="auto from name" {...form.register("slug")} />
        </Field>
        <Field label="Role" error={form.formState.errors.role?.message}>
          <Input {...form.register("role")} />
        </Field>
        <Field label="Subtitle" error={form.formState.errors.subtitle?.message}>
          <Input {...form.register("subtitle")} />
        </Field>
        <Field label="Avatar" className="lg:col-span-2" error={form.formState.errors.avatar_url?.message}>
          <Controller
            control={form.control}
            name="avatar_url"
            render={({ field }) => (
              <ImagePickerField
                value={field.value}
                onChange={field.onChange}
                label="Choose avatar"
                aspectClassName="aspect-square max-w-[180px]"
              />
            )}
          />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} />
        </Field>
        <Field label="Address" className="lg:col-span-2" error={form.formState.errors.address?.message}>
          <Input {...form.register("address")} />
        </Field>
        <Field label="About (one paragraph per line)" className="lg:col-span-2" error={form.formState.errors.about?.message}>
          <Textarea rows={5} {...form.register("about")} />
        </Field>
        <Field label="Skills (comma separated)" className="lg:col-span-2" error={form.formState.errors.skill_labels?.message}>
          <Input {...form.register("skill_labels")} />
        </Field>
        <Field label="Rating" error={form.formState.errors.rating?.message}>
          <Input type="number" step="0.1" min={0} max={5} {...form.register("rating")} />
        </Field>
        <Field label="Reviews count" error={form.formState.errors.reviews_count?.message}>
          <Input type="number" min={0} {...form.register("reviews_count")} />
        </Field>
        <Field label="Status" error={form.formState.errors.status?.message}>
          <Select
            value={form.watch("status")}
            onValueChange={(value) =>
              form.setValue("status", (value as InstructorFormInput["status"]) ?? "published")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
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
