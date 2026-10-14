import { CATEGORY_META, type Category } from "@shared/ai-act-rules";

const TONE: Record<string, string> = {
  red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900",
  orange: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-900",
  amber: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900",
  green: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900",
};

export function CategoryBadge({ category, long = false }: { category: Category; long?: boolean }) {
  const meta = CATEGORY_META[category];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONE[meta.tone]}`}>
      {long ? meta.label : meta.short}
    </span>
  );
}
