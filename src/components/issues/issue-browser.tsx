"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  FilterX,
  Inbox,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { IssueCard } from "@/components/issues/issue-card";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { FormField, Input } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { api, getApiErrorMessage } from "@/lib/api";
import {
  CATEGORY_OPTIONS,
  categoryLabels,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks";
import { cachePolicy } from "@/lib/query-cache";
import type { IssueCategory, IssuePriority, IssueStatus } from "@/lib/types";

const PAGE_SIZE = 9;

export function IssueBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = useMemo(() => {
    const category = searchParams.get("category") ?? "";
    const priority = searchParams.get("priority") ?? "";
    const status = searchParams.get("status") ?? "";
    const pageParam = Number(searchParams.get("page"));
    return {
      search: searchParams.get("search") ?? "",
      category: CATEGORY_OPTIONS.some((item) => item.value === category)
        ? (category as IssueCategory)
        : ("" as const),
      priority: PRIORITY_OPTIONS.some((item) => item.value === priority)
        ? (priority as IssuePriority)
        : ("" as const),
      status: STATUS_OPTIONS.some((item) => item.value === status)
        ? (status as IssueStatus)
        : ("" as const),
      sort:
        searchParams.get("sort") === "oldest"
          ? ("oldest" as const)
          : ("newest" as const),
      page: Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1,
    };
  }, [searchParams]);

  const [searchInput, setSearchInput] = useState(initial.search);
  const [category, setCategory] = useState<IssueCategory | "">(
    initial.category,
  );
  const [priority, setPriority] = useState<IssuePriority | "">(
    initial.priority,
  );
  const [status, setStatus] = useState<IssueStatus | "">(initial.status);
  const [sort, setSort] = useState<"newest" | "oldest">(initial.sort);
  const [page, setPage] = useState(initial.page);
  const debouncedSearch = useDebouncedValue(searchInput);
  const lastSyncedUrl = useRef<string | null>(null);

  useEffect(() => {
    const current = searchParams.toString();
    if (current === lastSyncedUrl.current) return;
    lastSyncedUrl.current = current;
    setSearchInput(initial.search);
    setCategory(initial.category);
    setPriority(initial.priority);
    setStatus(initial.status);
    setSort(initial.sort);
    setPage(initial.page);
  }, [initial, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (priority) params.set("priority", priority);
    if (status) params.set("status", status);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));

    const next = params.toString();
    lastSyncedUrl.current = next;
    if (next !== searchParams.toString()) {
      router.replace(next ? `/issues?${next}` : "/issues", { scroll: false });
    }
  }, [
    debouncedSearch,
    category,
    priority,
    status,
    sort,
    page,
    router,
    searchParams,
  ]);

  const query = useQuery({
    queryKey: [
      "public-issues",
      { debouncedSearch, category, priority, status, sort, page },
    ],
    queryFn: () =>
      api.issues.listPublic({
        search: debouncedSearch || undefined,
        category: category || undefined,
        priority: priority || undefined,
        status: status || undefined,
        sort,
        page,
        limit: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
    ...cachePolicy.list,
  });

  const issues = query.data?.items ?? [];
  const meta = query.data?.meta;
  const hasFilters = Boolean(
    searchInput || category || priority || status || sort !== "newest",
  );

  const reset = () => {
    setSearchInput("");
    setCategory("");
    setPriority("");
    setStatus("");
    setSort("newest");
    setPage(1);
    router.replace("/issues");
  };

  const changePage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 220, behavior: "smooth" });
  };


  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-line bg-[radial-gradient(circle_at_82%_20%,#d8e9df_0,transparent_34%),radial-gradient(circle_at_8%_90%,#f7e3bf_0,transparent_32%)] dark:bg-[radial-gradient(circle_at_82%_20%,#123a2f_0,transparent_34%),radial-gradient(circle_at_8%_90%,#3a2d16_0,transparent_32%)]">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-surface/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            Public issue map
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-5xl">
            What’s happening in your neighbourhood?
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-stone-600">
            Browse reports from across the community. Search by keyword, narrow
            down by category and follow each issue from report to resolution.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-stone-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand" />
              {query.isLoading
                ? "Loading reports…"
                : `${formatNumber(meta?.total ?? 0)} total reports`}
            </span>
            <span className="text-stone-300">•</span>
            <span>Updated in real time</span>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 rounded-2xl border border-line bg-surface p-4 shadow-lg shadow-black/5 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[3fr_1fr_1fr_1fr_auto] lg:items-end">
            <FormField
              label="Search reports"
              className="sm:col-span-2 lg:col-span-1"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Title, keyword, location…"
                  className="pl-10"
                  maxLength={120}
                />
              </div>
            </FormField>
            <FormField label="Category">
              <CustomSelect<IssueCategory>
                value={category}
                onChange={(value) => {
                  setCategory(value);
                  setPage(1);
                }}
                placeholder="All categories"
                options={CATEGORY_OPTIONS}
              />
            </FormField>
            <FormField label="Status">
              <CustomSelect<IssueStatus>
                value={status}
                onChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                placeholder="Any status"
                options={STATUS_OPTIONS}
              />
            </FormField>
            <FormField label="Priority">
              <CustomSelect<IssuePriority>
                value={priority}
                onChange={(value) => {
                  setPriority(value);
                  setPage(1);
                }}
                placeholder="Any priority"
                options={PRIORITY_OPTIONS}
              />
            </FormField>
            <Button
              variant="outline"
              size="md"
              onClick={reset}
              disabled={!hasFilters}
              title="Reset filters"
              aria-label="Reset filters"
              className="cursor-pointer"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <SlidersHorizontal className="h-4 w-4" />
            <span>
              {query.isLoading
                ? "Finding reports…"
                : `${formatNumber(meta?.total ?? 0)} report${meta?.total === 1 ? "" : "s"} found`}
            </span>
            {category ? (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                {categoryLabels[category]}
              </span>
            ) : null}
          </div>
          <FormField label="" className="w-full sm:w-auto">
            <CustomSelect<"newest" | "oldest">
              ariaLabel="Sort reports"
              value={sort}
              onChange={(value) => {
                if (value === "newest" || value === "oldest") {
                  setSort(value);
                  setPage(1);
                }
              }}
              className="min-w-44"
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
              ]}
            />
          </FormField>
        </div>

        {query.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="font-semibold text-rose-800">
              We couldn’t load the issue map.
            </p>
            <p className="mt-1 text-sm text-rose-700">
              {getApiErrorMessage(query.error)}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => query.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : query.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-[360px] rounded-2xl" />
            ))}
          </div>
        ) : issues.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>

            {meta ? (
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                onPageChange={changePage}
              />
            ) : null}
          </>
        ) : (
          <EmptyState
            icon={<Inbox className="h-5 w-5" />}
            title="No reports match those filters"
            description="Try a different keyword, clear a filter or check back soon — new reports appear here as they are submitted."
            action={
              hasFilters ? (
                <Button variant="outline" onClick={reset}>
                  Clear all filters
                </Button>
              ) : undefined
            }
          />
        )}
      </section>
    </main>
  );
}
