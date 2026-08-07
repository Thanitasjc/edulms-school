import ModuleReadyState from "@/components/feedback/module-ready-state";

export default function RolesPage() {
  return (
    <ModuleReadyState
      title="Roles & Permissions"
      description="Role and permission endpoints are available under /api/v1/roles and /api/v1/permissions."
    />
  );
}
