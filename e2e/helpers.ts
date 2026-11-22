import type { Page } from "@playwright/test";

const user = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "CivicPulse Admin",
  email: "admin@civicpulse.local",
  imageUrl: null,
  role: "ADMIN",
  status: "ACTIVE",
  emailVerified: true,
  lastLoginAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const capabilities = {
  provider: "local",
  capabilities: [
    {
      task: "categorize",
      name: "Smart categorization",
      description: "Suggests a category.",
      advanced: false,
    },
    {
      task: "search",
      name: "Semantic issue search",
      description: "Finds related reports by meaning.",
      advanced: true,
    },
  ],
  usage: { usedToday: 1, limit: 100, remaining: 99 },
  cachingEnabled: true,
};

const adminUser = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Maya Patel",
  email: "maya@example.com",
  imageUrl: null,
  role: "CITIZEN",
  status: "ACTIVE",
  emailVerified: true,
  lastLoginAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  _count: { reportedIssues: 2, assignedIssues: 0 },
};

const analytics = {
  totalIssues: 12,
  resolved: 8,
  pending: 3,
  highPriority: 2,
  averageResolutionHours: 18,
  resolutionRate: 67,
  newUsers: 4,
  issuesByDay: [{ date: "2026-01-01", count: 2 }],
  categories: [{ category: "ROADS", count: 5 }],
};

const activity = {
  items: [
    {
      id: "action-1",
      actor: user,
      action: "CHANGE_USER_ROLE",
      targetType: "USER",
      targetId: adminUser.id,
      metadata: { role: "PERSONNEL" },
      createdAt: "2026-01-02T00:00:00.000Z",
    },
  ],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

const flag = {
  id: "flag-1",
  issueId: "issue-1",
  reporterId: "33333333-3333-4333-8333-333333333333",
  reason: "Please review this duplicate report",
  status: "PENDING",
  action: "NONE",
  resolutionNote: null,
  resolvedById: null,
  resolvedAt: null,
  createdAt: "2026-01-02T00:00:00.000Z",
  issue: {
    id: "issue-1",
    title: "Large pothole on Main Street",
    category: "ROADS",
    moderationStatus: "VISIBLE",
  },
  reporter: {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Citizen Reporter",
    imageUrl: null,
  },
};

const settings = [
  {
    key: "site.notice",
    value: "Report issues in your neighbourhood.",
    updatedBy: user,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

export async function mockApi(
  page: Page,
  { authenticated = false }: { authenticated?: boolean } = {},
) {
  await page.route("**/api/**", async (route) => {
    const url = route.request().url();

    const fulfill = (
      data: unknown,
      status = 200,
      meta?: { page: number; limit: number; total: number; totalPages: number },
    ) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify({
          success: status < 400,
          statusCode: status,
          message: status < 400 ? "ok" : "Error",
          ...(status < 400 ? { data } : {}),
          ...(status < 400 && meta ? { meta } : {}),
        }),
      });

    if (url.includes("/auth/me")) {
      await fulfill(authenticated ? user : null, authenticated ? 200 : 401);
      return;
    }
    if (url.includes("/admin/analytics")) {
      await fulfill(analytics);
      return;
    }
    if (url.includes("/admin/activity")) {
      await fulfill(activity.items, 200, activity.meta);
      return;
    }
    if (url.includes("/admin/moderation/flags")) {
      await fulfill([flag], 200, {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
      return;
    }
    if (url.includes("/admin/settings")) {
      await fulfill(settings);
      return;
    }
    if (url.includes("/admin/users")) {
      await fulfill([adminUser], 200, {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
      return;
    }
    if (url.includes("/ai/capabilities")) {
      await fulfill(capabilities);
      return;
    }
    if (url.includes("/ai/search")) {
      await fulfill({
        query: "lamp",
        results: [],
        attribution: {
          provider: "local",
          degraded: false,
          cached: false,
          usage: { usedToday: 1, limit: 100, remaining: 99 },
        },
      });
      return;
    }
    await fulfill({ items: [], meta: { page: 1, limit: 6, total: 0 } });
  });
}
