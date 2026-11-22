"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RoleGate } from "@/components/dashboard/auth-guard";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

const labelFor = (action: string) =>
  action
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (character) => character.toUpperCase());

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-activity", page],
    queryFn: () => api.admin.activity({ page, limit: 20 }),
  });

  const result = query.data;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <RoleGate allow={["ADMIN"]}>
        <PageHeader
          eyebrow="Administration"
          title="Activity log"
          description="Every administrative change, who made it and when."
        />

        {query.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : null}

        {query.isError ? (
          <EmptyState
            title="Activity unavailable"
            description={getApiErrorMessage(query.error)}
          />
        ) : null}

        {result ? (
          <>
            <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-stone-50/80 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                    <tr>
                      <th className="px-5 py-3">Action</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-5 py-3">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {result.items.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/50">
                        <td className="px-5 py-3 font-semibold text-ink">
                          {labelFor(item.action)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-ink">
                            {item.actor.name}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {item.actor.email}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-stone-600">
                          {item.targetType}
                          {item.targetId
                            ? ` · ${item.targetId.slice(0, 8)}`
                            : ""}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-stone-500">
                          {item.metadata ? JSON.stringify(item.metadata) : "—"}
                        </td>
                        <td className="px-5 py-3 text-xs text-stone-600">
                          {formatDateTime(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {!result.items.length ? (
              <EmptyState
                className="mt-4"
                title="No activity recorded"
                description="Administrative actions will appear here."
              />
            ) : null}

            <Pagination
              className="mt-5"
              page={page}
              totalPages={result.meta.totalPages}
              total={result.meta.total}
              summaryLabel="action"
              onPageChange={setPage}
            />
          </>
        ) : null}
      </RoleGate>
    </div>
  );
}
