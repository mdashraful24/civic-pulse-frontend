import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/feedback";
import { cn, formatNumber } from "@/lib/format";

const tones = {
  brand: "bg-brand-soft text-brand",
  amber: "bg-amber-50 text-amber-700",
  sky: "bg-sky-50 text-sky-700",
  emerald: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  stone: "bg-stone-100 text-stone-600",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  loading = false,
}: {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            {label}
          </p>
          <div className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {loading ? <Skeleton className="h-8 w-14" /> : formatNumber(value)}
          </div>
        </div>
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {hint ? <p className="mt-3 text-xs text-stone-500">{hint}</p> : null}
    </div>
  );
}
