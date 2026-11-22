"use client";

import { useMutation } from "@tanstack/react-query";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AIAttributionLine } from "@/components/ai/ai-attribution";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { FormField, Input } from "@/components/ui/field";
import { api, getApiErrorMessage } from "@/lib/api";
import { categoryLabels, statusLabels } from "@/lib/constants";

export function SemanticSearch() {
  const [query, setQuery] = useState("");
  const mutation = useMutation({
    mutationFn: (value: string) => api.ai.search(value),
  });
  const data = mutation.data;

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-brand" />
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">
          Semantic issue search
        </h3>
      </div>
      <p className="mt-2 text-xs leading-5 text-stone-500">
        Finds reports by meaning using TF-IDF vectors and cosine similarity, not
        just exact words.
      </p>

      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          const value = query.trim();
          if (value.length >= 2) mutation.mutate(value);
        }}
      >
        <FormField
          label="Describe the problem"
          htmlFor="ai-search"
          className="flex-1"
        >
          <Input
            id="ai-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. broken lamp on the street at night"
            minLength={2}
            maxLength={120}
          />
        </FormField>
        <Button
          type="submit"
          loading={mutation.isPending}
          disabled={query.trim().length < 2}
          className="sm:mb-0.5"
        >
          <Sparkles className="h-4 w-4" />
          Search
        </Button>
      </form>

      {mutation.isError ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {getApiErrorMessage(mutation.error)}
        </p>
      ) : null}

      {mutation.isPending ? (
        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : null}

      {data ? (
        <div className="mt-5">
          <AIAttributionLine attribution={data.attribution} />
          {data.results.length === 0 ? (
            <EmptyState
              className="mt-4 py-10"
              icon={<Search className="h-5 w-5" />}
              title="No related reports found"
              description="Try different wording or a broader description."
            />
          ) : (
            <ul className="mt-3 divide-y divide-line/70">
              {data.results.map((issue) => (
                <li key={issue.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/issues/${issue.id}`}
                      className="truncate text-sm font-semibold text-ink transition hover:text-brand"
                    >
                      {issue.title}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-stone-500">
                      {categoryLabels[issue.category]} · {issue.location} ·{" "}
                      {statusLabels[issue.status]}
                    </p>
                  </div>
                  <span className="rounded-lg bg-brand-soft px-2 py-1 text-[11px] font-bold text-brand">
                    {Math.round(issue.similarity * 100)}% match
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
