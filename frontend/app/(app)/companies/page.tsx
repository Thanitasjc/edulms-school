import ModuleReadyState from "@/components/feedback/module-ready-state";

export default function CompaniesPage() {
  return (
    <ModuleReadyState
      title="Companies"
      description="Company CRUD API is available at /api/v1/companies with soft delete and restore."
    />
  );
}
