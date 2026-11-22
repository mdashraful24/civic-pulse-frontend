"use client";

import { useMutation } from "@tanstack/react-query";
import { FileText, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { AIAttributionLine } from "@/components/ai/ai-attribution";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { api, getApiErrorMessage } from "@/lib/api";
import { categoryLabels } from "@/lib/constants";

export function IssueAITools({
  issue,
}: {
  issue: { id: string; title: string; description: string };
}) {
  const { user } = useAuth();

  const summary = useMutation({
    mutationFn: () => api.ai.summarize({ issueId: issue.id, ...issue }),
  });
  const duplicates = useMutation({
    mutationFn: () =>
      api.ai.duplicates({
        ...issue,
        excludeId: issue.id,
        limit: 3,
      }),
  });

  if (!user) return null;

  return (
    <section className="rounded-2xl border border-brand/15 bg-brand-soft/40 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2 text-brand">
        <Sparkles className="h-4 w-4" />
        <h2 className="text-sm font-bold uppercase tracking-[0.12em]">
          AI assistance
        </h2>
      </div>
      <p className="mt-2 text-xs leading-5 text-stone-600">
        Summarize this report or find near-duplicate reports using the same
        triage engine as the dashboard.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          loading={summary.isPending}
          onClick={() => summary.mutate()}
        >
          <FileText className="h-3.5 w-3.5" />
          Summarize report
        </Button>
        <Button
          variant="outline"
          size="sm"
          loading={duplicates.isPending}
          onClick={() => duplicates.mutate()}
        >
          <Search className="h-3.5 w-3.5" />
          Find similar reports
        </Button>
      </div>

      {summary.isError ? (
        <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">
          {getApiErrorMessage(summary.error)}
        </p>
      ) : null}
      {duplicates.isError ? (
        <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">
          {getApiErrorMessage(duplicates.error)}
        </p>
      ) : null}

      {summary.isPending || duplicates.isPending ? (
        <Skeleton className="mt-4 h-20 rounded-xl" />
      ) : null}

      {summary.data ? (
        <div className="mt-4 rounded-xl border border-line bg-surface p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
            AI summary
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            {summary.data.summary}
          </p>
          <AIAttributionLine attribution={summary.data.attribution} />
        </div>
      ) : null}

      {duplicates.data ? (
        <div className="mt-4 rounded-xl border border-line bg-surface p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
            Similar reports
          </p>
          {duplicates.data.matches.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">
              No similar reports were found.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-line/70">
              {duplicates.data.matches.map((match) => (
                <li key={match.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/issues/${match.id}`}
                      className="block truncate text-sm font-semibold text-ink hover:text-brand"
                    >
                      {match.title}
                    </Link>
                    <span className="text-[11px] text-stone-500">
                      {categoryLabels[match.category]} · {match.location}
                    </span>
                  </div>
                  <Badge className="bg-brand-soft text-brand ring-brand/15">
                    {Math.round(match.similarity * 100)}% match
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <AIAttributionLine attribution={duplicates.data.attribution} />
        </div>
      ) : null}
    </section>
  );
}
