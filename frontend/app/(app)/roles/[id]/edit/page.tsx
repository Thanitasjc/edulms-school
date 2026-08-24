"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAdminRole } from "@/features/roles/api";
import { RoleForm } from "@/features/roles/role-form";
import { ApiClientError } from "@/lib/api-client";

export default function EditRolePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-role", id],
    queryFn: async () => {
      const response = await getAdminRole(id);
      return response.data;
    },
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading role...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-red-500">
        {error instanceof ApiClientError ? error.message : "Role not found"}
      </p>
    );
  }

  return <RoleForm role={data} />;
}
