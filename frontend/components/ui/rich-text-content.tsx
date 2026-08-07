import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

type RichTextContentProps = {
  html?: string | null;
  className?: string;
  emptyFallback?: string;
};

function normalizeHtml(html?: string | null) {
  const trimmed = (html ?? "").trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
}

export function RichTextContent({ html, className, emptyFallback }: RichTextContentProps) {
  const safe = DOMPurify.sanitize(normalizeHtml(html), {
    USE_PROFILES: { html: true },
  });

  if (!safe) {
    if (!emptyFallback) return null;
    return <p className="leading-relaxed text-slate-600 dark:text-slate-300">{emptyFallback}</p>;
  }

  return (
    <div className={cn("rich-text", className)} dangerouslySetInnerHTML={{ __html: safe }} />
  );
}
