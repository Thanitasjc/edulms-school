import ModuleReadyState from "@/components/feedback/module-ready-state";

export default function SettingsPage() {
  return (
    <ModuleReadyState
      title="Settings"
      description="Tenant settings API is available at /api/v1/settings."
    />
  );
}
