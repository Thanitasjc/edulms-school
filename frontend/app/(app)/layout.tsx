"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Settings,
  LogOut,
  BookOpen,
  GraduationCap,
  ShoppingBag,
  MessageSquare,
  Layers,
  ImageIcon,
  ClipboardList,
  Award,
  FolderOpen,
  Mail,
  Newspaper,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

const nav: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: string;
  module?: string;
}> = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/manage/courses", label: "Courses", icon: BookOpen, permission: "course.view", module: "course" },
  { href: "/manage/instructors", label: "Instructors", icon: GraduationCap, permission: "instructor.view", module: "instructor" },
  { href: "/manage/enrollments", label: "Enrollments", icon: ShoppingBag, permission: "enrollment.view", module: "enrollment" },
  { href: "/manage/payments", label: "Payments", icon: CreditCard, permission: "payment.view", module: "payment" },
  { href: "/manage/reviews", label: "Reviews", icon: MessageSquare, permission: "course.view", module: "course" },
  { href: "/manage/categories", label: "Categories", icon: Layers, permission: "cms.view", module: "cms" },
  { href: "/manage/hero", label: "Hero", icon: ImageIcon, permission: "cms.view", module: "cms" },
  { href: "/manage/quizzes", label: "Quizzes", icon: ClipboardList, permission: "quiz.view", module: "quiz" },
  { href: "/manage/certificates", label: "Certificates", icon: Award, permission: "certificate.view", module: "certificate" },
  { href: "/manage/media", label: "Media", icon: FolderOpen, permission: "media.view", module: "media" },
  { href: "/manage/leads", label: "Leads", icon: Mail, permission: "crm.view", module: "crm" },
  { href: "/manage/blog", label: "Blog", icon: Newspaper, permission: "blog.view", module: "blog" },
  { href: "/companies", label: "Companies", icon: Building2, permission: "company.view", module: "company" },
  { href: "/users", label: "Users", icon: Users, permission: "user.view", module: "user" },
  { href: "/roles", label: "Roles", icon: Shield, permission: "role.view", module: "role" },
  { href: "/settings", label: "Settings", icon: Settings, permission: "setting.view", module: "setting" },
];
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout, enabledModules } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading workspace...
      </div>
    );
  }

  const can = (permission?: string) =>
    !permission || user.is_super_admin || user.permissions.includes(permission);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
          <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-white/10">
            <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
              EduLMS
            </Link>
          </div>
          <nav className="space-y-1 p-3" aria-label="App">
            {nav
              .filter((item) => can(item.permission))
              .filter((item) => !item.module || enabledModules.includes(item.module))
              .map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                      active
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
          </nav>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 sm:px-6">
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
            >
              <LogOut className="mr-2 size-4" />
              Logout
            </Button>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
