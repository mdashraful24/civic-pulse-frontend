"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  ExternalLink,
  Inbox,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import {
  CATEGORY_OPTIONS,
  IMAGE_ACCEPT,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/constants";
import { formatNumber, timeAgo } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks";
import type {
  Issue,
  IssueCategory,
  IssuePriority,
  IssueStatus,
} from "@/lib/types";
import {
  updateIssuePrioritySchema,
  updateIssueStatusSchema,
  validateImageFile,
} from "@/lib/validation";

const PAGE_SIZE = 8;

export function ManageIssues() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusId = searchParams.get("issue");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [priority, setPriority] = useState<IssuePriority | "">("");
  const [status, setStatus] = useState<IssueStatus | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const [selected, setSelected] = useState<Issue | null>(null);
  const [assigneeId, setAssigneeId] = useState("");
  const [nextPriority, setNextPriority] = useState<IssuePriority>("MEDIUM");
  const [nextStatus, setNextStatus] = useState<IssueStatus>("PENDING");
  const [resolutionNote, setResolutionNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const issuesQuery = useQuery({
    queryKey: [
      "admin-issues",
      { debouncedSearch, category, priority, status, page },
    ],
    queryFn: () =>
      api.issues.listPublic({
        search: debouncedSearch || undefined,
        category: category || undefined,
        priority: priority || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
        sort: "newest",
      }),
  });

  const focusQuery = useQuery({
    queryKey: ["issue", focusId],
    queryFn: () => api.issues.get(focusId as string),
    enabled: Boolean(focusId),
  });

  const personnelQuery = useQuery({
    queryKey: ["admin-users", "personnel"],
    queryFn: () =>
      api.admin.users({ role: "PERSONNEL", status: "ACTIVE", limit: 100 }),
    enabled: Boolean(selected),
  });

  useEffect(() => {
    if (focusId && focusQuery.data) setSelected(focusQuery.data);
  }, [focusId, focusQuery.data]);

  useEffect(() => {
    if (!selected) return;
    setAssigneeId(selected.assignee?.id ?? "");
    setNextPriority(selected.priority);
    setNextStatus(selected.status);
    setResolutionNote(selected.resolutionNote ?? "");
    setPhoto(null);
  }, [selected]);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const closeDialog = () => {
    setSelected(null);
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (focusId) router.replace("/dashboard/manage");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("No issue selected.");

      const priorityParsed = updateIssuePrioritySchema.safeParse({
        priority: nextPriority,
      });
      if (!priorityParsed.success) {
        throw new Error(priorityParsed.error.issues[0]?.message);
      }

      const statusParsed = updateIssueStatusSchema.safeParse({
        status: nextStatus,
        resolutionNote:
          nextStatus === "RESOLVED"
            ? resolutionNote.trim() || undefined
            : undefined,
      });
      if (!statusParsed.success) {
        throw new Error(statusParsed.error.issues[0]?.message);
      }

      if (photo) {
        const photoError = validateImageFile(photo);
        if (photoError) throw new Error(photoError);
      }

      const currentAssignee = selected.assignee?.id ?? "";
      if (assigneeId !== currentAssignee) {
        await api.issues.assign(selected.id, assigneeId || null);
      }
      if (nextPriority !== selected.priority) {
        await api.issues.updatePriority(selected.id, nextPriority);
      }
      if (nextStatus !== selected.status) {
        await api.issues.updateStatus(selected.id, statusParsed.data);
      }
      if (photo) {
        await api.issues.updateImage(selected.id, photo);
      }
    },
    onSuccess: () => {
      toast.success("Issue updated.");
      closeDialog();
      void queryClient.invalidateQueries({ queryKey: ["admin-issues"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      void queryClient.invalidateQueries({ queryKey: ["issue"] });
      void queryClient.invalidateQueries({ queryKey: ["public-issues"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const issues = issuesQuery.data?.items ?? [];
  const meta = issuesQuery.data?.meta;
  const personnel = personnelQuery.data?.items ?? [];
  const hasFilters = Boolean(search || category || priority || status);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setPriority("");
    setStatus("");
    setPage(1);
  };

  return (
    <RoleGate allow={["ADMIN"]}>
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          eyebrow="Operations"
          title="Manage every issue."
          description="Triage reports, assign field personnel, change priority and keep the public status accurate."
          actions={
            <Link
              href="/dashboard/users"
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              People directory
            </Link>
          }
        />

        <div className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-end">
            <FormField label="Search issues">
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
            <FormField label="Category">
              <Select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value as IssueCategory | "");
                  setPage(1);
                }}
              >
                <option value="">All categories</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
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
            <FormField label="Priority">
              <Select
                value={priority}
                onChange={(event) => {
                  setPriority(event.target.value as IssuePriority | "");
                  setPage(1);
                }}
              >
                <option value="">Any priority</option>
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <Button
              variant="outline"
              size="icon"
              disabled={!hasFilters}
              onClick={resetFilters}
              title="Reset filters"
              aria-label="Reset filters"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {issuesQuery.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            <p className="font-semibold">Issues could not load.</p>
            <p className="mt-1">{getApiErrorMessage(issuesQuery.error)}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 bg-white"
              onClick={() => issuesQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : issuesQuery.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : issues.length > 0 ? (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-line bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-stone-50/80 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                    <tr>
                      <th className="px-5 py-3">Issue</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Assigned</th>
                      <th className="px-4 py-3">Reported</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {issues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-stone-50/50">
                        <td className="max-w-[300px] px-5 py-3">
                          <div className="flex items-center gap-3">
                            <CategoryTile
                              category={issue.category}
                              className="h-9 w-9"
                            />
                            <div className="min-w-0">
                              <Link
                                href={`/issues/${issue.id}`}
                                className="block truncate font-semibold text-ink hover:text-brand"
                              >
                                {issue.title}
                              </Link>
                              <p className="truncate text-[11px] text-stone-500">
                                {issue.location}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={issue.status} />
                        </td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority={issue.priority} />
                        </td>
                        <td className="px-4 py-3">
                          {issue.assignee ? (
                            <span className="flex items-center gap-2 text-xs font-medium text-stone-600">
                              <Avatar
                                name={issue.assignee.name}
                                src={issue.assignee.imageUrl}
                                size="xs"
                              />
                              <span className="max-w-24 truncate">
                                {issue.assignee.name}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs text-stone-400">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-stone-500">
                          {timeAgo(issue.createdAt)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelected(issue)}
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-2xl border border-line bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <CategoryTile category={issue.category} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{issue.title}</p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {issue.location} · {timeAgo(issue.createdAt)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <StatusBadge status={issue.status} />
                        <PriorityBadge priority={issue.priority} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                    <Link
                      href={`/issues/${issue.id}`}
                      className="text-xs font-semibold text-brand"
                    >
                      View report
                    </Link>
                    <Button size="sm" onClick={() => setSelected(issue)}>
                      <Settings2 className="h-3.5 w-3.5" />
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-stone-500">
                {formatNumber(meta?.total ?? 0)} issue
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
            icon={<Inbox className="h-5 w-5" />}
            title="No issues match those filters"
            description="Try clearing a filter or check back when new reports arrive."
            action={
              hasFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}

        <Modal
          open={Boolean(selected)}
          onClose={closeDialog}
          title="Manage issue"
          description="Update assignment, priority and status. Every change is visible to the public."
          size="lg"
          footer={
            <>
              <Button variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                loading={saving}
                onClick={() => {
                  setSaving(true);
                  saveMutation.mutate(undefined, {
                    onSettled: () => setSaving(false),
                  });
                }}
              >
                <ShieldCheck className="h-4 w-4" />
                Save changes
              </Button>
            </>
          }
        >
          {selected ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-4">
                <CategoryTile category={selected.category} />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/issues/${selected.id}`}
                    className="font-semibold text-ink hover:text-brand"
                  >
                    {selected.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {selected.location} · reported by {selected.reporter.name}
                  </p>
                </div>
                <Link
                  href={`/issues/${selected.id}`}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-white hover:text-brand"
                  aria-label="Open public issue page"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Assign to personnel" htmlFor="assignee">
                  <Select
                    id="assignee"
                    value={assigneeId}
                    onChange={(event) => setAssigneeId(event.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {personnel.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} · {person.email}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Priority" htmlFor="managePriority">
                  <Select
                    id="managePriority"
                    value={nextPriority}
                    onChange={(event) =>
                      setNextPriority(event.target.value as IssuePriority)
                    }
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Status" htmlFor="manageStatus">
                  <Select
                    id="manageStatus"
                    value={nextStatus}
                    onChange={(event) =>
                      setNextStatus(event.target.value as IssueStatus)
                    }
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Public photo" htmlFor="managePhoto">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      id="managePhoto"
                      type="file"
                      accept={IMAGE_ACCEPT}
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        if (!file) return;
                        const message = validateImageFile(file);
                        if (message) {
                          event.target.value = "";
                          toast.error(message);
                          return;
                        }
                        setPhoto(file);
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-3.5 w-3.5" />
                      {selected.imageUrl || photo
                        ? "Replace photo"
                        : "Add photo"}
                    </Button>
                    {photo ? (
                      <span className="truncate text-[11px] text-stone-500">
                        {photo.name}
                      </span>
                    ) : null}
                  </div>
                </FormField>
              </div>

              {nextStatus === "RESOLVED" ? (
                <FormField
                  label="Resolution note"
                  htmlFor="manageResolution"
                  hint={
                    selected.status === "RESOLVED"
                      ? "This issue is already resolved. Notes cannot be edited."
                      : `${resolutionNote.length}/2000`
                  }
                >
                  <Textarea
                    id="manageResolution"
                    value={resolutionNote}
                    onChange={(event) => setResolutionNote(event.target.value)}
                    placeholder="What was done to resolve this issue?"
                    maxLength={2000}
                    disabled={selected.status === "RESOLVED"}
                  />
                </FormField>
              ) : null}

              {photoPreview ? (
                <div className="overflow-hidden rounded-xl border border-line">
                  {/* biome-ignore lint/performance/noImgElement: local object URL preview */}
                  <img
                    src={photoPreview}
                    alt="Selected issue"
                    className="h-36 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </Modal>
      </div>
    </RoleGate>
  );
}
