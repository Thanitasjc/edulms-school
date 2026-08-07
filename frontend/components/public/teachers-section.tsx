"use client";

import Image from "next/image";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useQuery } from "@tanstack/react-query";

import "swiper/css";
import "swiper/css/pagination";
import { listPublicInstructors } from "@/features/instructors/api";
import { MediaImage } from "@/components/ui/media-image";

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

function TeacherAvatar({ src, name }: { src?: string | null; name: string }) {
  if (!src) return null;
  const isLocal = src.includes("localhost") || src.includes("127.0.0.1");
  if (isLocal) {
    return (
      <MediaImage
        src={src}
        alt={name}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    );
  }
  return (
    <Image
      src={src}
      alt={name}
      fill
      className="object-cover transition duration-500 group-hover:scale-105"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  );
}

export function TeachersSection() {
  const { data: instructors = [] } = useQuery({
    queryKey: ["public-instructors-home"],
    queryFn: async () => {
      const response = await listPublicInstructors({ featured_home: true, limit: 8 });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  if (instructors.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-white py-20 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
            Meet Our Mentors
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Our Expert Teacher
          </h2>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          loop={instructors.length > 1}
          speed={700}
          autoplay={{
            delay: 4200,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            el: ".teacher-pagination",
            bulletClass: "teacher-bullet",
            bulletActiveClass: "teacher-bullet-active",
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          aria-label="Expert teachers"
        >
          {instructors.map((teacher) => (
            <SwiperSlide key={teacher.slug}>
              <article className="group mb-2">
                <div className="relative overflow-hidden rounded-[1.75rem]">
                  <div className="relative aspect-[410/470] bg-slate-100 dark:bg-slate-900">
                    <TeacherAvatar src={teacher.avatar_url} name={teacher.name} />
                  </div>

                  <div className="absolute right-4 bottom-4 flex items-end gap-2">
                    <ul className="flex translate-y-2 flex-col gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <li>
                        <a
                          href="#"
                          aria-label={`${teacher.name} on Facebook`}
                          className="inline-flex size-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:bg-blue-600 hover:text-white"
                        >
                          <FacebookIcon className="size-3.5" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          aria-label={`${teacher.name} on Twitter`}
                          className="inline-flex size-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:bg-sky-500 hover:text-white"
                        >
                          <TwitterIcon className="size-3.5" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          aria-label={`${teacher.name} on LinkedIn`}
                          className="inline-flex size-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:bg-blue-700 hover:text-white"
                        >
                          <LinkedinIcon className="size-3.5" />
                        </a>
                      </li>
                    </ul>
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900">
                      <Share2 className="size-4" />
                    </span>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    <Link href={`/instructors/${teacher.slug}`} className="transition hover:text-blue-600">
                      {teacher.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{teacher.role}</p>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="teacher-pagination mt-10 flex items-center justify-center gap-2" />
      </div>
    </section>
  );
}
