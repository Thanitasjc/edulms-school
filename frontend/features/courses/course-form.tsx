"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  courseFormSchema,
  emptyCurriculum,
  normalizeCurriculum,
  type AdminCourse,
  type CourseFormInput,
} from "@/features/courses/schemas";
import { createAdminCourse, updateAdminCourse } from "@/features/courses/api";
import { listAdminInstructors } from "@/features/instructors/api";
import { CurriculumEditor } from "@/features/courses/curriculum-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ImagePickerField } from "@/components/ui/image-picker-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Link from "next/link";
const defaults: CourseFormInput = {
  title: "",
  slug: "",
  category: "",
  summary: "",
  description: "",
  curriculum: emptyCurriculum(),
  thumbnail_url: "",
  lessons_count: 0,
  students_count: 0,
  duration_hours: 0,
  duration_weeks: "",
  skill_level: "",
  language: "",
  pass_percentage: "",
  deadline: "",
  price: 0,
  sale_price: "",
  is_free: false,
  instructor_id: "",
  instructor_name: "",
  instructor_title: "",
  instructor_avatar_url: "",
  instructor_bio: "",
  rating: 0,
  reviews_count: 0,
  is_trending: false,
  is_featured: false,
  is_popular: false,
  status: "draft",
};

function toFormValues(course?: AdminCourse): CourseFormInput {
  if (!course) return defaults;

  return {
    title: course.title,
    slug: course.slug,
    category: course.category ?? "",
    summary: course.summary ?? "",
    description: course.description ?? "",
    curriculum: normalizeCurriculum(course.curriculum),
    thumbnail_url: course.thumbnail_url ?? "",
    lessons_count: course.lessons_count,
    students_count: course.students_count,
    duration_hours: course.duration_hours,
    duration_weeks: course.duration_weeks ?? "",
    skill_level: course.skill_level ?? "",
    language: course.language ?? "",
    pass_percentage: course.pass_percentage ?? "",
    deadline: course.deadline ? course.deadline.slice(0, 10) : "",
    price: Number(course.price),
    sale_price: course.sale_price === null || course.sale_price === undefined ? "" : Number(course.sale_price),
    is_free: course.is_free,
    instructor_id: course.instructor_id ?? "",
    instructor_name: course.instructor_name ?? "",
    instructor_title: course.instructor_title ?? "",
    instructor_avatar_url: course.instructor_avatar_url ?? "",
    instructor_bio: course.instructor_bio ?? "",
    rating: Number(course.rating),
    reviews_count: course.reviews_count,
    is_trending: course.is_trending,
    is_featured: course.is_featured,
    is_popular: course.is_popular,
    status: (course.status as CourseFormInput["status"]) || "draft",
  };
}

