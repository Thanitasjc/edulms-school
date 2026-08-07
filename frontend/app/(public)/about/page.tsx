import { PageBreadcrumb } from "@/components/public/page-breadcrumb";

export default function AboutPage() {
  return (
    <>
      <PageBreadcrumb title="About" items={[{ label: "About" }]} />
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="max-w-3xl text-slate-600 dark:text-slate-300">
          EduLMS is an enterprise learning platform for schools, universities, and academies.
          Manage courses, instructors, and learners in one modular system.
        </p>
      </div>
    </>
  );
}
