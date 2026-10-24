import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("h-5 w-5 animate-spin text-brand", className)}
      aria-hidden="true"
    />
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3">
      <Spinner className="h-7 w-7" />
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-stone-200/70 dark:bg-white/5",
        className,
      )}
    >
      <div className="skeleton-shimmer absolute inset-0 bg-linear-to-r from-transparent via-black/5 to-transparent dark:via-white/10" />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-stone-500">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
