"use client";

import { useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload-image";
import { cn } from "@/lib/utils";

type ImagePickerFieldProps = {
  value?: string | null;
  onChange: (value: string) => void;
  label?: string;
  aspectClassName?: string;
  className?: string;
};

export function ImagePickerField({
  value,
  onChange,
  label = "Choose image",
  aspectClassName = "aspect-[16/9] max-w-md",
  className,
}: ImagePickerFieldProps) {
  const [uploading, setUploading] = useState(false);

  return (
    <div className={cn("space-y-3", className)}>
      {value ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-800",
            aspectClassName,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Selected preview" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 dark:border-white/15 dark:bg-slate-900",
            aspectClassName,
          )}
        >
          <ImagePlus className="size-8" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 text-sm hover:bg-muted dark:bg-slate-950">
          <Upload className="size-4" />
          {uploading ? "Uploading..." : label}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setUploading(true);
              try {
                const uploaded = await uploadImage(file);
                onChange(uploaded.url);
                toast.success("Image uploaded");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Upload failed");
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
        {value ? (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>
            <Trash2 className="size-4" />
            Remove
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-slate-500">Pick a file from your device. JPG, PNG, WEBP, or GIF up to 5MB.</p>
    </div>
  );
}
