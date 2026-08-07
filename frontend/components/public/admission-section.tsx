"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

const benefits = [
  "Teach your way",
  "Record your video",
  "Plan your curriculum",
  "Launch your course",
];

const fieldClassName =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

export function AdmissionSection() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#eef4ff] via-[#f5f8fc] to-[#e8f0fb] py-20 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 size-[28rem] rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 size-72 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-xl">
            <span className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
              Education Admissions
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Bridge Opportunity Gap Support Access Education!
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Maecenas Felis Tellus, dictum sed fermentum vel, various condiment dolour donec
              aliquot denim ut auctor molestee, era elite pharetra masa.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="mt-9 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Apply Now
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-slate-950 sm:p-8">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Admissions
            </h3>

            {submitted ? (
              <div className="mt-8 rounded-2xl bg-emerald-50 px-5 py-8 text-center dark:bg-emerald-950/30">
                <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                  Application received
                </p>
                <p className="mt-2 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                  Thanks for applying. Create an account to continue onboarding.
                </p>
                <Link
                  href="/register"
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Continue to Register
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <form
                className="mt-6"
                onSubmit={handleSubmit}
                aria-describedby="admission-form-description"
              >
                <p id="admission-form-description" className="sr-only">
                  Fill out this admission application form. All fields are required.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={fieldClassName} name="firstName" placeholder="First Name" required aria-label="First Name" />
                  <input className={fieldClassName} name="lastName" placeholder="Last Name" required aria-label="Last Name" />
                  <input className={fieldClassName} type="email" name="email" placeholder="Email" required aria-label="Email Address" />
                  <input className={fieldClassName} type="tel" name="phone" placeholder="Phone" required aria-label="Phone Number" />
                  <input className={fieldClassName} name="streetAddress" placeholder="Street Address" required aria-label="Street Address" />
                  <input className={fieldClassName} name="city" placeholder="City" required aria-label="City" />
                  <input className={fieldClassName} name="state" placeholder="State" required aria-label="State" />
                  <input className={fieldClassName} name="zipCode" placeholder="Zip Code" required aria-label="Zip Code" />
                  <input className={`${fieldClassName} sm:col-span-2`} type="date" name="dateOfBirth" required aria-label="Date of Birth" />
                  <textarea
                    className={`${fieldClassName} h-28 resize-none py-3 sm:col-span-2`}
                    name="academicQualifications"
                    placeholder="Academic Qualifications"
                    required
                    aria-label="Academic Qualifications"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  aria-label="Submit admission application"
                >
                  Submit Form
                  <ArrowRight className="size-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
