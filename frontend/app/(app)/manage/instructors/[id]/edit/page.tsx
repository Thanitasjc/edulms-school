"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAdminInstructor } from "@/features/instructors/api";
import { InstructorForm } from "@/features/instructors/instructor-form";
import { ApiClientError } from "@/lib/api-client";

export default function EditInstructorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-instructor", id],
    queryFn: async () => {
      const response = await getAdminInstructor(id);
      return response.data;
    },
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading instructor...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-red-500">
        {error instanceof ApiClientError ? error.message : "Instructor not found"}
      </p>
    );
  }

  return <InstructorForm instructor={data} />;
}
