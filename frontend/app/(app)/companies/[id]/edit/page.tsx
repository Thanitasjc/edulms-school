"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAdminCompany } from "@/features/companies/api";
import { CompanyForm } from "@/features/companies/company-form";
import { ApiClientError } from "@/lib/api-client";

export default function EditCompanyPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-company", id],
    queryFn: async () => {
      const response = await getAdminCompany(id);
      return response.data;
    },
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading company...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-red-500">
        {error instanceof ApiClientError ? error.message : "Company not found"}
      </p>
    );
  }

  return <CompanyForm company={data} />;
}
