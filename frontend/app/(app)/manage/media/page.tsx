"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { deleteAdminMedia, listAdminMedia } from "@/features/media/api";
import { Button } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { uploadImage } from "@/lib/upload-image";
import { ApiClientError } from "@/lib/api-client";

function formatSize(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ManageMediaPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: assets = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const response = await listAdminMedia();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminMedia(id),
    onSuccess: () => {
      toast.success("Media deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await uploadImage(file);
      toast.success("Uploaded");
      void queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
          <p className="mt-1 text-sm text-slate-500">Uploaded images and files for your tenant.</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) await handleUpload(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 size-4" />
            {uploading ? "Uploading..." : "Upload file"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">
          {error instanceof ApiClientError ? error.message : "Failed to load"}
        </p>
      ) : assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-white/15">
          No media assets yet. Upload a file to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => {
            const isImage = asset.mime?.startsWith("image/") ?? /\.(jpe?g|png|gif|webp)$/i.test(asset.original_name);

            return (
              <div
                key={asset.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
              >
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                  {isImage && asset.url ? (
                    <MediaImage src={asset.url} alt={asset.original_name} fill className="object-cover" sizes="240px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      {asset.mime || "File"}
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <p className="truncate text-sm font-medium" title={asset.original_name}>
                    {asset.original_name}
                  </p>
                  <p className="text-xs text-slate-500">{formatSize(asset.size)}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (confirm(`Delete ${asset.original_name}?`)) deleteMutation.mutate(asset.id);
                    }}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
