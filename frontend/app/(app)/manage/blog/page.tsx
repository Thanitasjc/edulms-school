"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  listAdminBlogPosts,
  updateAdminBlogPost,
  type BlogPost,
} from "@/features/blog/api";
import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagePickerField } from "@/components/ui/image-picker-field";
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
import { ApiClientError } from "@/lib/api-client";

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author_name: string;
  cover_url: string;
  status: string;
};

const emptyForm = (): BlogFormState => ({
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  author_name: "",
  cover_url: "",
  status: "published",
});

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function toFormState(post: BlogPost): BlogFormState {
  return {
    title: post.title ?? "",
    slug: post.slug ?? "",
    excerpt: post.excerpt ?? "",
    body: post.body ?? "",
    author_name: post.author_name ?? "",
    cover_url: post.cover_url ?? "",
    status: post.status || "published",
  };
}

export default function ManageBlogPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const can = (permission: string) =>
    Boolean(user?.is_super_admin || user?.permissions.includes(permission));

  const queryKey = useMemo(
    () => ["admin-blog-posts", statusFilter] as const,
    [statusFilter],
  );

  const { data: posts = [], isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminBlogPosts({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  useEffect(() => {
    if (editing) {
      setForm(toFormState(editing));
    }
  }, [editing]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm());
  };

  const payload = () => ({
    title: form.title.trim(),
    slug: form.slug.trim() || undefined,
    excerpt: form.excerpt.trim() || undefined,
    body: form.body.trim() || undefined,
    author_name: form.author_name.trim() || undefined,
    cover_url: form.cover_url.trim() || undefined,
    status: form.status,
    published_at:
      form.status === "published"
        ? editing?.published_at || new Date().toISOString()
        : undefined,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateAdminBlogPost(editing.id, payload())
        : createAdminBlogPost(payload()),
    onSuccess: () => {
      toast.success(editing ? "Blog post updated" : "Blog post created");
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
    onError: (err) =>
      toast.error(err instanceof ApiClientError ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminBlogPost(id),
    onSuccess: (_, id) => {
      toast.success("Post deleted");
      if (editing?.id === id) {
        resetForm();
      }
      void queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
    onError: (err) =>
      toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  const filteredPosts = posts.filter((post) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      post.title.toLowerCase().includes(q) ||
      post.slug.toLowerCase().includes(q) ||
      (post.author_name ?? "").toLowerCase().includes(q)
    );
  });

  const setField = <K extends keyof BlogFormState>(key: K, value: BlogFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-1 text-sm text-slate-500">Create, edit, and delete public blog posts.</p>
        </div>
        {editing ? (
          <Button variant="outline" onClick={resetForm}>
            <Plus className="size-4" />
            New post
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{editing ? "Edit post" : "New post"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {editing ? `Editing #${editing.id}` : "Publish articles for the public blog."}
            </p>
          </div>

          {can(editing ? "blog.update" : "blog.create") ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!form.title.trim()) return;
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
                placeholder="Slug (optional)"
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
              />
              <Input
                placeholder="Author name"
                value={form.author_name}
                onChange={(e) => setField("author_name", e.target.value)}
              />
              <Textarea
                rows={2}
                placeholder="Excerpt"
                value={form.excerpt}
                onChange={(e) => setField("excerpt", e.target.value)}
              />
              <Textarea
                rows={8}
                placeholder="Body"
                value={form.body}
                onChange={(e) => setField("body", e.target.value)}
              />
              <ImagePickerField
                label="Cover image"
                value={form.cover_url}
                onChange={(value) => setField("cover_url", value)}
              />
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950"
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending
                    ? "Saving..."
                    : editing
                      ? "Update post"
                      : "Create post"}
                </Button>
                {editing ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate-500">You do not have permission to manage blog posts.</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, slug, or author..."
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value ?? "all")}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="font-medium">{post.title}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{post.slug}</div>
                      </TableCell>
                      <TableCell>{post.author_name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(post.published_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          {can("blog.update") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditing(post)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          ) : null}
                          {can("blog.delete") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm(`Delete "${post.title}"?`)) {
                                  deleteMutation.mutate(post.id);
                                }
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                        No blog posts found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
