import type { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  publicIssues: ["public-issues"] as const,
  issue: ["issue"] as const,
  myIssues: ["my-issues"] as const,
  assignedIssues: ["assigned-issues"] as const,
  adminIssues: ["admin-issues"] as const,
  adminUsers: ["admin-users"] as const,
  dashboard: ["dashboard"] as const,
} as const;

export const cachePolicy = {
  live: { staleTime: 30_000, gcTime: 10 * 60_000 },
  list: { staleTime: 60_000, gcTime: 30 * 60_000 },
  stats: { staleTime: 60_000, gcTime: 30 * 60_000 },
  detail: { staleTime: 60_000, gcTime: 30 * 60_000 },
  stable: { staleTime: 5 * 60_000, gcTime: 60 * 60_000 },
  reference: { staleTime: 15 * 60_000, gcTime: 60 * 60_000 },
} as const;

const issueCacheRoots = [
  queryKeys.publicIssues,
  queryKeys.issue,
  queryKeys.myIssues,
  queryKeys.assignedIssues,
  queryKeys.adminIssues,
  queryKeys.dashboard,
];

const userCacheRoots = [queryKeys.adminUsers, ...issueCacheRoots];

export function invalidateIssueCaches(queryClient: QueryClient) {
  for (const queryKey of issueCacheRoots) {
    void queryClient.invalidateQueries({ queryKey });
  }
}

export function invalidateUserCaches(queryClient: QueryClient) {
  for (const queryKey of userCacheRoots) {
    void queryClient.invalidateQueries({ queryKey });
  }
}
