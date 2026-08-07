import Link from "next/link";

export default function ModuleReadyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-slate-500">{description}</p>
      <Link
        href="/dashboard"
        className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm hover:bg-muted"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
