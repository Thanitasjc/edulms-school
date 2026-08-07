"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bookmark,
  Box,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardCheck,
  Clock,
  FileText,
  Languages,
  Lock,
  MessageSquare,
  Percent,
  PlayCircle,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { MediaImage } from "@/components/ui/media-image";
import { RichTextContent } from "@/components/ui/rich-text-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getStoredToken } from "@/features/auth/api";
import { purchaseCourse } from "@/features/enrollments/api";
import { getCourseProgress, lessonKey, trackLessonProgress } from "@/features/progress/api";
import { createPublicCourseReview, listPublicCourseReviews } from "@/features/reviews/api";
import {
  getPublicQuiz,
  listPublicCourseQuizzes,
  submitQuizAttempt,
  type Quiz,
} from "@/features/quiz/api";
import { useAuth } from "@/providers/auth-provider";
import { ApiClientError, apiClient } from "@/lib/api-client";
import { addToCart } from "@/lib/cart";
import { formatBaht } from "@/lib/money";
import { toYouTubeEmbedUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";

type CurriculumLesson = {
  title: string;
  duration?: string | null;
  video_type?: "youtube" | "mp4" | null;
  video_url?: string | null;
  is_preview?: boolean;
  is_locked?: boolean;
  sectionIndex?: number;
  lessonIndex?: number;
};

type PublicCourse = {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary?: string | null;
  description?: string | null;
  curriculum?: {
    summary?: string | null;
    sections?: Array<{
      title: string;
      lessons: CurriculumLesson[];
    }>;
  } | null;
  can_watch_lessons?: boolean;
  is_enrolled?: boolean;
  thumbnail_url?: string | null;
  lessons_count: number;
  students_count: number;
  duration_hours: number;
  duration_weeks?: number | null;
  skill_level?: string | null;
  language?: string | null;
  pass_percentage?: number | null;
  deadline?: string | null;
  price: number;
  sale_price?: number | null;
  is_free: boolean;
  instructor_name: string;
  instructor_title?: string | null;
  instructor_avatar_url?: string | null;
  instructor_bio?: string | null;
  instructor_slug?: string | null;
  rating: number;
  reviews_count: number;
};

type TabKey = "overview" | "curriculum" | "instructor" | "reviews" | "quiz";

const tabs: { key: TabKey; label: string; icon: typeof Bookmark }[] = [
  { key: "overview", label: "Overview", icon: Bookmark },
  { key: "curriculum", label: "Curriculum", icon: Box },
  { key: "instructor", label: "Instructor", icon: User },
  { key: "reviews", label: "Reviews", icon: MessageSquare },
  { key: "quiz", label: "Quiz", icon: ClipboardCheck },
];

function formatCategory(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDeadline(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StarRow({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5 text-amber-500", className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn("size-3.5", index < Math.round(rating) ? "fill-current" : "text-slate-300 dark:text-slate-600")}
        />
      ))}
    </div>
  );
}

