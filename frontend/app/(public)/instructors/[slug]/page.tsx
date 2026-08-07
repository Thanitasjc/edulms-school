"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Star } from "lucide-react";
import { FeaturedCourseCard } from "@/components/public/featured-course-card";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { MediaImage } from "@/components/ui/media-image";
import { getPublicInstructor } from "@/features/instructors/api";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type PublicCourse = {
  id: number;
  title: string;
  slug: string;
  category: string;
  thumbnail_url?: string | null;
  lessons_count: number;
  students_count: number;
  duration_hours: number;
  price: number;
  sale_price?: number | null;
  is_free: boolean;
  instructor_name: string;
  instructor_avatar_url?: string | null;
  rating: number;
  reviews_count: number;
};

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.992 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.94 6.5A1.94 1.94 0 1 1 6.94 2.6a1.94 1.94 0 0 1 0 3.9zM4.75 8.75h4.38v12.5H4.75V8.75zm7.13 0h4.2v1.71h.06c.58-1.1 2-2.26 4.12-2.26 4.4 0 5.21 2.9 5.21 6.67v6.38h-4.38v-5.66c0-1.35-.02-3.09-1.88-3.09-1.89 0-2.18 1.47-2.18 2.99v5.76h-4.15V8.75z" />
    </svg>
  );
}

export default function InstructorDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const {
    data: instructor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-instructor", slug],
    queryFn: async () => {
      const response = await getPublicInstructor(slug);
      return response.data;
    },
    enabled: Boolean(slug),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["instructor-courses", slug, instructor?.name],
    queryFn: async () => {
      const response = await apiClient<PublicCourse[]>(
        `/public/courses?per_page=6&search=${encodeURIComponent(instructor?.name ?? "")}`,
      );
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: Boolean(instructor?.name),
  });

  if (isLoading) {
    return (
      <>
        <PageBreadcrumb title="Our Professor" items={[{ label: "Teachers", href: "/instructors" }]} />
        <p className="mx-auto max-w-7xl px-4 py-14 text-sm text-slate-500">Loading...</p>
      </>
    );
  }

  if (isError || !instructor) {
    return (
      <>
        <PageBreadcrumb
          title="Our Professor"
          items={[{ label: "Teachers", href: "/instructors" }, { label: "Not Found" }]}
        />
        <div className="mx-auto w-full max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Instructor not found</p>
          <Link href="/instructors" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to teachers
          </Link>
        </div>
      </>
    );
  }

  const about = instructor.about ?? [];
  const skills = instructor.skill_labels ?? [];
  const avatar = instructor.avatar_url;
  const isLocalAvatar = Boolean(avatar && (avatar.includes("localhost") || avatar.includes("127.0.0.1")));

  return (
    <>
      <PageBreadcrumb
        title="Our Professor"
        items={[{ label: "Teachers", href: "/instructors" }, { label: instructor.name }]}
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-[410/470] w-full max-w-md overflow-hidden rounded-[1.75rem] bg-slate-100 dark:bg-slate-900">
              {avatar ? (
                isLocalAvatar ? (
                  <MediaImage src={avatar} alt={instructor.name} fill priority className="object-cover" sizes="420px" />
                ) : (
                  <Image src={avatar} alt={instructor.name} fill priority className="object-cover" sizes="420px" />
                )
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-7">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {instructor.name}
            </h2>
            <p className="mt-2 text-blue-600">{instructor.subtitle || instructor.role}</p>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "size-4",
                      index < Math.round(instructor.rating)
                        ? "fill-current"
                        : "text-slate-300 dark:text-slate-600",
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-500">({instructor.reviews_count} Reviews)</span>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">About Me</h3>
              {about.length > 0 ? (
                about.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="mt-4 text-sm text-slate-500">No bio published yet.</p>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Contact Me</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {instructor.address ? (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-blue-600" />
                    <span>
                      <span className="font-medium text-slate-900 dark:text-white">Address: </span>
                      {instructor.address}
                    </span>
                  </li>
                ) : null}
                {instructor.email ? (
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-blue-600" />
                    <span>
                      <span className="font-medium text-slate-900 dark:text-white">Email: </span>
                      <a href={`mailto:${instructor.email}`} className="transition hover:text-blue-600">
                        {instructor.email}
                      </a>
                    </span>
                  </li>
                ) : null}
                {instructor.phone ? (
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-blue-600" />
                    <span>
                      <span className="font-medium text-slate-900 dark:text-white">Phone: </span>
                      <a
                        href={`tel:${instructor.phone.replace(/\s/g, "")}`}
                        className="transition hover:text-blue-600"
                      >
                        {instructor.phone}
                      </a>
                    </span>
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-500">Social Media</span>
              <a
                href="#"
                aria-label="Twitter"
                className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-sky-500 hover:bg-sky-500 hover:text-white dark:border-white/10 dark:text-slate-300"
              >
                <TwitterIcon className="size-3.5" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:border-white/10 dark:text-slate-300"
              >
                <FacebookIcon className="size-3.5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-blue-700 hover:bg-blue-700 hover:text-white dark:border-white/10 dark:text-slate-300"
              >
                <LinkedinIcon className="size-3.5" />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/80 bg-[#f7f9fc] py-16 dark:border-white/10 dark:bg-slate-950">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Our Featured Courses
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <FeaturedCourseCard
                key={course.id}
                id={course.id}
                slug={course.slug}
                title={course.title}
                category={course.category}
                lessonsCount={course.lessons_count}
                studentsCount={course.students_count}
                durationHours={course.duration_hours}
                price={course.price}
                salePrice={course.sale_price}
                isFree={course.is_free}
                instructorName={course.instructor_name}
                instructorAvatarUrl={course.instructor_avatar_url}
                thumbnailUrl={course.thumbnail_url}
                rating={course.rating}
                reviewsCount={course.reviews_count}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
