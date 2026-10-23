import type {
  AdminUser,
  AdminUsersParams,
  ApiEnvelope,
  AuthUser,
  CreateIssuePayload,
  Issue,
  IssueHistoryEntry,
  IssueListParams,
  IssueStats,
  PageResult,
  RegistrationOtp,
  UpdateIssuePayload,
  UpdateStatusPayload,
} from "@/lib/types";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"
).replace(/\/+$/, "");

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
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/resend-otp",
  "/auth/refresh-token",
  "/auth/logout",
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
    changePassword: (payload: {
      currentPassword: string;
      newPassword: string;
    }) =>
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
  },
};

export const getApiErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};
