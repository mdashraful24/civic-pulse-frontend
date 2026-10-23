import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  CategoryTile,
  PriorityBadge,
  StatusBadge,
} from "@/components/issues/issue-badges";
import { categoryLabels } from "@/lib/constants";
import { cn, timeAgo, truncate } from "@/lib/format";
import type { Issue } from "@/lib/types";

export function IssueCard({
  issue,
  className,
  compact = false,
}: {
  issue: Issue;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/issues/${issue.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-lg hover:shadow-ink/5",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-stone-100",
          compact ? "h-28" : "aspect-[16/9]",
        )}
      >
        {issue.imageUrl ? (
          <Image
            src={issue.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_25%_20%,#dbe9e1,transparent_55%),radial-gradient(circle_at_80%_85%,#f7e2bd,transparent_50%)]">
            <CategoryTile
              category={issue.category}
              className="h-14 w-14 rounded-2xl bg-white/80 shadow-sm"
            />
          </div>
        )}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
          <span>{categoryLabels[issue.category]}</span>
          <span className="h-1 w-1 rounded-full bg-stone-300" />
          <span>{timeAgo(issue.createdAt)}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-ink transition group-hover:text-brand">
          {issue.title}
        </h3>
        {compact ? null : (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">
            {truncate(issue.description, 130)}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line/70 pt-3.5 text-xs text-stone-500">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" />
            <span className="truncate">{issue.location}</span>
          </span>
          {issue.assignee ? (
            <span className="shrink-0 text-[11px] text-stone-400">
              {issue.assignee.name.split(" ")[0]}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
