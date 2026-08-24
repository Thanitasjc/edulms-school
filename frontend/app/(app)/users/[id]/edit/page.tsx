"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAdminUser } from "@/features/users/api";
import { UserForm } from "@/features/users/user-form";
import { ApiClientError } from "@/lib/api-client";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      const response = await getAdminUser(id);
      return response.data;
    },
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading user...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-red-500">
        {error instanceof ApiClientError ? error.message : "User not found"}
      </p>
    );
  }

  return <UserForm user={data} />;
}
