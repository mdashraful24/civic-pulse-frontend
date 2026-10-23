"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FilePlus2,
  Inbox,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { StatCard } from "@/components/dashboard/stat-card";
import { CategoryTile, StatusBadge } from "@/components/issues/issue-badges";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, PageLoader, Skeleton } from "@/components/ui/feedback";
import { api, getApiErrorMessage } from "@/lib/api";
import { cn, formatNumber, timeAgo } from "@/lib/format";
import type { Role } from "@/lib/types";

const roleCopy: Record<
  Role,
  { eyebrow: string; title: string; description: string }
> = {
  CITIZEN: {
    eyebrow: "Citizen workspace",
    title: "Your neighbourhood, in your hands.",
    description:
      "Report a problem, follow its progress and see the moment it gets resolved.",
  },
  ADMIN: {
    eyebrow: "Administrator workspace",
    title: "Keep the whole city moving.",
    description:
      "Triage new reports, assign the right people and keep every status honest.",
  },
  PERSONNEL: {
    eyebrow: "Field team workspace",
    title: "Your assigned work, in one place.",
    description:
      "Pick up an issue, move it to in progress and close it out with a clear note.",
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const statsQuery = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: api.dashboard.stats,
  });

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-6xl py-12">
        <PageLoader label="Loading dashboard..." />
      </div>
    );
  }

  const copy = roleCopy[user.role];
  const stats = statsQuery.data;
  const total = stats?.total ?? 0;
  const percentage = (value: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-brand px-5 py-7 text-white shadow-lg shadow-brand/15 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              {copy.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.role === "CITIZEN" ? (
              <>
                <Link
                  href="/dashboard/report"
                  className={buttonStyles({
                    variant: "secondary",
                    size: "sm",
                  })}
                >
                  <FilePlus2 className="h-4 w-4" />
                  Report an issue
                </Link>
                <Link
                  href="/dashboard/my-issues"
                  className={buttonStyles({
                    variant: "outline",
                    size: "sm",
                    className:
                      "border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/15",
                  })}
                >
                  My issues
                </Link>
              </>
            ) : user.role === "ADMIN" ? (
              <>
                <Link
                  href="/dashboard/manage"
                  className={buttonStyles({
                    variant: "secondary",
                    size: "sm",
                  })}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Manage issues
                </Link>
                <Link
                  href="/dashboard/users"
                  className={buttonStyles({
                    variant: "outline",
                    size: "sm",
                    className:
                      "border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/15",
                  })}
                >
                  <Users className="h-4 w-4" />
                  People
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard/assigned"
                className={buttonStyles({
                  variant: "secondary",
                  size: "sm",
                })}
              >
                <Wrench className="h-4 w-4" />
                View assigned work
              </Link>
            )}
          </div>
        </div>
      </section>

      {statsQuery.isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <p className="font-semibold">Dashboard statistics could not load.</p>
          <p className="mt-1">{getApiErrorMessage(statsQuery.error)}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 bg-white"
            onClick={() => statsQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total issues"
          value={stats?.total ?? 0}
          hint={
            stats
              ? stats.scope === "ALL"
                ? "Every report in the system"
                : stats.scope === "ASSIGNED"
                  ? "Work assigned to you"
                  : "Reports you have shared"
              : undefined
          }
          icon={ClipboardList}
          loading={statsQuery.isLoading}
        />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          hint="Waiting for triage or assignment"
          icon={Clock3}
          tone="amber"
          loading={statsQuery.isLoading}
        />
        <StatCard
          label="In progress"
          value={stats?.inProgress ?? 0}
          hint="Currently being worked on"
          icon={TrendingUp}
          tone="sky"
          loading={statsQuery.isLoading}
        />
        <StatCard
          label="Resolved"
          value={stats?.resolved ?? 0}
          hint="Closed with a resolution note"
          icon={CheckCircle2}
          tone="emerald"
          loading={statsQuery.isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
                Recent activity
              </p>
              <h3 className="mt-1 text-lg font-bold tracking-tight text-ink">
                Latest reports
              </h3>
            </div>
            <Link
              href={
                user.role === "CITIZEN"
                  ? "/dashboard/my-issues"
                  : user.role === "PERSONNEL"
                    ? "/dashboard/assigned"
                    : "/dashboard/manage"
              }
              className="text-xs font-semibold text-brand hover:text-brand-dark"
            >
              View all →
            </Link>
          </div>

          <div className="mt-4">
            {statsQuery.isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : stats?.recentIssues.length ? (
              <div className="divide-y divide-line/70">
                {stats.recentIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <CategoryTile category={issue.category} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink transition group-hover:text-brand">
                        {issue.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-stone-500">
                        <span className="truncate">{issue.location}</span>
                        <span>·</span>
                        <span>{timeAgo(issue.createdAt)}</span>
                      </p>
                    </div>
                    <StatusBadge status={issue.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Inbox className="h-5 w-5" />}
                title="Nothing here yet"
                description={
                  user.role === "CITIZEN"
                    ? "Your reports will appear here once you create your first issue."
                    : "There are no issues in this workspace yet."
                }
                className="border-0 bg-transparent py-8"
                action={
                  user.role === "CITIZEN" ? (
                    <Link
                      href="/dashboard/report"
                      className={buttonStyles({ size: "sm" })}
                    >
                      Report an issue
                    </Link>
                  ) : undefined
                }
              />
            )}
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
              Status breakdown
            </p>
            <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-stone-100">
              <div
                className="bg-amber-400"
                style={{ width: `${percentage(stats?.pending ?? 0)}%` }}
              />
              <div
                className="bg-sky-400"
                style={{ width: `${percentage(stats?.inProgress ?? 0)}%` }}
              />
              <div
                className="bg-emerald-500"
                style={{ width: `${percentage(stats?.resolved ?? 0)}%` }}
              />
            </div>
            <div className="mt-4 space-y-2.5">
              <BreakdownRow
                label="Pending"
                value={stats?.pending ?? 0}
                total={total}
                dot="bg-amber-400"
              />
              <BreakdownRow
                label="In progress"
                value={stats?.inProgress ?? 0}
                total={total}
                dot="bg-sky-400"
              />
              <BreakdownRow
                label="Resolved"
                value={stats?.resolved ?? 0}
                total={total}
                dot="bg-emerald-500"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  {formatNumber(stats?.highPriority ?? 0)} high-priority reports
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-800/80">
                  These need a faster response. Review them before they age.
                </p>
                <Link
                  href={
                    user.role === "ADMIN"
                      ? "/dashboard/manage"
                      : user.role === "PERSONNEL"
                        ? "/dashboard/assigned"
                        : "/dashboard/my-issues"
                  }
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:underline"
                >
                  Review reports
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-[#fbfaf6] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
              Good to know
            </p>
            <p className="mt-2 text-xs leading-5 text-stone-600">
              Every status change is recorded on the public timeline, so
              residents always know what happened and when.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  dot,
}: {
  label: string;
  value: number;
  total: number;
  dot: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      <span className="flex-1 text-xs font-medium text-stone-600">{label}</span>
      <span className="text-xs font-bold text-ink">{value}</span>
      <span className="w-9 text-right text-[11px] text-stone-400">
        {percent}%
      </span>
    </div>
  );
}
