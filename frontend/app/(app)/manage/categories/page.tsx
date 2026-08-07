"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategories,
  updateAdminCategory,
} from "@/features/cms/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiClientError } from "@/lib/api-client";

export default function ManageCategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("layout-grid");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const response = await listAdminCategories();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminCategory({
        name,
        slug: slug || undefined,
        icon,
        status: "published",
        is_featured: true,
        sort_order: categories.length + 1,
      }),
    onSuccess: () => {
      toast.success("Category created");
      setName("");
      setSlug("");
      void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Create failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-slate-500">CMS categories for the public homepage grid.</p>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          createMutation.mutate();
        }}
      >
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="Slug (optional)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <Input placeholder="Icon key" value={icon} onChange={(e) => setIcon(e.target.value)} />
        <Button type="submit" disabled={createMutation.isPending}>
          Add category
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>{category.icon}</TableCell>
                  <TableCell>{category.courses_count}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const nextName = prompt("Rename category", category.name);
                          if (!nextName) return;
                          try {
                            await updateAdminCategory(category.id, { name: nextName });
                            toast.success("Updated");
                            void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
                          } catch (err) {
                            toast.error(err instanceof ApiClientError ? err.message : "Update failed");
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Delete ${category.name}?`)) deleteMutation.mutate(category.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