type CourseFormProps = {
  course?: AdminCourse;
};

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const isEdit = Boolean(course);
  const [tab, setTab] = useState("overview");

  const { data: instructors = [] } = useQuery({
    queryKey: ["admin-instructors-options"],
    queryFn: async () => {
      const response = await listAdminInstructors({ status: "published" });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const form = useForm<CourseFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(courseFormSchema) as any,
    defaultValues: toFormValues(course),
  });

  const applyInstructor = (instructorId: string) => {
    if (instructorId === "none" || instructorId === "") {
      form.setValue("instructor_id", "");
      return;
    }
    const selected = instructors.find((item) => String(item.id) === instructorId);
    form.setValue("instructor_id", Number(instructorId));
    if (!selected) return;
    form.setValue("instructor_name", selected.name);
    form.setValue("instructor_title", selected.role ?? "");
    form.setValue("instructor_avatar_url", selected.avatar_url ?? "");
    form.setValue("instructor_bio", (selected.about ?? []).join("\n\n"));
  };
  const onSubmit = form.handleSubmit(
    async (values) => {
      try {
        if (isEdit && course) {
          await updateAdminCourse(course.id, values);
          toast.success("Course updated");
        } else {
          await createAdminCourse(values);
          toast.success("Course created");
        }
        router.push("/manage/courses");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof ApiClientError ? error.message : "Save failed");
      }
    },
    () => {
      toast.error("Please fix validation errors");
      setTab("overview");
    },
  );

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? "Edit Course" : "New Course"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Edit by tab: Overview, Curriculum, Instructor, Reviews.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/manage/courses" className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </Link>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Course"}
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList variant="line" className="h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-slate-200 bg-transparent p-0 dark:border-white/10">
          <TabsTrigger value="overview" className="rounded-none px-4 py-2.5">
            Overview
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="rounded-none px-4 py-2.5">
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="instructor" className="rounded-none px-4 py-2.5">
            Instructor
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-none px-4 py-2.5">
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-2">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900 lg:grid-cols-2">
            <Field label="Title" error={form.formState.errors.title?.message}>
              <Input {...form.register("title")} />
            </Field>
            <Field label="Slug (optional)" error={form.formState.errors.slug?.message}>
              <Input placeholder="auto-from-title" {...form.register("slug")} />
            </Field>
            <Field label="Category" error={form.formState.errors.category?.message}>
              <Input placeholder="Development" {...form.register("category")} />
            </Field>
            <Field label="Status">
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Summary" className="lg:col-span-2" error={form.formState.errors.summary?.message}>
              <Textarea rows={2} {...form.register("summary")} />
            </Field>
            <Field
              label="Description (rich text)"
              className="lg:col-span-2"
              error={form.formState.errors.description?.message}
            >
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Course overview, learning outcomes, lists..."
                  />
                )}
              />
            </Field>
            <Field
              label="Thumbnail"
              className="lg:col-span-2"
              error={form.formState.errors.thumbnail_url?.message}
            >
              <Controller
                control={form.control}
                name="thumbnail_url"
                render={({ field }) => (
                  <ImagePickerField value={field.value} onChange={field.onChange} label="Choose thumbnail" />
                )}
              />
            </Field>
            <div className="lg:col-span-2">
              <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Sidebar / purchase card</p>
            </div>
            <Field label="Price (บาท)" error={form.formState.errors.price?.message}>
              <Input type="number" step="0.01" {...form.register("price")} />
            </Field>
            <Field label="Sale price (บาท)" error={form.formState.errors.sale_price?.message}>
              <Input type="number" step="0.01" {...form.register("sale_price")} />
            </Field>
            <Field label="Students" error={form.formState.errors.students_count?.message}>
              <Input type="number" {...form.register("students_count")} />
            </Field>
            <Field label="Lessons (auto from curriculum if set)" error={form.formState.errors.lessons_count?.message}>
              <Input type="number" {...form.register("lessons_count")} />
            </Field>
            <Field label="Duration (hours)" error={form.formState.errors.duration_hours?.message}>
              <Input type="number" {...form.register("duration_hours")} />
            </Field>
            <Field label="Duration (weeks)" error={form.formState.errors.duration_weeks?.message}>
              <Input type="number" placeholder="auto from hours if empty" {...form.register("duration_weeks")} />
            </Field>
            <Field label="Skill level" error={form.formState.errors.skill_level?.message}>
              <Input placeholder="Beginner" {...form.register("skill_level")} />
            </Field>
            <Field label="Language" error={form.formState.errors.language?.message}>
              <Input placeholder="English" {...form.register("language")} />
            </Field>
            <Field label="Pass percentage" error={form.formState.errors.pass_percentage?.message}>
              <Input type="number" min={0} max={100} placeholder="84" {...form.register("pass_percentage")} />
            </Field>
            <Field label="Deadline" error={form.formState.errors.deadline?.message}>
              <Input type="date" {...form.register("deadline")} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
              <BoolCheck control={form.control} name="is_free" label="Free course" />
              <BoolCheck control={form.control} name="is_featured" label="Featured" />
              <BoolCheck control={form.control} name="is_trending" label="Trending" />
              <BoolCheck control={form.control} name="is_popular" label="Popular" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="curriculum" className="mt-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
            <CurriculumEditor control={form.control} />
          </div>
        </TabsContent>

        <TabsContent value="instructor" className="mt-2">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900 lg:grid-cols-2">
            <Field label="Link instructor profile" className="lg:col-span-2">
              <Select
                value={form.watch("instructor_id") ? String(form.watch("instructor_id")) : "none"}
                onValueChange={(value) => applyInstructor(value ?? "none")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Manual / none</SelectItem>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={String(instructor.id)}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Instructor name" error={form.formState.errors.instructor_name?.message}>
              <Input {...form.register("instructor_name")} />
            </Field>
            <Field label="Title / role" error={form.formState.errors.instructor_title?.message}>
              <Input placeholder="Lead Instructor" {...form.register("instructor_title")} />
            </Field>
            <Field
              label="Avatar"
              className="lg:col-span-2"
              error={form.formState.errors.instructor_avatar_url?.message}
            >
              <Controller
                control={form.control}
                name="instructor_avatar_url"
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
            <Field
              label="Bio"
              className="lg:col-span-2"
              error={form.formState.errors.instructor_bio?.message}
            >
              <Textarea rows={5} placeholder="Instructor biography..." {...form.register("instructor_bio")} />
            </Field>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-2">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900 sm:grid-cols-2">
            <Field label="Average rating (synced from reviews)" error={form.formState.errors.rating?.message}>
              <Input type="number" step="0.1" min={0} max={5} {...form.register("rating")} />
            </Field>
            <Field label="Reviews count (synced)" error={form.formState.errors.reviews_count?.message}>
              <Input type="number" min={0} {...form.register("reviews_count")} />
            </Field>
            <p className="text-sm text-slate-500 sm:col-span-2">
              Real reviews are managed under{" "}
              <Link href="/manage/reviews" className="text-blue-600 hover:underline">
                Manage → Reviews
              </Link>
              . Rating/count sync automatically when reviews are approved.
            </p>
          </div>
        </TabsContent>
      </Tabs>
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

function BoolCheck({
  control,
  name,
  label,
}: {
  control: Control<CourseFormInput>;
  name: "is_free" | "is_featured" | "is_trending" | "is_popular";
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={field.value}
            onCheckedChange={(checked) => field.onChange(checked === true)}
          />
          {label}
        </label>
      )}
    />
  );
}
