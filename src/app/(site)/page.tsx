"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { CategoryIcon, StatusBadge } from "@/components/issues/issue-badges";
import { IssueCard } from "@/components/issues/issue-card";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { api } from "@/lib/api";
import { CATEGORY_OPTIONS } from "@/lib/constants";
import { formatNumber, timeAgo } from "@/lib/format";
import { cachePolicy } from "@/lib/query-cache";

const steps = [
  {
    icon: MapPin,
    title: "Pin the problem",
    text: "Add a location, a photo and a short description. It takes under a minute.",
  },
  {
    icon: Search,
    title: "Follow the progress",
    text: "Your report gets a public timeline, from pending to in progress to resolved.",
  },
  {
    icon: CheckCircle2,
    title: "See it fixed",
    text: "Field teams update the status and leave a resolution note when the job is done.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const recent = useQuery({
    queryKey: ["public-issues", "recent"],
    queryFn: () => api.issues.listPublic({ limit: 6, sort: "newest" }),
    ...cachePolicy.live,
  });
  const total = useQuery({
    queryKey: ["public-issues", "count", "total"],
    queryFn: () => api.issues.listPublic({ limit: 1 }),
    ...cachePolicy.stats,
  });
  const resolved = useQuery({
    queryKey: ["public-issues", "count", "resolved"],
    queryFn: () => api.issues.listPublic({ status: "RESOLVED", limit: 1 }),
    ...cachePolicy.stats,
  });

  const totalCount = total.data?.meta.total ?? 0;
  const resolvedCount = resolved.data?.meta.total ?? 0;
  const openCount = Math.max(totalCount - resolvedCount, 0);
  const progress =
    totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
  const recentIssues = recent.data?.items ?? [];

  return (
    <main className="flex-1 overflow-x-hidden">
      <section className="relative overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,#d8e9df_0,transparent_38%),radial-gradient(circle_at_10%_80%,#f6e2bf_0,transparent_35%)] dark:bg-[radial-gradient(circle_at_80%_10%,#123a2f_0,transparent_38%),radial-gradient(circle_at_10%_80%,#3a2d16_0,transparent_35%)]" />
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-14 pt-10 sm:gap-12 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-surface/70 px-3 py-1.5 text-[12px] font-semibold text-brand shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Community-powered civic action
            </div>
            <h1 className="mt-4 max-w-2xl text-[36px] font-semibold leading-none tracking-[-0.045em] text-ink xs:text-[44px] sm:text-6xl lg:text-[68px]">
              See it. Report it.{" "}
              <span className="relative whitespace-nowrap text-brand">
                Fix it.
                <svg
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-accent sm:-bottom-2 sm:h-3"
                  viewBox="0 0 200 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9C45 3 96 2 198 7"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-6 text-stone-600 sm:mt-6 sm:text-lg sm:leading-7">
              CivicPulse turns everyday neighborhood problems into visible,
              trackable work. Report a pothole, a dark street or a blocked drain
              — then watch the progress happen in public.
            </p>

            <div className="mt-7 flex flex-col items-stretch gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {user ? (
                <Link
                  href={
                    user.role === "CITIZEN" ? "/dashboard/report" : "/dashboard"
                  }
                  className={buttonStyles({ size: "lg" })}
                >
                  {user.role === "CITIZEN"
                    ? "Report an issue"
                    : "Open dashboard"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link href="/register" className={buttonStyles({ size: "lg" })}>
                  Report your first issue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/issues"
                className={buttonStyles({
                  variant: "outline",
                  size: "lg",
                })}
              >
                Browse the map
              </Link>
            </div>

            <div className="mt-8 grid w-full max-w-xl grid-cols-3 divide-x divide-line/80 rounded-2xl border border-line bg-surface/65 p-1 shadow-sm backdrop-blur">
              <HeroStat
                label="Issues shared"
                value={totalCount}
                loading={total.isLoading}
              />
              <HeroStat
                label="Open now"
                value={openCount}
                loading={total.isLoading || resolved.isLoading}
              />
              <HeroStat
                label="Resolved"
                value={resolvedCount}
                loading={resolved.isLoading}
              />
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="absolute -inset-2 -z-10 rounded-4xl border border-brand/10 bg-brand/5 drop-shadow sm:-inset-4" />
            <div className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-2xl shadow-black/20 sm:rounded-[28px]">
              <div className="flex items-center justify-between border-b border-line bg-surface-muted px-4 py-3 sm:px-5 sm:py-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500 sm:text-[11px]">
                    Live community pulse
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-ink sm:mt-1">
                    This neighborhood, right now
                  </p>
                </div>
                <span className="ml-3 flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 sm:px-2.5 sm:py-1 sm:text-[11px]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-px border-b border-line bg-line">
                <div className="bg-surface px-4 py-3 sm:px-5 sm:py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 sm:text-[11px]">
                    Reports
                  </p>
                  <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                    {formatNumber(totalCount)}
                  </p>
                </div>
                <div className="bg-surface px-4 py-3 sm:px-5 sm:py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 sm:text-[11px]">
                    Resolved
                  </p>
                  <p className="mt-1 text-xl font-bold tracking-tight text-brand sm:text-2xl">
                    {formatNumber(resolvedCount)}
                  </p>
                </div>
              </div>

              <div className="px-4 pt-4 sm:px-5 sm:pt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-600">
                    Resolution rate
                  </span>
                  <span className="font-bold text-brand">{progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-700"
                    style={{ width: `${Math.max(progress, 2)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-1 px-2 pb-2 sm:px-3 sm:pb-3">
                {recent.isLoading ? (
                  [0, 1, 2].map((item) => (
                    <div key={item} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : recentIssues.length > 0 ? (
                  recentIssues.slice(0, 4).map((issue) => (
                    <Link
                      key={issue.id}
                      href={`/issues/${issue.id}`}
                      className="flex min-w-0 items-center gap-2.5 rounded-xl p-2 transition hover:bg-stone-50 sm:gap-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                        <CategoryIcon
                          category={issue.category}
                          className="h-4 w-4"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-ink">
                          {issue.title}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-stone-500">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{issue.location}</span>
                          <span className="hidden xs:inline">·</span>
                          <span className="hidden xs:inline">
                            {timeAgo(issue.createdAt)}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0">
                        <StatusBadge status={issue.status} />
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-xl bg-stone-50 px-3 py-5 text-center text-sm text-stone-500 sm:px-4 sm:py-6">
                    No reports yet. Be the first to put your neighbourhood on
                    the map.
                  </div>
                )}
              </div>

              <div className="border-t border-line bg-surface-muted px-4 py-2.5 sm:px-5 sm:py-3">
                <Link
                  href="/issues"
                  className="flex items-center justify-between text-xs font-semibold text-brand hover:text-brand-dark"
                >
                  See every issue
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="border-y border-line bg-surface/50">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
                What can be reported
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-ink">
                The everyday things that matter.
              </h2>
            </div>
            <Link
              href="/issues"
              className="text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Browse all reports →
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {CATEGORY_OPTIONS.map((category) => (
              <Link
                key={category.value}
                href={`/issues?category=${category.value}`}
                className="group rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand-solid group-hover:text-white">
                  <CategoryIcon category={category.value} className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-bold text-ink">
                  {category.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-4xl">
              A clear loop from report to resolution.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-stone-600">
              No lost emails, no mystery ticket numbers. Every report has a
              public status, an owner and a timestamp.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
              <div className="flex -space-x-2">
                {["AM", "JR", "SK"].map((item) => (
                  <Avatar
                    key={item}
                    name={item}
                    size="sm"
                    className="border-2 border-surface"
                  />
                ))}
              </div>
              <p className="text-xs leading-5 text-stone-500">
                Built for citizens, administrators and field personnel —
                everyone sees the same source of truth.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-5 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col items-center">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-solid text-sm font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < steps.length - 1 ? (
                    <span className="mt-2 h-full w-px bg-line" />
                  ) : null}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <step.icon className="h-4 w-4 text-brand" />
                    <h3 className="font-bold text-ink">{step.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-stone-500">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface-muted">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
                Recently reported
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-ink">
                The pulse of the neighbourhood.
              </h2>
            </div>
            <Link
              href="/issues"
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              View all issues
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            {recent.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-[360px] rounded-2xl" />
                ))}
              </div>
            ) : recentIssues.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentIssues.slice(0, 6).map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
                <p className="font-semibold text-ink">
                  No issues have been reported yet.
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  Create the first report and start the map.
                </p>
                <Link
                  href={user ? "/dashboard/report" : "/register"}
                  className={buttonStyles({ className: "mt-5" })}
                >
                  Report an issue
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] bg-brand-solid px-6 py-10 text-white shadow-lg shadow-brand/20 sm:px-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                <ShieldCheck className="h-4 w-4" />
                One shared civic record
              </div>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
                Your street. Your report. Your progress.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                Join residents, administrators and field teams using one simple
                loop to make public spaces better.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              {user ? (
                <Link
                  href="/dashboard"
                  className={buttonStyles({
                    variant: "secondary",
                    size: "lg",
                  })}
                >
                  <Users className="h-4 w-4" />
                  Open dashboard
                </Link>
              ) : (
                <Link
                  href="/register"
                  className={buttonStyles({
                    variant: "secondary",
                    size: "lg",
                  })}
                >
                  <ClipboardList className="h-4 w-4" />
                  Create an account
                </Link>
              )}
              <Link
                href="/issues"
                className={buttonStyles({
                  variant: "outline",
                  size: "lg",
                  className:
                    "border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/15",
                })}
              >
                Browse issues
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroStat({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="px-2 py-2.5 text-center sm:px-3 sm:py-3">
      <div className="text-base font-bold tracking-tight text-ink sm:text-lg lg:text-xl">
        {loading ? (
          <Skeleton className="mx-auto h-5 w-8 sm:h-6 sm:w-10" />
        ) : (
          formatNumber(value)
        )}
      </div>
      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-stone-500 sm:text-[10px] lg:text-[11px]">
        {label}
      </p>
    </div>
  );
}