function CourseDetailsContent({ course }: { course: PublicCourse }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>(
    searchParams.get("tab") === "curriculum" ? "curriculum" : "overview",
  );
  const [openSection, setOpenSection] = useState(0);
  const [activeLesson, setActiveLesson] = useState<CurriculumLesson | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [didAutoResume, setDidAutoResume] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);

  const overviewHtml = course.description || course.summary || "";
  const curriculumSections = course.curriculum?.sections ?? [];
  const curriculumSummary = course.curriculum?.summary?.trim() || "";
  const displayPrice = course.sale_price ?? course.price;
  const weeks =
    course.duration_weeks && course.duration_weeks > 0
      ? course.duration_weeks
      : Math.max(1, Math.ceil((course.duration_hours || 0) / 8) || 1);
  const categoryLabel = formatCategory(course.category || "Online Teaching");
  const youtubeEmbed = activeLesson?.video_type === "youtube" ? toYouTubeEmbedUrl(activeLesson.video_url) : null;
  const needsPurchase = !course.is_free && course.price > 0 && !course.is_enrolled;

  const { data: progress } = useQuery({
    queryKey: ["course-progress", course.slug],
    queryFn: async () => {
      const response = await getCourseProgress(course.slug);
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const completedKeys = useMemo(
    () => new Set(progress?.completed_keys ?? []),
    [progress?.completed_keys],
  );

  const progressMutation = useMutation({
    mutationFn: (input: {
      section_index: number;
      lesson_index: number;
      lesson_title?: string;
      status?: "in_progress" | "completed";
    }) => trackLessonProgress(course.slug, input),
    onSuccess: (response) => {
      void queryClient.setQueryData(["course-progress", course.slug], response.data);
      void queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      void queryClient.invalidateQueries({ queryKey: ["public-course", course.slug] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Could not save progress");
    },
  });

  const openLesson = (lesson: CurriculumLesson, sectionIndex: number, lessonIndex: number) => {
    if (lesson.is_locked || !lesson.video_url) return;
    const next = { ...lesson, sectionIndex, lessonIndex };
    setActiveLesson(next);
    setActiveTab("curriculum");
    setOpenSection(sectionIndex);

    if (isAuthenticated && (course.is_enrolled || course.is_free || course.price <= 0 || progress?.can_track)) {
      progressMutation.mutate({
        section_index: sectionIndex,
        lesson_index: lessonIndex,
        lesson_title: lesson.title,
        status: "in_progress",
      });
    }
  };

  const markLessonComplete = () => {
    if (!activeLesson || activeLesson.sectionIndex == null || activeLesson.lessonIndex == null) return;
    if (!isAuthenticated) {
      router.push(`/login?next=/courses/${course.slug}`);
      return;
    }
    progressMutation.mutate({
      section_index: activeLesson.sectionIndex,
      lesson_index: activeLesson.lessonIndex,
      lesson_title: activeLesson.title,
      status: "completed",
    });
    toast.success("Lesson marked complete");
  };

  const resumeLesson = () => {
    if (progress?.last_section_index == null || progress?.last_lesson_index == null) return;
    const section = curriculumSections[progress.last_section_index];
    const lesson = section?.lessons?.[progress.last_lesson_index];
    if (!lesson) return;
    openLesson(lesson, progress.last_section_index, progress.last_lesson_index);
  };

  useEffect(() => {
    if (didAutoResume) return;
    if (searchParams.get("tab") !== "curriculum") return;
    if (!progress?.last_lesson_key) return;
    if (progress.last_section_index == null || progress.last_lesson_index == null) return;
    resumeLesson();
    setDidAutoResume(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.last_lesson_key, searchParams, didAutoResume]);

  const activeLessonCompleted =
    activeLesson?.sectionIndex != null &&
    activeLesson?.lessonIndex != null &&
    completedKeys.has(lessonKey(activeLesson.sectionIndex, activeLesson.lessonIndex));

  const { data: reviews = [] } = useQuery({
    queryKey: ["course-reviews", course.slug],
    queryFn: async () => {
      const response = await listPublicCourseReviews(course.slug);
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: courseQuizzes = [] } = useQuery({
    queryKey: ["course-quizzes", course.slug],
    queryFn: async () => {
      const response = await listPublicCourseQuizzes(course.slug);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: activeTab === "quiz",
  });

  const { data: activeQuiz, isLoading: quizLoading } = useQuery({
    queryKey: ["public-quiz", selectedQuizId],
    queryFn: async () => {
      const response = await getPublicQuiz(selectedQuizId!);
      return response.data;
    },
    enabled: selectedQuizId != null,
  });

  const purchaseMutation = useMutation({
    mutationFn: () => purchaseCourse(course.id),
    onSuccess: () => {
      toast.success(course.is_free || course.price <= 0 ? "Enrolled successfully" : "Purchase successful");
      void queryClient.invalidateQueries({ queryKey: ["public-course", course.slug] });
      void queryClient.invalidateQueries({ queryKey: ["course-progress", course.slug] });
      void queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Purchase failed");
    },
  });

  const quizSubmitMutation = useMutation({
    mutationFn: () => submitQuizAttempt(selectedQuizId!, quizAnswers),
    onSuccess: (response) => {
      setQuizResult({ score: response.data.score, passed: response.data.passed });
      toast.success(response.data.passed ? "Quiz passed!" : "Quiz submitted");
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Could not submit quiz");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      createPublicCourseReview(course.slug, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        body: reviewBody.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Review submitted");
      setReviewTitle("");
      setReviewBody("");
      void queryClient.invalidateQueries({ queryKey: ["course-reviews", course.slug] });
      void queryClient.invalidateQueries({ queryKey: ["public-course", course.slug] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Could not submit review");
    },
  });

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const review of reviews) {
      const score = Math.min(5, Math.max(1, review.rating)) as 1 | 2 | 3 | 4 | 5;
      counts[score] += 1;
    }
    return counts;
  }, [reviews]);

  const handlePurchase = () => {
    if (!isAuthenticated) {
      router.push(`/login?next=/courses/${course.slug}`);
      return;
    }
    purchaseMutation.mutate();
  };

  const sidebarItems = useMemo(
    () => [
      { icon: Clock, label: "Duration", value: `${weeks} Weeks` },
      { icon: Users, label: "Students", value: String(course.students_count) },
      { icon: FileText, label: "Lessons", value: String(course.lessons_count) },
      { icon: TrendingUp, label: "Skill Level", value: course.skill_level?.trim() || "—" },
      { icon: Languages, label: "Language", value: course.language?.trim() || "—" },
      { icon: User, label: "Instructor", value: course.instructor_name || "—" },
      {
        icon: Percent,
        label: "Pass Percentage",
        value: course.pass_percentage != null ? `${course.pass_percentage}%` : "—",
      },
      { icon: CalendarDays, label: "Deadline", value: formatDeadline(course.deadline) },
    ],
    [course, weeks],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mb-10 aspect-[1290/570] overflow-hidden rounded-[1.75rem] bg-slate-100 dark:bg-slate-900">
        {course.thumbnail_url ? (
          <MediaImage
            src={course.thumbnail_url}
            alt={course.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1290px"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-sky-100 via-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-950" />
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {course.title}
              </h2>

              <div className="mt-6 flex flex-wrap gap-6 sm:gap-8">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    {course.instructor_avatar_url ? (
                      <MediaImage
                        src={course.instructor_avatar_url}
                        alt={course.instructor_name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Teacher</p>
                    <Link
                      href={course.instructor_slug ? `/instructors/${course.instructor_slug}` : "/instructors"}
                      className="text-sm font-semibold text-slate-900 transition hover:text-blue-600 dark:text-white"
                    >
                      {course.instructor_name}
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Categories</p>
                  <Link
                    href={`/courses?category=${encodeURIComponent(course.category)}`}
                    className="text-sm font-semibold text-slate-900 transition hover:text-blue-600 dark:text-white"
                  >
                    {categoryLabel}
                  </Link>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Review</p>
                  <StarRow rating={course.rating} className="mt-1" />
                </div>
              </div>
            </div>

            {(course.is_free || course.price === 0) && (
              <span className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-medium text-white dark:bg-white dark:text-slate-900">
                Free
              </span>
            )}
          </div>

          <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-1 dark:border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
                  )}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "overview" && (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950 sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Courses Description</h3>
              <div className="mt-4">
                <RichTextContent
                  html={overviewHtml}
                  emptyFallback="Course description will appear here once published."
                />
              </div>
            </div>
          )}

          {activeTab === "curriculum" && (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950 sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Course Curriculum</h3>
              {curriculumSummary ? (
                <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">{curriculumSummary}</p>
              ) : null}

              {needsPurchase ? (
                <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                  {isAuthenticated
                    ? "This is a paid course. Purchase to unlock all lessons. Preview lessons stay free."
                    : "This is a paid course. Sign in and purchase to unlock all lessons. Preview lessons stay free."}{" "}
                  {!isAuthenticated ? (
                    <Link href="/login" className="font-medium underline">
                      Sign in
                    </Link>
                  ) : null}
                </p>
              ) : null}

              {activeLesson && !activeLesson.is_locked && activeLesson.video_url ? (
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-black dark:border-white/10">
                  <div className="flex items-center justify-between gap-3 bg-slate-900 px-4 py-3 text-sm text-white">
                    <span className="truncate font-medium">{activeLesson.title}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      {isAuthenticated ? (
                        <button
                          type="button"
                          className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium hover:bg-white/20 disabled:opacity-60"
                          disabled={progressMutation.isPending || activeLessonCompleted}
                          onClick={markLessonComplete}
                        >
                          {activeLessonCompleted ? "Completed" : "Mark complete"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="text-white/70 hover:text-white"
                        onClick={() => setActiveLesson(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  {activeLesson.video_type === "mp4" ? (
                    <video
                      key={activeLesson.video_url}
                      controls
                      autoPlay
                      className="aspect-video w-full bg-black"
                      src={activeLesson.video_url}
                      onEnded={() => {
                        if (!activeLessonCompleted) markLessonComplete();
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : youtubeEmbed ? (
                    <iframe
                      key={youtubeEmbed}
                      title={activeLesson.title}
                      src={`${youtubeEmbed}?autoplay=1`}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="p-6 text-sm text-white/80">Invalid video URL.</div>
                  )}
                </div>
              ) : null}

              {isAuthenticated && (progress?.total_lessons ?? 0) > 0 ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Your progress</p>
                      <p className="text-xs text-slate-500">
                        {progress?.completed_lessons ?? 0}/{progress?.total_lessons ?? 0} lessons ·{" "}
                        {progress?.progress_percent ?? 0}%
                      </p>
                    </div>
                    {progress?.last_lesson_key ? (
                      <Button type="button" size="sm" variant="outline" onClick={resumeLesson}>
                        Continue learning
                      </Button>
                    ) : null}
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${progress?.progress_percent ?? 0}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="mt-6 space-y-3">
                {curriculumSections.length === 0 ? (
                  <p className="text-sm text-slate-500">Curriculum will appear here once published.</p>
                ) : (
                  curriculumSections.map((section, index) => {
                    const open = openSection === index;

                    return (
                      <div
                        key={`${section.title}-${index}`}
                        className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenSection(open ? -1 : index)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold transition",
                            open
                              ? "bg-blue-600 text-white"
                              : "bg-slate-50 text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800",
                          )}
                        >
                          {section.title}
                          <ChevronDown className={cn("size-4 shrink-0 transition", open && "rotate-180")} />
                        </button>
                        {open ? (
                          <ul className="divide-y divide-slate-100 dark:divide-white/10">
                            {(section.lessons ?? []).map((lesson, lessonIndex) => {
                              const locked = Boolean(lesson.is_locked);
                              const playable = !locked && Boolean(lesson.video_url);
                              const key = lessonKey(index, lessonIndex);
                              const done = completedKeys.has(key);

                              return (
                                <li key={`${section.title}-${lesson.title}-${lessonIndex}`}>
                                  <button
                                    type="button"
                                    className={cn(
                                      "flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left text-sm transition",
                                      playable
                                        ? "hover:bg-slate-50 dark:hover:bg-white/5"
                                        : "cursor-not-allowed opacity-80",
                                    )}
                                    onClick={() => openLesson(lesson, index, lessonIndex)}
                                  >
                                    <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                      {done ? (
                                        <CheckCircle2 className="size-4 text-emerald-500" />
                                      ) : playable ? (
                                        <PlayCircle className="size-4 text-red-500" />
                                      ) : (
                                        <Circle className="size-4 text-slate-400" />
                                      )}
                                      <span>
                                        {lesson.title}
                                        {lesson.is_preview ? (
                                          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                                            Preview
                                          </span>
                                        ) : null}
                                      </span>
                                    </span>
                                    <span className="inline-flex items-center gap-2 text-slate-500">
                                      {lesson.duration || "—"}
                                      {locked ? <Lock className="size-3.5" /> : null}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "instructor" && (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="relative mx-auto aspect-[410/470] w-full max-w-[220px] overflow-hidden rounded-[1.5rem] bg-slate-100 sm:mx-0 dark:bg-slate-900">
                  {course.instructor_avatar_url ? (
                    <MediaImage
                      src={course.instructor_avatar_url}
                      alt={course.instructor_name}
                      fill
                      className="object-cover"
                      sizes="220px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {course.instructor_name || "Instructor"}
                  </h3>
                  <p className="mt-1 text-sm text-blue-600">
                    {course.instructor_title?.trim() || "Lead Instructor"}
                  </p>
                  {course.instructor_bio?.trim() ? (
                    <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                      {course.instructor_bio}
                    </p>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">Instructor bio will appear here once published.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950 sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Student Ratings & Reviews</h3>
              <div className="mt-6 grid gap-8 sm:grid-cols-12 sm:items-center">
                <div className="text-center sm:col-span-4">
                  <p className="text-5xl font-semibold text-slate-900 dark:text-white">
                    {course.rating.toFixed(1)}
                  </p>
                  <StarRow rating={course.rating} className="mt-3 justify-center" />
                  <p className="mt-2 text-sm text-slate-500">({course.reviews_count} Reviews)</p>
                </div>
                <ul className="space-y-3 sm:col-span-8">
                  {[5, 4, 3, 2, 1].map((score) => {
                    const count = ratingCounts[score as 1 | 2 | 3 | 4 | 5] ?? 0;
                    const width = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;

                    return (
                      <li key={score} className="flex items-center gap-3 text-sm">
                        <span className="inline-flex w-10 items-center gap-1 text-slate-600 dark:text-slate-300">
                          {score} <Star className="size-3 fill-amber-500 text-amber-500" />
                        </span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <span className="block h-full rounded-full bg-amber-400" style={{ width: `${width}%` }} />
                        </span>
                        <span className="w-6 text-right text-slate-500">{count}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-10 space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {review.user?.name ?? "Student"}
                      </p>
                      <StarRow rating={review.rating} />
                    </div>
                    {review.title ? (
                      <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{review.title}</p>
                    ) : null}
                    {review.body ? (
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{review.body}</p>
                    ) : null}
                  </article>
                ))}
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-500">No reviews yet. Be the first to share feedback.</p>
                ) : null}
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                <h4 className="font-semibold text-slate-900 dark:text-white">Write a review</h4>
                {!isAuthenticated ? (
                  <p className="mt-2 text-sm text-slate-500">
                    <Link href="/login" className="text-blue-600 underline">
                      Sign in
                    </Link>{" "}
                    to leave a review.
                  </p>
                ) : (
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      reviewMutation.mutate();
                    }}
                  >
                    <label className="block text-sm">
                      Rating
                      <select
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-900"
                        value={reviewRating}
                        onChange={(event) => setReviewRating(Number(event.target.value))}
                      >
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>
                            {value} stars
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input
                      placeholder="Title (optional)"
                      value={reviewTitle}
                      onChange={(event) => setReviewTitle(event.target.value)}
                    />
                    <Textarea
                      rows={4}
                      placeholder="Share your experience..."
                      value={reviewBody}
                      onChange={(event) => setReviewBody(event.target.value)}
                    />
                    <Button type="submit" disabled={reviewMutation.isPending}>
                      {reviewMutation.isPending ? "Submitting..." : "Submit review"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950 sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Course Quiz</h3>
              <p className="mt-2 text-sm text-slate-500">
                Test your knowledge. Pass the quiz to demonstrate course mastery.
              </p>

              {courseQuizzes.length === 0 ? (
                <p className="mt-6 text-sm text-slate-500">No quizzes available for this course yet.</p>
              ) : (
                <div className="mt-6 space-y-6">
                  {!selectedQuizId ? (
                    <ul className="space-y-3">
                      {courseQuizzes.map((quiz: Quiz) => (
                        <li key={quiz.id}>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-5 py-4 text-left transition hover:border-blue-200 hover:bg-slate-50 dark:border-white/10 dark:hover:border-blue-500/30 dark:hover:bg-white/5"
                            onClick={() => {
                              setSelectedQuizId(quiz.id);
                              setQuizAnswers({});
                              setQuizResult(null);
                            }}
                          >
                            <span className="font-medium text-slate-900 dark:text-white">{quiz.title}</span>
                            <span className="text-xs text-slate-500">Pass: {quiz.pass_percentage}%</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:underline"
                        onClick={() => {
                          setSelectedQuizId(null);
                          setQuizAnswers({});
                          setQuizResult(null);
                        }}
                      >
                        ← Back to quiz list
                      </button>

                      {quizLoading || !activeQuiz ? (
                        <p className="text-sm text-slate-500">Loading quiz...</p>
                      ) : quizResult ? (
                        <div
                          className={cn(
                            "rounded-2xl border p-6 text-center",
                            quizResult.passed
                              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                              : "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10",
                          )}
                        >
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {quizResult.passed ? "Congratulations!" : "Quiz completed"}
                          </p>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Score: {quizResult.score.toFixed(0)}% ·{" "}
                            {quizResult.passed ? "Passed" : "Did not pass"} (required {activeQuiz.pass_percentage}%)
                          </p>
                        </div>
                      ) : (
                        <form
                          className="space-y-6"
                          onSubmit={(event) => {
                            event.preventDefault();
                            if (!isAuthenticated) {
                              router.push(`/login?next=/courses/${course.slug}`);
                              return;
                            }
                            quizSubmitMutation.mutate();
                          }}
                        >
                          {(activeQuiz.questions ?? []).map((q, index) => (
                            <fieldset
                              key={q.id ?? index}
                              className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5"
                            >
                              <legend className="px-1 text-sm font-semibold text-slate-900 dark:text-white">
                                {index + 1}. {q.question}
                              </legend>
                              <ul className="mt-3 space-y-2">
                                {(q.options ?? []).map((option) => (
                                  <li key={option.key}>
                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white dark:hover:bg-slate-900">
                                      <input
                                        type="radio"
                                        name={`question-${q.id ?? index}`}
                                        value={option.key}
                                        checked={quizAnswers[String(q.id ?? index)] === option.key}
                                        onChange={() =>
                                          setQuizAnswers((prev) => ({
                                            ...prev,
                                            [String(q.id ?? index)]: option.key,
                                          }))
                                        }
                                        className="size-4"
                                      />
                                      <span>
                                        <span className="font-medium">{option.key}.</span> {option.text}
                                      </span>
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            </fieldset>
                          ))}

                          {!isAuthenticated ? (
                            <p className="text-sm text-slate-500">
                              <Link href={`/login?next=/courses/${course.slug}`} className="text-blue-600 underline">
                                Sign in
                              </Link>{" "}
                              to submit your answers.
                            </p>
                          ) : (
                            <Button type="submit" disabled={quizSubmitMutation.isPending}>
                              {quizSubmitMutation.isPending ? "Submitting..." : "Submit quiz"}
                            </Button>
                          )}
                        </form>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950">
            <div className="border-b border-slate-100 px-6 py-6 dark:border-white/10">
              {course.sale_price != null ? (
                <div className="flex items-end gap-3">
                  <del className="text-base text-slate-400">{formatBaht(course.price)}</del>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {formatBaht(displayPrice)}
                  </p>
                </div>
              ) : (
                <p className="text-3xl font-semibold text-slate-900 dark:text-white">
                  {formatBaht(displayPrice)}
                </p>
              )}
            </div>

            <ul className="divide-y divide-slate-100 px-2 dark:divide-white/10">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm">
                    <span className="inline-flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                      <Icon className="size-4 text-slate-400" />
                      {item.label}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{item.value}</span>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-3 p-5">
              {course.is_enrolled ? (
                <span className="inline-flex h-12 w-full items-center justify-center rounded-full bg-emerald-600 text-sm font-medium text-white">
                  Enrolled
                </span>
              ) : (
                <>
                  <Button
                    type="button"
                    className="h-12 w-full rounded-full bg-blue-600 text-sm font-medium text-white hover:bg-blue-500"
                    disabled={purchaseMutation.isPending}
                    onClick={handlePurchase}
                  >
                    {purchaseMutation.isPending
                      ? "Processing..."
                      : course.is_free || course.price <= 0
                        ? "Enroll Free"
                        : "Purchase Now"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-full"
                    onClick={() => {
                      addToCart({
                        id: course.id,
                        slug: course.slug,
                        title: course.title,
                        category: course.category,
                        price: course.price,
                        salePrice: course.sale_price,
                        isFree: course.is_free,
                        thumbnailUrl: course.thumbnail_url,
                        instructorName: course.instructor_name,
                      });
                      toast.success("Added to cart");
                    }}
                  >
                    Add to Cart
                  </Button>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-course", slug, isAuthenticated],
    queryFn: async () => {
      const response = await apiClient<PublicCourse>(`/public/courses/${slug}`, {
        token: getStoredToken(),
      });
      return response.data;
    },
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <>
        <PageBreadcrumb
          title="Course Details"
          items={[{ label: "Courses", href: "/courses" }, { label: "Course Details" }]}
        />
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-200 dark:bg-slate-800" />
        </div>
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <PageBreadcrumb
          title="Course Details"
          items={[{ label: "Courses", href: "/courses" }, { label: "Not Found" }]}
        />
        <div className="mx-auto w-full max-w-7xl px-4 py-10 text-center sm:px-6 lg:px-8">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Course not found</p>
          <Link href="/courses" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to courses
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadcrumb
        title="Course Details"
        items={[{ label: "Courses", href: "/courses" }, { label: "Course Details" }]}
      />
      <CourseDetailsContent course={data} />
    </>
  );
}
