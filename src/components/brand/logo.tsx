import { Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/format";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 font-bold tracking-tight text-ink",
        className,
      )}
      aria-label="CivicPulse home"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm shadow-brand/25 transition group-hover:-rotate-3">
        <Activity className="h-5 w-5" strokeWidth={2.4} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-accent" />
      </span>
      {compact ? null : (
        <span className="text-[19px] leading-none">
          Civic<span className="text-brand">Pulse</span>
        </span>
      )}
    </Link>
  );
}
