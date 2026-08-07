"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAdminHeroSlide,
  deleteAdminHeroSlide,
  listAdminHeroSlides,
  updateAdminHeroSlide,
  type AdminHeroSlide,
} from "@/features/cms/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagePickerField } from "@/components/ui/image-picker-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiClientError } from "@/lib/api-client";

type HeroFormState = {
  title: string;
  titleAccent: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm = (): HeroFormState => ({
  title: "",
  titleAccent: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  ctaLabel: "Learn More",
  ctaHref: "/courses",
  sortOrder: 0,
  isActive: true,
});

function slideToForm(slide: AdminHeroSlide): HeroFormState {
  return {
    title: slide.title ?? "",
    titleAccent: slide.title_accent ?? "",
    subtitle: slide.subtitle ?? "",
    description: slide.description ?? "",
    imageUrl: slide.image_url ?? "",
    ctaLabel: slide.cta_label ?? "Learn More",
    ctaHref: slide.cta_href ?? "/courses",
    sortOrder: slide.sort_order ?? 0,
    isActive: Boolean(slide.is_active),
  };
}

export default function ManageHeroPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<HeroFormState>(emptyForm());

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["admin-hero-slides"],
    queryFn: async () => {
      const response = await listAdminHeroSlides();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  useEffect(() => {
    if (editingId === null && form.sortOrder === 0) {
      setForm((current) => ({ ...current, sortOrder: slides.length + 1 }));
    }
  }, [slides.length, editingId, form.sortOrder]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), sortOrder: slides.length + 1 });
  };

  const startEdit = (slide: AdminHeroSlide) => {
    setEditingId(slide.id);
    setForm(slideToForm(slide));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        title_accent: form.titleAccent.trim() || null,
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        image_url: form.imageUrl || null,
        cta_label: form.ctaLabel.trim() || null,
        cta_href: form.ctaHref.trim() || null,
        sort_order: Number(form.sortOrder) || 0,
        is_active: form.isActive,
      };

      if (editingId) {
        return updateAdminHeroSlide(editingId, payload);
      }

      return createAdminHeroSlide({
        ...payload,
        title: payload.title,
        sort_order: payload.sort_order || slides.length + 1,
      });
    },
    onSuccess: () => {
      toast.success(editingId ? "Hero slide updated" : "Hero slide created");
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminHeroSlide(id),
    onSuccess: (_, id) => {
      toast.success("Slide deleted");
      if (editingId === id) resetForm();
      void queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  const setField = <K extends keyof HeroFormState>(key: K, value: HeroFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hero Slides</h1>
        <p className="mt-1 text-sm text-slate-500">
          {editingId ? `Editing slide #${editingId}` : "Create a new homepage hero banner, or edit an existing one."}
        </p>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 lg:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.title.trim()) {
            toast.error("Title is required");
            return;
          }
          saveMutation.mutate();
        }}
      >
        <Input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          required
        />
        <Input
          placeholder="Title accent"
          value={form.titleAccent}
          onChange={(e) => setField("titleAccent", e.target.value)}
        />
        <Input
          placeholder="Subtitle"
          value={form.subtitle}
          onChange={(e) => setField("subtitle", e.target.value)}
        />
        <Input
          type="number"
          min={0}
          placeholder="Sort order"
          value={form.sortOrder}
          onChange={(e) => setField("sortOrder", Number(e.target.value) || 0)}
        />
        <div className="lg:col-span-2">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Hero image</p>
          <ImagePickerField
            value={form.imageUrl}
            onChange={(value) => setField("imageUrl", value)}
            label="Choose hero image"
            aspectClassName="aspect-[21/9] max-w-2xl"
          />
        </div>
        <Input
          placeholder="CTA label"
          value={form.ctaLabel}
          onChange={(e) => setField("ctaLabel", e.target.value)}
        />
        <Input
          placeholder="CTA href"
          value={form.ctaHref}
          onChange={(e) => setField("ctaHref", e.target.value)}
        />
        <Textarea
          className="lg:col-span-2"
          rows={3}
          placeholder="Description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm lg:col-span-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setField("isActive", e.target.checked)}
          />
          Active (show on homepage)
        </label>
        <div className="flex flex-wrap gap-2 lg:col-span-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending
              ? "Saving..."
              : editingId
                ? "Update slide"
                : "Add slide"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel edit
            </Button>
          ) : null}
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>CTA</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.map((slide) => (
                <TableRow
                  key={slide.id}
                  className={editingId === slide.id ? "bg-blue-50/60 dark:bg-blue-950/20" : undefined}
                >
                  <TableCell>
                    <div className="relative h-12 w-20 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                      {slide.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={slide.image_url} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {slide.title} {slide.title_accent}
                  </TableCell>
                  <TableCell>{slide.sort_order}</TableCell>
                  <TableCell>
                    {slide.cta_label} → {slide.cta_href}
                  </TableCell>
                  <TableCell>{slide.is_active ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(slide)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await updateAdminHeroSlide(slide.id, { is_active: !slide.is_active });
                            toast.success(slide.is_active ? "Slide hidden" : "Slide activated");
                            void queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
                          } catch (err) {
                            toast.error(err instanceof ApiClientError ? err.message : "Update failed");
                          }
                        }}
                      >
                        {slide.is_active ? "Hide" : "Show"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm("Delete this slide?")) deleteMutation.mutate(slide.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {slides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    No hero slides yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
