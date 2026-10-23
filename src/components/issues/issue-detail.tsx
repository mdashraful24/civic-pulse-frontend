"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  History,
  MapPin,
  MessageSquareText,
  PencilRuler,
  Share2,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import {
  CategoryTile,
  PriorityBadge,
  StatusBadge,
} from "@/components/issues/issue-badges";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { api, getApiErrorMessage } from "@/lib/api";
import { categoryLabels, statusLabels } from "@/lib/constants";
import { formatDateTime, timeAgo, truncate } from "@/lib/format";
import type { IssueHistoryEntry } from "@/lib/types";

export function IssueDetail({ issueId }: { issueId: string }) {
  const { user } = useAuth();
  const issueQuery = useQuery({
    queryKey: ["issue", issueId],
    queryFn: () => api.issues.get(issueId),
  });
  const historyQuery = useQuery({
    queryKey: ["issue", issueId, "history"],
    queryFn: () => api.issues.history(issueId),
  });

  const issue = issueQuery.data;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  if (issueQuery.isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-36" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-[360px] rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      </main>
    );
  }

  if (issueQuery.isError || !issue) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <MessageSquareText className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          This report could not be loaded.
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
          {getApiErrorMessage(issueQuery.error)}
        </p>
        <Link
          href="/issues"
          className={buttonStyles({ variant: "outline", className: "mt-6" })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all issues
        </Link>
      </main>
    );
  }

  const history = historyQuery.data ?? [];

  return (
    <main className="flex-1">
      <section className="border-b border-line bg-[#f3efe6]">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/issues"
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-brand"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to issues
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" />
                Copy link
              </Button>
              {user?.role === "ADMIN" ? (
                <Link
                  href={`/dashboard/manage?issue=${issue.id}`}
                  className={buttonStyles({ size: "sm" })}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Manage
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
            <Badge className="bg-white text-stone-600 ring-line">
              <CategoryTile
                category={issue.category}
                className="h-4 w-4 bg-transparent p-0 text-current"
              />
              {categoryLabels[issue.category]}
            </Badge>
            <span className="text-xs text-stone-500">
              Reported {timeAgo(issue.createdAt)}
            </span>
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-4xl">
            {issue.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand" />
              {issue.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDateTime(issue.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-4 w-4" />
              Reported by {issue.reporter.name}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_0.8fr] lg:px-8 lg:py-10">
        <div className="space-y-5">
          {issue.imageUrl ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-stone-100 shadow-sm">
              <Image
                src={issue.imageUrl}
                alt={issue.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/8] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white text-center">
              <CategoryTile category={issue.category} className="h-14 w-14" />
              <p className="mt-3 text-sm font-semibold text-stone-600">
                No photo was attached to this report.
              </p>
            </div>
          )}

          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <PencilRuler className="h-4 w-4 text-brand" />
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">
                What was reported
              </h2>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-stone-700">
              {issue.description}
            </p>
          </section>

          {issue.status === "RESOLVED" && issue.resolutionNote ? (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                <h2 className="text-sm font-bold uppercase tracking-[0.12em]">
                  Resolution note
                </h2>
              </div>
              <p className="mt-3 text-[15px] leading-7 text-emerald-900/80">
                {issue.resolutionNote}
              </p>
              {issue.resolvedAt ? (
                <p className="mt-3 text-xs text-emerald-700/80">
                  Resolved {formatDateTime(issue.resolvedAt)}
                </p>
              ) : null}
            </section>
          ) : null}

          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-brand" />
                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">
                  Public timeline
                </h2>
              </div>
              {historyQuery.isFetching ? (
                <span className="text-[11px] text-stone-400">Refreshing…</span>
              ) : null}
            </div>

            {historyQuery.isLoading ? (
              <div className="mt-5 space-y-4">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : history.length > 0 ? (
              <Timeline history={history} />
            ) : (
              <p className="mt-5 text-sm text-stone-500">
                No timeline entries are available yet.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">
              Issue details
            </h2>
            <dl className="mt-4 divide-y divide-line/70">
              <InfoRow
                label="Status"
                value={<StatusBadge status={issue.status} />}
              />
              <InfoRow
                label="Priority"
                value={<PriorityBadge priority={issue.priority} />}
              />
              <InfoRow
                label="Category"
                value={
                  <span className="text-sm font-semibold text-ink">
                    {categoryLabels[issue.category]}
                  </span>
                }
              />
              <InfoRow
                label="Location"
                value={
                  <span className="text-right text-sm font-medium text-ink">
                    {issue.location}
                  </span>
                }
              />
              <InfoRow
                label="Last update"
                value={
                  <span className="text-right text-sm font-medium text-ink">
                    {timeAgo(issue.updatedAt)}
                  </span>
                }
              />
            </dl>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">
              People
            </h2>
            <div className="mt-4 space-y-4">
              <PersonRow
                label="Reported by"
                name={issue.reporter.name}
                imageUrl={issue.reporter.imageUrl}
              />
              {issue.assignee ? (
                <PersonRow
                  label="Assigned to"
                  name={issue.assignee.name}
                  imageUrl={issue.assignee.imageUrl}
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-stone-500">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                      Assigned to
                    </p>
                    <p className="text-sm font-medium text-stone-600">
                      Awaiting assignment
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-brand/15 bg-brand-soft/60 p-5">
            <div className="flex items-center gap-2 text-brand">
              <Share2 className="h-4 w-4" />
              <p className="text-sm font-bold">Keep the conversation going</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-600">
              Share this report with a neighbour so more people can follow the
              progress.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 bg-white"
              onClick={copyLink}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy report link
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-xs font-medium text-stone-500">{label}</dt>
      <dd className="min-w-0">{value}</dd>
    </div>
  );
}

function PersonRow({
  label,
  name,
  imageUrl,
}: {
  label: string;
  name: string;
  imageUrl: string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
      <Avatar name={name} src={imageUrl} size="sm" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-ink">{name}</p>
      </div>
    </div>
  );
}

function Timeline({ history }: { history: IssueHistoryEntry[] }) {
  return (
    <ol className="mt-5 space-y-0">
      {history.map((entry, index) => (
        <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
          {index < history.length - 1 ? (
            <span className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-line" />
          ) : null}
          <span className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white text-brand">
            {entry.newStatus === "RESOLVED" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : entry.newStatus === "IN_PROGRESS" ? (
              <Clock3 className="h-4 w-4 text-sky-600" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            )}
          </span>
          <div className="min-w-0 pt-1">
            <p className="text-sm font-semibold text-ink">
              {entry.oldStatus
                ? `Moved from ${statusLabels[entry.oldStatus]} to ${statusLabels[entry.newStatus]}`
                : `Reported as ${statusLabels[entry.newStatus]}`}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {entry.changedBy.name} · {formatDateTime(entry.createdAt)}
            </p>
            {entry.note ? (
              <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-sm leading-6 text-stone-600">
                {truncate(entry.note, 400)}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
