"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RoleGate } from "@/components/dashboard/auth-guard";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { api, getApiErrorMessage } from "@/lib/api";
import { categoryLabels } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

const ranges = [7, 30, 90] as const;

export default function AnalyticsPage() {
  const [days, setDays] = useState<(typeof ranges)[number]>(30);
  const query = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => api.admin.analytics(days),
  });

  const data = query.data;
  const maxDaily = Math.max(
    1,
    ...(data?.issuesByDay.map((item) => item.count) ?? [1]),
  );
  const maxCategory = Math.max(
    1,
    ...(data?.categories.map((item) => item.count) ?? [1]),
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      <RoleGate allow={["ADMIN"]}>
        <PageHeader
          eyebrow="Administration"
          title="Analytics"
          description="Trends, category mix and user growth across the selected window."
          actions={
            <div className="flex gap-2">
              {ranges.map((range) => (
                <Button
                  key={range}
                  size="sm"
                  variant={days === range ? "primary" : "outline"}
                  onClick={() => setDays(range)}
                >
                  {range}d
                </Button>
              ))}
            </div>
          }
        />

        {query.isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-28 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        ) : null}

        {query.isError ? (
          <EmptyState
            title="Analytics unavailable"
            description={getApiErrorMessage(query.error)}
          />
        ) : null}

        {data ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Reports", value: formatNumber(data.totalIssues) },
                { label: "Resolved", value: formatNumber(data.resolved) },
                { label: "Resolution rate", value: `${data.resolutionRate}%` },
                { label: "New users", value: formatNumber(data.newUsers) },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-line bg-surface p-5 shadow-sm"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <h3 className="text-sm font-bold text-ink">Reports over time</h3>
                <div className="mt-5 space-y-3">
                  {data.issuesByDay.length ? (
                    data.issuesByDay.map((item) => (
                      <div key={item.date} className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-[11px] text-stone-500">
                          {item.date.slice(5)}
                        </span>
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${(item.count / maxDaily) * 100}%` }}
                          />
                        </div>
                        <span className="w-7 text-right text-[11px] font-semibold text-ink">
                          {item.count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-stone-500">
                      No reports in this range.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <h3 className="text-sm font-bold text-ink">Category mix</h3>
                <div className="mt-5 space-y-3">
                  {data.categories.length ? (
                    data.categories.map((item) => (
                      <div
                        key={item.category}
                        className="flex items-center gap-3"
                      >
                        <span className="w-28 shrink-0 text-[11px] text-stone-500">
                          {categoryLabels[item.category]}
                        </span>
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{
                              width: `${(item.count / maxCategory) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="w-7 text-right text-[11px] font-semibold text-ink">
                          {item.count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-stone-500">
                      No reports in this range.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <h3 className="text-sm font-bold text-ink">Operational summary</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-stone-500">
                    Pending reports
                  </p>
                  <p className="mt-1 text-xl font-semibold text-ink">
                    {data.pending}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-stone-500">
                    High priority
                  </p>
                  <p className="mt-1 text-xl font-semibold text-ink">
                    {data.highPriority}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-stone-500">
                    Average resolution
                  </p>
                  <p className="mt-1 text-xl font-semibold text-ink">
                    {data.averageResolutionHours}h
                  </p>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </RoleGate>
    </div>
  );
}
