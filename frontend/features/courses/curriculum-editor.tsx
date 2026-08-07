"use client";

import { Plus, Trash2, Upload } from "lucide-react";
import type { Control } from "react-hook-form";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadCourseVideo } from "@/features/courses/api";
import type { CourseFormInput } from "@/features/courses/schemas";

type CurriculumEditorProps = {
  control: Control<CourseFormInput>;
};

const emptyLesson = {
  title: "New lesson",
  duration: "05:00",
  video_type: null as "youtube" | "mp4" | null,
  video_url: "",
  is_preview: false,
};

export function CurriculumEditor({ control }: CurriculumEditorProps) {
  const sections = useFieldArray({
    control,
    name: "curriculum.sections",
  });

  return (
    <div className="space-y-4 lg:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label>Curriculum</Label>
          <p className="mt-1 text-xs text-slate-500">
            Add YouTube/MP4 lessons. Free courses play publicly; paid courses need purchase/enrollment (unless preview).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            sections.append({
              title: `Section ${sections.fields.length + 1}`,
              lessons: [{ ...emptyLesson }],
            })
          }
        >
          <Plus className="size-4" />
          Add section
        </Button>
      </div>

      <Controller
        control={control}
        name="curriculum.summary"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="curriculum-summary">Curriculum intro</Label>
            <Textarea
              id="curriculum-summary"
              rows={2}
              placeholder="Short intro above the accordion..."
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          </div>
        )}
      />

      {sections.fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-white/15">
          No curriculum sections yet.
        </div>
      ) : (
        <div className="space-y-4">
          {sections.fields.map((section, sectionIndex) => (
            <div
              key={section.id}
              className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex-1 space-y-2">
                  <Label>Section title</Label>
                  <Controller
                    control={control}
                    name={`curriculum.sections.${sectionIndex}.title`}
                    render={({ field }) => <Input {...field} />}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-0 sm:mt-7"
                  onClick={() => sections.remove(sectionIndex)}
                >
                  <Trash2 className="size-4" />
                  Remove section
                </Button>
              </div>

              <SectionLessons control={control} sectionIndex={sectionIndex} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionLessons({
  control,
  sectionIndex,
}: {
  control: Control<CourseFormInput>;
  sectionIndex: number;
}) {
  const lessons = useFieldArray({
    control,
    name: `curriculum.sections.${sectionIndex}.lessons`,
  });

  return (
    <div className="space-y-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Lessons</p>
        <Button type="button" variant="ghost" size="sm" onClick={() => lessons.append({ ...emptyLesson })}>
          <Plus className="size-4" />
          Add lesson
        </Button>
      </div>

      {lessons.fields.map((lesson, lessonIndex) => (
        <LessonEditor
          key={lesson.id}
          control={control}
          sectionIndex={sectionIndex}
          lessonIndex={lessonIndex}
          onRemove={() => lessons.remove(lessonIndex)}
        />
      ))}
    </div>
  );
}

function LessonEditor({
  control,
  sectionIndex,
  lessonIndex,
  onRemove,
}: {
  control: Control<CourseFormInput>;
  sectionIndex: number;
  lessonIndex: number;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const videoType = useWatch({
    control,
    name: `curriculum.sections.${sectionIndex}.lessons.${lessonIndex}.video_type`,
  });

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
      <div className="grid gap-2 sm:grid-cols-[1fr_110px_auto]">
        <Controller
          control={control}
          name={`curriculum.sections.${sectionIndex}.lessons.${lessonIndex}.title`}
          render={({ field }) => <Input placeholder="Lesson title" {...field} />}
        />
        <Controller
          control={control}
          name={`curriculum.sections.${sectionIndex}.lessons.${lessonIndex}.duration`}
          render={({ field }) => (
            <Input placeholder="04:00" value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
        <Button type="button" variant="outline" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Video type</Label>
          <Controller
            control={control}
            name={`curriculum.sections.${sectionIndex}.lessons.${lessonIndex}.video_type`}
            render={({ field }) => (
              <Select
                value={field.value ?? "none"}
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="mp4">MP4</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex items-end">
          <Controller
            control={control}
            name={`curriculum.sections.${sectionIndex}.lessons.${lessonIndex}.is_preview`}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                Free preview
              </label>
            )}
          />
        </div>
      </div>

      {videoType ? (
        <Controller
          control={control}
          name={`curriculum.sections.${sectionIndex}.lessons.${lessonIndex}.video_url`}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>{videoType === "youtube" ? "YouTube URL" : "MP4 URL"}</Label>
              <Input
                placeholder={
                  videoType === "youtube"
                    ? "https://www.youtube.com/watch?v=..."
                    : "https://.../video.mp4 or upload below"
                }
                value={field.value ?? ""}
                onChange={field.onChange}
              />
              {videoType === "mp4" ? (
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-blue-600">
                  <Upload className="size-4" />
                  {uploading ? "Uploading..." : "Upload MP4 file"}
                  <input
                    type="file"
                    accept="video/mp4"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      setUploading(true);
                      try {
                        const uploaded = await uploadCourseVideo(file);
                        field.onChange(uploaded.url);
                        toast.success("Video uploaded");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Upload failed");
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                </label>
              ) : null}
            </div>
          )}
        />
      ) : null}
    </div>
  );
}
