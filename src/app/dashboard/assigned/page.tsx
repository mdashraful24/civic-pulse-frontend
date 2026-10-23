"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ClipboardCheck,
  Play,
  Search,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { RoleGate } from "@/components/dashboard/auth-guard";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  CategoryTile,
  PriorityBadge,
  StatusBadge,
} from "@/components/issues/issue-badges";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api, getApiErrorMessage } from "@/lib/api";
import { STATUS_OPTIONS } from "@/lib/constants";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks";
import type { Issue, IssueStatus } from "@/lib/types";
import { updateIssueStatusSchema } from "@/lib/validation";

const PAGE_SIZE = 6;

export default function AssignedIssuesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<IssueStatus | "">("");
  const [page, setPage] = useState(1);
  const [resolving, setResolving] = useState<Issue | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const query = useQuery({
    queryKey: ["assigned-issues", { debouncedSearch, status, page }],
    queryFn: () =>
      api.issues.assigned({
        search: debouncedSearch || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
        sort: "newest",
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      issue,
      nextStatus,
      resolutionNote,
    }: {
      issue: Issue;
      nextStatus: IssueStatus;
      resolutionNote?: string;
    }) =>
      api.issues.updateStatus(issue.id, {
        status: nextStatus,
        resolutionNote,
      }),
    onSuccess: (response) => {
      toast.success(
        response.data?.status === "RESOLVED"
          ? "Issue marked as resolved."
          : "Issue moved to in progress.",
      );
      setResolving(null);
      setNote("");
      void queryClient.invalidateQueries({ queryKey: ["assigned-issues"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      void queryClient.invalidateQueries({ queryKey: ["issue"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const issues = query.data?.items ?? [];
  const meta = query.data?.meta;

  const openResolve = (issue: Issue) => {
    setResolving(issue);
    setNote(issue.resolutionNote ?? "");
    setNoteError("");
  };

  const submitResolve = () => {
    if (!resolving) return;
    const parsed = updateIssueStatusSchema.safeParse({
      status: "RESOLVED",
      resolutionNote: note.trim() || undefined,
    });
    if (!parsed.success) {
      setNoteError(parsed.error.issues[0]?.message ?? "Check the note.");
      return;
    }
    statusMutation.mutate({
      issue: resolving,
      nextStatus: "RESOLVED",
      resolutionNote: parsed.data.resolutionNote,
    });
  };

  return (
    <RoleGate allow={["PERSONNEL"]}>
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader
          eyebrow="Field work"
          title="Assigned to you."
          description="Start a job, update its status and leave a clear resolution note when it is done."
        />

        <div className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
            <FormField label="Search assigned issues">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by title…"
                  className="pl-10"
                  maxLength={120}
                />
              </div>
            </FormField>
            <FormField label="Status">
              <Select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as IssueStatus | "");
                  setPage(1);
                }}
              >
                <option value="">Any status</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>

        {query.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            <p className="font-semibold">Assigned issues could not load.</p>
            <p className="mt-1">{getApiErrorMessage(query.error)}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 bg-white"
              onClick={() => query.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : query.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : issues.length > 0 ? (
          <>
            <div className="space-y-3">
              {issues.map((issue) => (
                <AssignedIssueRow
                  key={issue.id}
                  issue={issue}
                  onStart={() =>
                    statusMutation.mutate({
                      issue,
                      nextStatus: "IN_PROGRESS",
                    })
                  }
                  onResolve={() => openResolve(issue)}
                  starting={
                    statusMutation.isPending &&
                    statusMutation.variables?.issue.id === issue.id &&
                    statusMutation.variables.nextStatus === "IN_PROGRESS"
                  }
                />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-stone-500">
                {formatNumber(meta?.total ?? 0)} assigned issue
                {meta?.total === 1 ? "" : "s"}
                {meta && meta.totalPages > 1
                  ? ` · page ${meta.page} of ${meta.totalPages}`
                  : ""}
              </p>
              {meta && meta.totalPages > 1 ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <EmptyState
            icon={<ClipboardCheck className="h-5 w-5" />}
            title={
              search || status
                ? "No assigned work matches those filters"
                : "Nothing assigned right now"
            }
            description="When an administrator assigns an issue to you, it will appear here with everything you need to get started."
          />
        )}

        <Modal
          open={Boolean(resolving)}
          onClose={() => setResolving(null)}
          title="Mark this issue as resolved?"
          description="Add a short note describing what was done. It will be visible on the public timeline."
          footer={
            <>
              <Button variant="ghost" onClick={() => setResolving(null)}>
                Cancel
              </Button>
              <Button
                loading={statusMutation.isPending}
                onClick={submitResolve}
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark resolved
              </Button>
            </>
          }
        >
          {resolving ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-stone-50 p-4">
                <p className="text-sm font-semibold text-ink">
                  {resolving.title}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {resolving.location}
                </p>
              </div>
              <FormField
                label="Resolution note"
                htmlFor="resolutionNote"
                error={noteError}
                hint={`${note.length}/2000`}
              >
                <Textarea
                  id="resolutionNote"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="e.g. Replaced the bulb and checked the wiring."
                  maxLength={2000}
                />
              </FormField>
            </div>
          ) : null}
        </Modal>
      </div>
    </RoleGate>
  );
}

function AssignedIssueRow({
  issue,
  onStart,
  onResolve,
  starting,
}: {
  issue: Issue;
  onStart: () => void;
  onResolve: () => void;
  starting: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <CategoryTile category={issue.category} className="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/issues/${issue.id}`}
              className="text-[15px] font-bold text-ink transition hover:text-brand"
            >
              {issue.title}
            </Link>
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <p className="mt-1.5 text-sm text-stone-500">
            {issue.location} · reported {timeAgo(issue.createdAt)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <Avatar
                name={issue.reporter.name}
                src={issue.reporter.imageUrl}
                size="xs"
              />
              {issue.reporter.name}
            </span>
            {issue.resolvedAt ? (
              <span>Resolved {formatDateTime(issue.resolvedAt)}</span>
            ) : null}
          </div>
          {issue.resolutionNote ? (
            <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800">
              {issue.resolutionNote}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Link
            href={`/issues/${issue.id}`}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            View report
          </Link>
          {issue.status === "PENDING" ? (
            <Button size="sm" loading={starting} onClick={onStart}>
              <Play className="h-3.5 w-3.5" />
              Start work
            </Button>
          ) : issue.status === "IN_PROGRESS" ? (
            <Button size="sm" onClick={onResolve}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark resolved
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
              <Wrench className="h-3.5 w-3.5" />
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
