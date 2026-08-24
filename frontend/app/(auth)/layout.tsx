import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top,#0f172a_0%,#020617_60%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-12">
        <Link href="/" className="mb-8 text-center text-2xl font-semibold tracking-tight">
          EduLMS
        </Link>
        {children}
      </div>
    </div>
  );
}
