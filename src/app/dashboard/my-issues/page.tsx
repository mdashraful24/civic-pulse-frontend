"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  ClipboardList,
  FilePenLine,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { RoleGate } from "@/components/dashboard/auth-guard";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  CategoryTile,
  PriorityBadge,
  StatusBadge,
} from "@/components/issues/issue-badges";
import { IssueForm } from "@/components/issues/issue-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { FormField, Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api, getApiErrorMessage } from "@/lib/api";
import { IMAGE_ACCEPT, STATUS_OPTIONS } from "@/lib/constants";
import { formatDate, formatNumber, timeAgo } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks";
import type { Issue, IssueStatus } from "@/lib/types";
import { validateImageFile } from "@/lib/validation";

const PAGE_SIZE = 6;

export default function MyIssuesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<IssueStatus | "">("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Issue | null>(null);
  const [deleting, setDeleting] = useState<Issue | null>(null);
  const [photoIssue, setPhotoIssue] = useState<Issue | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const query = useQuery({
    queryKey: ["my-issues", { debouncedSearch, status, page }],
    queryFn: () =>
      api.issues.mine({
        search: debouncedSearch || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
        sort: "newest",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (issue: Issue) => api.issues.remove(issue.id),
    onSuccess: () => {
      toast.success("Issue deleted.");
      setDeleting(null);
      void queryClient.invalidateQueries({ queryKey: ["my-issues"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const issues = query.data?.items ?? [];
  const meta = query.data?.meta;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["my-issues"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    void queryClient.invalidateQueries({ queryKey: ["issue"] });
    void queryClient.invalidateQueries({ queryKey: ["public-issues"] });
  };

  const handlePhoto = async (file: File | null) => {
    if (!file || !photoIssue) return;
    const message = validateImageFile(file);
    if (message) {
      setPhotoIssue(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.error(message);
      return;
    }
    setBusyId(photoIssue.id);
    try {
      await api.issues.updateImage(photoIssue.id, file);
      toast.success("Issue photo updated.");
      invalidate();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusyId(null);
      setPhotoIssue(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <RoleGate allow={["CITIZEN"]}>
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader
          eyebrow="My reports"
          title="Everything you’ve flagged."
          description="Follow each report’s status, edit it while it is still pending, or attach a better photo."
          actions={
            <Link
              href="/dashboard/report"
              className={buttonStyles({ size: "sm" })}
            >
              <Plus className="h-4 w-4" />
              New report
            </Link>
          }
        />

        <div className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
            <FormField label="Search my issues">
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by title…"
                maxLength={120}
              />
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
            <p className="font-semibold">Your issues could not load.</p>
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
              <Skeleton key={item} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : issues.length > 0 ? (
          <>
            <div className="space-y-3">
              {issues.map((issue) => (
                <MyIssueRow
                  key={issue.id}
                  issue={issue}
                  busy={busyId === issue.id}
                  onEdit={() => setEditing(issue)}
                  onDelete={() => setDeleting(issue)}
                  onPhoto={() => {
                    setPhotoIssue(issue);
                    fileInputRef.current?.click();
                  }}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-stone-500">
                {formatNumber(meta?.total ?? 0)} report
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
            icon={<ClipboardList className="h-5 w-5" />}
            title={
              search || status
                ? "No reports match those filters"
                : "You haven’t reported anything yet"
            }
            description="When something needs attention in your neighbourhood, put it on the map. It takes less than a minute."
            action={
              <Link
                href="/dashboard/report"
                className={buttonStyles({ size: "sm" })}
              >
                <Plus className="h-4 w-4" />
                Report an issue
              </Link>
            }
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={(event) =>
            void handlePhoto(event.target.files?.[0] ?? null)
          }
        />

        <Modal
          open={Boolean(editing)}
          onClose={() => setEditing(null)}
          title="Edit your report"
          description="You can edit a report while it is still pending."
          size="lg"
        >
          {editing ? (
            <IssueForm
              mode="edit"
              initial={editing}
              onCancel={() => setEditing(null)}
              onSuccess={() => {
                setEditing(null);
                invalidate();
              }}
            />
          ) : null}
        </Modal>

        <Modal
          open={Boolean(deleting)}
          onClose={() => setDeleting(null)}
          title="Delete this report?"
          description="This cannot be undone. The public timeline and any attached photo will also be removed."
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleting(null)}>
                Keep it
              </Button>
              <Button
                variant="danger"
                loading={deleteMutation.isPending}
                onClick={() => {
                  if (deleting) deleteMutation.mutate(deleting);
                }}
              >
                Delete report
              </Button>
            </>
          }
        >
          {deleting ? (
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-sm font-semibold text-ink">{deleting.title}</p>
              <p className="mt-1 text-xs text-stone-500">
                {deleting.location} · {formatDate(deleting.createdAt)}
              </p>
            </div>
          ) : null}
        </Modal>
      </div>
    </RoleGate>
  );
}

function MyIssueRow({
  issue,
  busy,
  onEdit,
  onDelete,
  onPhoto,
}: {
  issue: Issue;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPhoto: () => void;
}) {
  const editable = issue.status === "PENDING";

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex items-center gap-3 sm:block">
          <CategoryTile category={issue.category} className="h-11 w-11" />
          <div className="sm:hidden">
            <StatusBadge status={issue.status} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/issues/${issue.id}`}
              className="text-[15px] font-bold text-ink transition hover:text-brand"
            >
              {issue.title}
            </Link>
            <span className="hidden sm:inline-flex">
              <StatusBadge status={issue.status} />
            </span>
            <PriorityBadge priority={issue.priority} />
          </div>
          <p className="mt-1.5 text-sm leading-6 text-stone-500">
            {issue.location} · reported {timeAgo(issue.createdAt)}
          </p>
          {!editable ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
              <Lock className="h-3 w-3" />
              Locked once work starts
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link
            href={`/issues/${issue.id}`}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            View
          </Link>
          {editable ? (
            <>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <FilePenLine className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                loading={busy}
                onClick={onPhoto}
              >
                <Camera className="h-3.5 w-3.5" />
                Photo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          ) : (
            <Badge className="bg-stone-100 text-stone-500 ring-stone-200">
              {issue.assignee
                ? `Assigned to ${issue.assignee.name}`
                : "Awaiting action"}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
