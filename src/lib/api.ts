import type {
  AdminAction,
  AdminAnalytics,
  AdminUser,
  AdminUsersParams,
  AIAssigneeRecommendation,
  AIAttribution,
  AICapabilities,
  AICategorySuggestion,
  AIPayload,
  AIPrioritySuggestion,
  AISimilarIssue,
  AISummarySuggestion,
  AITriageSuggestion,
  ApiEnvelope,
  AppSetting,
  AuthUser,
  CreateAdminUserPayload,
  CreateIssuePayload,
  GoogleStatus,
  Issue,
  IssueHistoryEntry,
  IssueListParams,
  IssueStats,
  ModerationFlag,
  ModerationFlagsParams,
  PageResult,
  PasswordResetOtp,
  PublicIssueStats,
  RegistrationOtp,
  UpdateAdminUserPayload,
  UpdateIssuePayload,
  UpdateStatusPayload,
} from "@/lib/types";

export const API_URL = "/api";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipRefresh?: boolean;
};

const NO_REFRESH_PATHS = [
  "/auth/google",
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/resend-otp",
  "/auth/refresh-token",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const serializeBody = (body: unknown): BodyInit | undefined => {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") return body;
  if (typeof FormData !== "undefined" && body instanceof FormData) return body;
  if (typeof Blob !== "undefined" && body instanceof Blob) return body;
  if (
    typeof URLSearchParams !== "undefined" &&
    body instanceof URLSearchParams
  ) {
    return body;
  }
  if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) {
    return body;
  }
  return JSON.stringify(body);
};

const isJsonBody = (body: unknown) =>
  body !== undefined &&
  body !== null &&
  typeof body !== "string" &&
  !(typeof FormData !== "undefined" && body instanceof FormData) &&
  !(typeof Blob !== "undefined" && body instanceof Blob) &&
  !(
    typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams
  ) &&
  !(typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer);

const parseResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as ApiEnvelope<unknown> & {
      errors?: unknown;
    };
  } catch {
    return null;
  }
};

let refreshInFlight: Promise<boolean> | null = null;

