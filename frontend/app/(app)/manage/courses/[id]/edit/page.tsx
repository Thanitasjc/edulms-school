"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminCourse } from "@/features/courses/api";
import { CourseForm } from "@/features/courses/course-form";
import { ApiClientError } from "@/lib/api-client";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-course", id],
    queryFn: async () => {
      const response = await getAdminCourse(id);
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading course...</div>;
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-600">
        {error instanceof ApiClientError ? error.message : "Course not found"}
      </div>
    );
  }

  return <CourseForm course={data} />;
}
