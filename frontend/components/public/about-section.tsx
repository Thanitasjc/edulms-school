import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";

const aboutImages = {
  primary:
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
  secondary:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
};

export function AboutSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 dark:bg-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 left-8 size-3 rounded-full bg-amber-400/80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-16 bottom-24 size-2 rounded-full bg-blue-400/70"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto w-full max-w-lg lg:mx-0">
            <div className="relative grid grid-cols-2 gap-4">
              <div className="relative mt-8 overflow-hidden rounded-[1.75rem]">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={aboutImages.primary}
                    alt="Instructor teaching students"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 280px"
                  />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-black/5"
                />
              </div>

              <div className="relative overflow-hidden rounded-[1.75rem]">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={aboutImages.secondary}
                    alt="Students collaborating"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 280px"
                  />
                  <button
                    type="button"
                    aria-label="Play video"
                    className="absolute inset-0 m-auto inline-flex size-14 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg transition hover:scale-105 hover:bg-blue-600 hover:text-white"
                  >
                    <Play className="size-5 fill-current" />
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-2 left-1/2 z-10 hidden -translate-x-1/2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:block dark:border-white/10 dark:bg-slate-900">
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-500">
                <Star className="size-3.5 fill-current" />
                4.5 (3.4k Reviews)
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                Congratulations
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Education Instructors Play Crucial Role in Shaping The Lives of Their{" "}
              <span className="relative inline-block text-blue-600">
                Students
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                />
              </span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Maecenas Felis Tellus, dictum sed fermentum vel, various condiment dolour. Donec
              aliquot, denim ut auctor molestee, era elite pharetra masa, at impediment eros qualm
              sed libero. Sed arco lorem, rut rum.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[#3b82f6] px-6 text-sm font-medium text-white transition hover:bg-[#2563eb]"
            >
              More Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