const refreshSession = () => {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh-token`, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
        return response.ok;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
};

const request = async <T>(
  path: string,
  { body, skipRefresh, headers, ...init }: RequestOptions = {},
): Promise<ApiEnvelope<T>> => {
  const requestHeaders = new Headers(headers);

  if (isJsonBody(body)) {
    requestHeaders.set("content-type", "application/json");
  }

  const run = () =>
    fetch(`${API_URL}${path}`, {
      ...init,
      headers: requestHeaders,
      body: serializeBody(body),
      credentials: "include",
      cache: "no-store",
    });

  let response = await run();

  if (
    response.status === 401 &&
    !skipRefresh &&
    !NO_REFRESH_PATHS.some((item) => path.startsWith(item))
  ) {
    const refreshed = await refreshSession();
    if (refreshed) response = await run();
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message ?? `Request failed with status ${response.status}.`,
      payload?.errors,
    );
  }

  return (payload ?? {
    success: response.ok,
    statusCode: response.status,
    message: "",
  }) as ApiEnvelope<T>;
};

const queryString = (params: Record<string, unknown>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const value = search.toString();
  return value ? `?${value}` : "";
};

const unwrap = async <T>(promise: Promise<ApiEnvelope<T>>): Promise<T> => {
  const response = await promise;
  if (!response.data) throw new ApiError(500, "AI response was empty.");
  return response.data;
};

const page = <T>(response: ApiEnvelope<T[]>): PageResult<T> => ({
  items: response.data ?? [],
  meta:
    response.meta ??
    ({
      page: 1,
      limit: response.data?.length ?? 0,
      total: response.data?.length ?? 0,
      totalPages: 1,
    } satisfies PageResult<T>["meta"]),
});

export const api = {
  auth: {
    register: async (payload: {
      name: string;
      email: string;
      password: string;
      image?: File | null;
    }) => {
      const formData = new FormData();
      formData.set(
        "body",
        JSON.stringify({
          name: payload.name,
          email: payload.email,
          password: payload.password,
        }),
      );
      if (payload.image) formData.set("image", payload.image);

      return request<RegistrationOtp>("/auth/register", {
        method: "POST",
        body: formData,
      });
    },
    verifyEmail: (payload: { email: string; otp: string }) =>
      request<null>("/auth/verify-email", {
        method: "POST",
        body: payload,
      }),
    resendOtp: (email: string) =>
      request<RegistrationOtp>("/auth/resend-otp", {
        method: "POST",
        body: { email },
      }),
    login: async (payload: { email: string; password: string }) => {
      const response = await request<AuthUser>("/auth/login", {
        method: "POST",
        body: payload,
      });
      if (!response.data) throw new ApiError(500, "Login failed.");
      return response.data;
    },
    me: () => request<AuthUser>("/auth/me"),
    googleStatus: () => request<GoogleStatus>("/auth/google/status"),
    googleIdToken: (idToken: string) =>
      unwrap(
        request<AuthUser>("/auth/google", {
          method: "POST",
          body: { idToken },
          skipRefresh: true,
        }),
      ),
    refresh: () =>
      request<AuthUser>("/auth/refresh-token", {
        method: "POST",
        skipRefresh: true,
      }),
    logout: () =>
      request<null>("/auth/logout", {
        method: "POST",
      }),
    updateProfileImage: (file: File) => {
      const formData = new FormData();
      formData.set("image", file);
      return request<AuthUser>("/auth/me/image", {
        method: "PATCH",
        body: formData,
      });
    },
    removeProfileImage: () =>
      request<AuthUser>("/auth/me/image", {
        method: "DELETE",
      }),
    forgotPassword: (email: string) =>
      request<PasswordResetOtp>("/auth/forgot-password", {
        method: "POST",
        body: { email },
        skipRefresh: true,
      }),
    resetPassword: (payload: {
      email: string;
      otp: string;
      newPassword: string;
    }) =>
      request<null>("/auth/reset-password", {
        method: "POST",
        body: payload,
        skipRefresh: true,
      }),
    changePassword: (payload: { newPassword: string }) =>
      request<null>("/auth/change-password", {
        method: "POST",
        body: payload,
      }),
  },
  issues: {
    listPublic: (params: IssueListParams = {}) =>
      request<Issue[]>(`/issues${queryString(params)}`, {
        skipRefresh: true,
      }).then(page),
    publicStats: async () => {
      const response = await request<PublicIssueStats>("/issues/public-stats", {
        skipRefresh: true,
      });
      if (!response.data) throw new ApiError(500, "Public stats were empty.");
      return response.data;
    },
    get: async (id: string) => {
      const response = await request<Issue>(`/issues/${id}`, {
        skipRefresh: true,
      });
      if (!response.data) throw new ApiError(404, "Issue not found.");
      return response.data;
    },
    history: async (id: string) => {
      const response = await request<IssueHistoryEntry[]>(
        `/issues/${id}/history`,
        { skipRefresh: true },
      );
      return response.data ?? [];
    },
    mine: (params: IssueListParams = {}) =>
      request<Issue[]>(`/issues/me${queryString(params)}`).then(page),
    assigned: (params: IssueListParams = {}) =>
      request<Issue[]>(`/issues/assigned${queryString(params)}`).then(page),
    create: (payload: CreateIssuePayload, image?: File | null) => {
      if (image) {
        const formData = new FormData();
        formData.set("body", JSON.stringify(payload));
        formData.set("image", image);
        return request<Issue>("/issues", {
          method: "POST",
          body: formData,
        });
      }
      return request<Issue>("/issues", {
        method: "POST",
        body: payload,
      });
    },
    update: (id: string, payload: UpdateIssuePayload) =>
      request<Issue>(`/issues/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    remove: (id: string) =>
      request<null>(`/issues/${id}`, {
        method: "DELETE",
      }),
    updateImage: (id: string, file: File) => {
      const formData = new FormData();
      formData.set("image", file);
      return request<Issue>(`/issues/${id}/image`, {
        method: "PATCH",
        body: formData,
      });
    },
    assign: (id: string, personnelId: string | null) =>
      request<Issue>(`/issues/${id}/assign`, {
        method: "PATCH",
        body: { personnelId },
      }),
    updateStatus: (id: string, payload: UpdateStatusPayload) =>
      request<Issue>(`/issues/${id}/status`, {
        method: "PATCH",
        body: payload,
      }),
    updatePriority: (id: string, priority: Issue["priority"]) =>
      request<Issue>(`/issues/${id}/priority`, {
        method: "PATCH",
        body: { priority },
      }),
  },
  dashboard: {
    stats: async () => {
      const response = await request<IssueStats>("/dashboard/stats");
      if (!response.data) throw new ApiError(500, "Stats unavailable.");
      return response.data;
    },
  },
  admin: {
    users: (params: AdminUsersParams = {}) =>
      request<AdminUser[]>(`/admin/users${queryString(params)}`).then(page),
    createUser: (payload: CreateAdminUserPayload) =>
      unwrap(
        request<AdminUser>("/admin/users", {
          method: "POST",
          body: payload,
        }),
      ),
    updateUser: (id: string, payload: UpdateAdminUserPayload) =>
      unwrap(
        request<AdminUser>(`/admin/users/${id}`, {
          method: "PATCH",
          body: payload,
        }),
      ),
    updateUserImage: (id: string, file: File) => {
      const formData = new FormData();
      formData.set("image", file);
      return request<AdminUser>(`/admin/users/${id}/image`, {
        method: "PATCH",
        body: formData,
      });
    },
    removeUserImage: (id: string) =>
      request<null>(`/admin/users/${id}/image`, {
        method: "DELETE",
      }),
    changeUserRole: (id: string, role: AdminUser["role"]) =>
      unwrap(
        request<AdminUser>(`/admin/users/${id}/role`, {
          method: "PATCH",
          body: { role },
        }),
      ),
    changeUserStatus: (id: string, status: "ACTIVE" | "BLOCKED") =>
      unwrap(
        request<AdminUser>(`/admin/users/${id}/status`, {
          method: "PATCH",
          body: { status },
        }),
      ),
    deleteUser: (id: string) =>
      request<null>(`/admin/users/${id}`, { method: "DELETE" }),
    resetUserPassword: (id: string) =>
      unwrap(
        request<{ temporaryPassword: string }>(
          `/admin/users/${id}/reset-password`,
          { method: "POST" },
        ),
      ),
    terminateUserSessions: (id: string) =>
      request<null>(`/admin/users/${id}/terminate-sessions`, {
        method: "POST",
      }),
    analytics: (days: 7 | 30 | 90 = 30) =>
      unwrap(request<AdminAnalytics>(`/admin/analytics?days=${days}`)),
    activity: (params: { page?: number; limit?: number } = {}) =>
      request<AdminAction[]>(`/admin/activity${queryString(params)}`).then(
        page,
      ),
    flags: (params: ModerationFlagsParams = {}) =>
      request<ModerationFlag[]>(
        `/admin/moderation/flags${queryString(params)}`,
      ).then(page),
    createFlag: (payload: { issueId: string; reason: string }) =>
      unwrap(
        request<ModerationFlag>("/admin/moderation/flags", {
          method: "POST",
          body: payload,
        }),
      ),
    resolveFlag: (
      id: string,
      payload: {
        status: ModerationFlag["status"];
        action: ModerationFlag["action"];
        note?: string;
      },
    ) =>
      unwrap(
        request<ModerationFlag>(`/admin/moderation/flags/${id}`, {
          method: "PATCH",
          body: payload,
        }),
      ),
    settings: () => unwrap(request<AppSetting[]>("/admin/settings")),
    saveSetting: (key: string, value: string) =>
      unwrap(
        request<AppSetting>("/admin/settings", {
          method: "PUT",
          body: { key, value },
        }),
      ),
  },
  ai: {
    capabilities: () => unwrap(request<AICapabilities>("/ai/capabilities")),
    categorize: (payload: AIPayload) =>
      unwrap(
        request<AICategorySuggestion>("/ai/categorize", {
          method: "POST",
          body: {
            title: payload.title,
            description: payload.description,
          },
        }),
      ),
    prioritize: (payload: AIPayload) =>
      unwrap(
        request<AIPrioritySuggestion>("/ai/prioritize", {
          method: "POST",
          body: {
            title: payload.title,
            description: payload.description,
            category: payload.category || undefined,
            location: payload.location || undefined,
          },
        }),
      ),
    summarize: (payload: AIPayload) =>
      unwrap(
        request<AISummarySuggestion>("/ai/summarize", {
          method: "POST",
          body: payload.issueId
            ? { issueId: payload.issueId }
            : { text: payload.description },
        }),
      ),
    duplicates: (payload: AIPayload & { excludeId?: string; limit?: number }) =>
      unwrap(
        request<{
          matches: AISimilarIssue[];
          attribution: AIAttribution;
        }>("/ai/duplicates", {
          method: "POST",
          body: {
            title: payload.title,
            description: payload.description,
            excludeId: payload.excludeId,
            limit: payload.limit,
          },
        }),
      ),
    search: (q: string, limit = 8) =>
      unwrap(
        request<{
          query: string;
          results: AISimilarIssue[];
          attribution: AIAttribution;
        }>(`/ai/search${queryString({ q, limit })}`),
      ),
    recommendAssignee: (issueId: string) =>
      unwrap(
        request<{
          issueId: string;
          recommendations: AIAssigneeRecommendation[];
          attribution: AIAttribution;
        }>("/ai/recommend-assignee", {
          method: "POST",
          body: { issueId },
        }),
      ),
    triage: (payload: AIPayload) =>
      unwrap(
        request<AITriageSuggestion>("/ai/triage", {
          method: "POST",
          body: {
            title: payload.title,
            description: payload.description,
            category: payload.category || undefined,
            location: payload.location || undefined,
            issueId: payload.issueId,
          },
        }),
      ),
  },
};

export const getApiErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};
