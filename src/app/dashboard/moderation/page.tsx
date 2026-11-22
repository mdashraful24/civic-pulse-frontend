"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeOff, Flag, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RoleGate } from "@/components/dashboard/auth-guard";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { api, getApiErrorMessage } from "@/lib/api";
import { categoryLabels } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { ModerationFlag } from "@/lib/types";

const statusOptions = [
  { value: "", label: "All reports" },
  { value: "PENDING", label: "Pending" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
] as const;

function FlagCard({ flag }: { flag: ModerationFlag }) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<ModerationFlag["action"]>("NONE");
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.admin.resolveFlag(flag.id, {
        status: "RESOLVED",
        action,
        ...(note.trim() ? { note: note.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success("Moderation report resolved.");
      void queryClient.invalidateQueries({ queryKey: ["admin-flags"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
      void queryClient.invalidateQueries({ queryKey: ["public-issues"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-ink">{flag.issue.title}</h3>
            <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
              {flag.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {categoryLabels[flag.issue.category]} ·{" "}
            {flag.issue.moderationStatus} · reported by {flag.reporter.name} ·{" "}
            {formatDateTime(flag.createdAt)}
          </p>
        </div>
        {flag.issue.moderationStatus === "HIDDEN" ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
            <EyeOff className="h-3.5 w-3.5" /> Hidden
          </span>
        ) : null}
      </div>

      <blockquote className="mt-3 rounded-xl bg-stone-50 p-3 text-sm leading-6 text-stone-700">
        “{flag.reason}”
      </blockquote>

      {flag.status === "PENDING" ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <CustomSelect
            ariaLabel={`Resolution for ${flag.id}`}
            value={action}
            onChange={(value) => setAction(value as ModerationFlag["action"])}
            options={[
              { value: "NONE", label: "No issue change" },
              { value: "HIDE", label: "Hide report" },
              { value: "APPROVE", label: "Approve report" },
            ]}
            className="sm:w-56"
          />
          <Input
            aria-label="Resolution note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional resolution note"
            maxLength={300}
            className="flex-1"
          />
          <Button
            size="sm"
            loading={mutation.isPending}
            disabled={action === "NONE" && !note.trim()}
            onClick={() => mutation.mutate()}
          >
            <ShieldCheck className="h-4 w-4" />
            Resolve
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default function ModerationPage() {
  const [status, setStatus] = useState<ModerationFlag["status"] | "">(
    "PENDING",
  );
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-flags", status, page],
    queryFn: () => api.admin.flags({ status, page, limit: 10 }),
  });

  const result = query.data;

  return (
    <RoleGate allow={["ADMIN"]}>
      <PageHeader
        eyebrow="Administration"
        title="Moderation"
        description="Review community reports and hide or approve affected issues."
        actions={
          <CustomSelect
            ariaLabel="Filter moderation reports"
            value={status}
            onChange={(value) => {
              setStatus(value as ModerationFlag["status"] | "");
              setPage(1);
            }}
            options={statusOptions}
            className="w-48"
          />
        }
      />

      {query.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {query.isError ? (
        <EmptyState
          title="Moderation queue unavailable"
          description={getApiErrorMessage(query.error)}
        />
      ) : null}

      {result ? (
        <>
          <div className="space-y-3">
            {result.items.map((item) => (
              <FlagCard key={item.id} flag={item} />
            ))}
          </div>
          {!result.items.length ? (
            <EmptyState
              icon={<Flag className="h-5 w-5" />}
              title="Queue is clear"
              description="There are no reports with this status."
            />
          ) : null}
          <Pagination
            className="mt-5"
            page={page}
            totalPages={result.meta.totalPages}
            total={result.meta.total}
            summaryLabel="report"
            onPageChange={setPage}
          />
        </>
      ) : null}
    </RoleGate>
  );
}
