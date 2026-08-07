import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900 dark:bg-slate-950 dark:text-white">
      <SiteHeader />
      <main className="flex-1 pb-24">{children}</main>
      <SiteFooter />
    </div>
  );
}
