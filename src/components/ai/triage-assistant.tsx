"use client";

import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AIAttributionLine } from "@/components/ai/ai-attribution";
import { PriorityBadge, StatusBadge } from "@/components/issues/issue-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";
import { api, getApiErrorMessage } from "@/lib/api";
import { CATEGORY_OPTIONS, categoryLabels } from "@/lib/constants";
import type { AIPayload, AISuggestedAction } from "@/lib/types";
import { aiTriageClientSchema } from "@/lib/validation";

const actionLabels: Record<AISuggestedAction["type"], string> = {
  SET_CATEGORY: "Set category",
  SET_PRIORITY: "Set priority",
  ASSIGN: "Assign",
  ADD_NOTE: "Add note",
};

export function TriageAssistant() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: AIPayload) => api.ai.triage(payload),
  });
  const result = mutation.data;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    const parsed = aiTriageClientSchema.safeParse({
      title,
      description,
      location: location || undefined,
      category: category || undefined,
    });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ?? "Please check the form fields.",
      );
      return;
    }

    mutation.mutate(parsed.data);
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand" />
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">
          Structured triage assistant
        </h3>
      </div>
      <p className="mt-2 text-xs leading-5 text-stone-500">
        One request runs categorization, urgency scoring, summarization and
        duplicate detection, then returns validated suggested actions.
      </p>

      <form className="mt-5 space-y-4" onSubmit={submit}>
        <FormField label="Report title" htmlFor="ai-triage-title" required>
          <Input
            id="ai-triage-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Broken streetlight near the park"
            maxLength={150}
          />
        </FormField>

        <FormField
          label="What is happening"
          htmlFor="ai-triage-description"
          required
        >
          <Textarea
            id="ai-triage-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the issue, its impact and how long it has been happening…"
            maxLength={5000}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Location" htmlFor="ai-triage-location">
            <Input
              id="ai-triage-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Optional street or landmark"
              maxLength={200}
            />
          </FormField>
          <FormField label="Known category" htmlFor="ai-triage-category">
            <Select
              id="ai-triage-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Let AI decide</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        {formError ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {formError}
          </p>
        ) : null}
        {mutation.isError ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {getApiErrorMessage(mutation.error)}
          </p>
        ) : null}

        <Button type="submit" loading={mutation.isPending}>
          <Sparkles className="h-4 w-4" />
          Run triage
        </Button>
      </form>

      {mutation.isPending ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 border-t border-line pt-5">
          <AIAttributionLine attribution={result.attribution} />

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <ResultCard label="Suggested category">
              <p className="text-sm font-bold text-ink">
                {categoryLabels[result.category.category]}
              </p>
              <p className="mt-1 text-[11px] text-stone-500">
                {Math.round(result.category.confidence * 100)}% confidence ·{" "}
                {result.category.rationale}
              </p>
            </ResultCard>
            <ResultCard label="Suggested priority">
              <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge priority={result.priority.priority} />
                <span className="text-xs font-semibold text-stone-500">
                  {result.priority.urgencyScore}/100 urgency
                </span>
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                {result.priority.reasons[0]}
              </p>
            </ResultCard>
            <ResultCard label="Overall confidence">
              <p className="text-sm font-bold text-ink">
                {Math.round(result.confidence * 100)}%
              </p>
              <p className="mt-1 text-[11px] text-stone-500">
                Across all triage steps
              </p>
            </ResultCard>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-surface-muted p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
              AI summary
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              {result.summary.summary}
            </p>
            {result.summary.keyPoints.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {result.summary.keyPoints.map((point) => (
                  <Badge
                    key={point}
                    className="bg-surface text-stone-600 ring-line"
                  >
                    {point}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          {result.duplicates.length > 0 ? (
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                Possible duplicates
              </p>
              <ul className="mt-2 divide-y divide-line/70">
                {result.duplicates.map((issue) => (
                  <li key={issue.id} className="flex items-center gap-3 py-2.5">
                    <Link
                      href={`/issues/${issue.id}`}
                      className="min-w-0 flex-1 truncate text-sm font-semibold text-ink hover:text-brand"
                    >
                      {issue.title}
                    </Link>
                    <StatusBadge status={issue.status} />
                    <span className="text-[11px] font-bold text-brand">
                      {Math.round(issue.similarity * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.actions.length > 0 ? (
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                Suggested actions
              </p>
              <ul className="mt-2 space-y-2">
                {result.actions.map((action, index) => (
                  <li
                    key={`${action.type}-${index}`}
                    className="flex flex-col gap-1 rounded-xl border border-line bg-surface-muted px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <Badge className="w-fit bg-brand-soft text-brand ring-brand/15">
                      {actionLabels[action.type]}
                    </Badge>
                    <span className="min-w-0 flex-1 text-[13px] font-semibold text-ink">
                      {action.value}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {action.reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ResultCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-muted p-3.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
