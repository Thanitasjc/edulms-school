"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAdminBlogPost, deleteAdminBlogPost, listAdminBlogPosts } from "@/features/blog/api";
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

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ManageBlogPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [status, setStatus] = useState("published");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const response = await listAdminBlogPosts();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminBlogPost({
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        body: body.trim() || undefined,
        author_name: authorName.trim() || undefined,
        cover_url: coverUrl.trim() || undefined,
        status,
        published_at: status === "published" ? new Date().toISOString() : undefined,
      }),
    onSuccess: () => {
      toast.success("Blog post created");
      setTitle("");
      setSlug("");
      setExcerpt("");
      setBody("");
      setAuthorName("");
      setCoverUrl("");
      void queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Create failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminBlogPost(id),
    onSuccess: () => {
      toast.success("Post deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-1 text-sm text-slate-500">Publish articles for the public blog.</p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          createMutation.mutate();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input placeholder="Slug (optional)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <Input placeholder="Author name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
        <Textarea rows={2} placeholder="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        <Textarea rows={6} placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} />
        <ImagePickerField label="Cover image" value={coverUrl} onChange={setCoverUrl} />
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <Button type="submit" disabled={createMutation.isPending}>
            Create post
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.slug}</TableCell>
                  <TableCell>{post.author_name || "—"}</TableCell>
                  <TableCell>{post.status}</TableCell>
                  <TableCell>{formatDate(post.published_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Delete "${post.title}"?`)) deleteMutation.mutate(post.id);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    No blog posts yet.
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
