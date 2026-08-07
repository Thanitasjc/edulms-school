import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatBaht } from "@/lib/money";

export type CourseCardProps = {
  slug: string;
  title: string;
  category: string;
  lessons: number;
  students: number;
  hours: number;
  price: number;
  salePrice?: number | null;
  instructor: string;
  rating?: number;
};

export function CourseCard({
  slug,
  title,
  category,
  lessons,
  students,
  hours,
  price,
  salePrice,
  instructor,
  rating = 0,
}: CourseCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-slate-950">
      <div className="aspect-[16/10] bg-gradient-to-br from-sky-100 via-indigo-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950" />
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">{category}</Badge>
          {rating > 0 ? <span className="text-xs text-slate-500">{rating.toFixed(1)} rating</span> : null}
        </div>
        <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          <Link href={`/courses/${slug}`} className="hover:text-blue-600">
            {title}
          </Link>
        </h3>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span>{lessons} Lessons</span>
          <span>{students} Students</span>
          <span>{hours} Hours</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
          <p className="text-sm text-slate-600 dark:text-slate-300">By {instructor}</p>
          <div className="text-right">
            {salePrice != null ? (
              <>
                <span className="mr-2 text-xs text-slate-400 line-through">{formatBaht(price)}</span>
                <span className="font-semibold text-blue-600">{formatBaht(salePrice)}</span>
              </>
            ) : price === 0 ? (
              <span className="font-semibold text-emerald-600">Free</span>
            ) : (
              <span className="font-semibold text-slate-900 dark:text-white">{formatBaht(price)}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
