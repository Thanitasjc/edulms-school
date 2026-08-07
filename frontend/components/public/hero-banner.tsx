"use client";

import Link from "next/link";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { listPublicHeroSlides } from "@/features/cms/api";
import { heroSlides as fallbackSlides } from "@/features/public/hero-slides";

import "swiper/css";
import "swiper/css/effect-fade";

export function HeroBanner() {
  const swiperRef = useRef<SwiperType | null>(null);
  const { data: apiSlides } = useQuery({
    queryKey: ["public-hero-slides"],
    queryFn: async () => {
      const response = await listPublicHeroSlides();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const slides =
    apiSlides && apiSlides.length > 0
      ? apiSlides.map((slide) => ({
          id: String(slide.id),
          subtitle: slide.subtitle ?? "",
          title: slide.title,
          titleAccent: slide.title_accent ?? "",
          description: slide.description ?? "",
          ctaLabel: slide.cta_label ?? "Learn More",
          ctaHref: slide.cta_href ?? "/courses",
          imageUrl: slide.image_url ?? "",
        }))
      : fallbackSlides;

  return (
    <section className="relative h-[min(92vh,760px)] min-h-[520px] overflow-hidden bg-[#071226] text-white">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={slides.length > 1}
        speed={900}
        autoplay={{
          delay: 5500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="h-full w-full"
        aria-label="Hero banner"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="!h-full">
            <div
              className="relative flex h-full items-center bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: slide.imageUrl ? `url('${slide.imageUrl}')` : undefined }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,18,38,0.92)_0%,rgba(7,18,38,0.72)_48%,rgba(7,18,38,0.35)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.28),transparent_42%)]" />

              <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/85 backdrop-blur-md">
                    <GraduationCap className="size-4" aria-hidden />
                    {slide.subtitle}
                  </span>

                  <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                    {slide.title}{" "}
                    <span className="bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">
                      {slide.titleAccent}
                    </span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                    {slide.description}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      href={slide.ctaHref}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#3b82f6] px-5 text-sm font-medium text-white transition hover:bg-[#2563eb]"
                    >
                      {slide.ctaLabel}
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                    <Link
                      href="/courses"
                      className="inline-flex h-11 items-center rounded-xl border border-white/20 bg-white/5 px-5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10"
                    >
                      Browse Courses
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute inset-x-0 bottom-8 z-20 mx-auto flex w-full max-w-7xl items-center justify-end gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => swiperRef.current?.slidePrev()}
          className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => swiperRef.current?.slideNext()}
          className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </section>
  );
}
