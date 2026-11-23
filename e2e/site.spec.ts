import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("landing page renders the hero", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /See it\. Report it\./ }),
  ).toBeVisible();
});

test("landing page shows six feature cards", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#features article")).toHaveCount(6);
  await expect(
    page.getByRole("heading", { name: /Everything a neighbourhood needs/ }),
  ).toBeVisible();
});

test("footer links the three public legal pages", async ({ page }) => {
  await page.goto("/");

  const footer = page.locator("footer");
  await expect(
    footer.getByRole("link", { name: "Terms & Conditions" }),
  ).toBeVisible();
  await expect(
    footer.getByRole("link", { name: "Privacy Policy" }),
  ).toBeVisible();
  await expect(footer.getByRole("link", { name: "Security" })).toBeVisible();
});

test("header exposes professional public pages only", async ({ page }) => {
  await page.goto("/");

  const nav = page.locator("header").getByRole("navigation");
  await expect(nav.getByRole("link", { name: "About" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Services" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Contact" })).toBeVisible();
  await expect(
    nav.getByRole("link", { name: "Terms & Conditions" }),
  ).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Privacy Policy" })).toHaveCount(
    0,
  );
  await expect(nav.getByRole("link", { name: "Security" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "How it works" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Categories" })).toHaveCount(0);
});

test("public pages render unique layouts", async ({ page }) => {
  for (const config of [
    {
      path: "/about",
      heading: /A shared record/,
      markers: ["#story", "#principles", "#audience"],
    },
    {
      path: "/services",
      heading: /Everything needed/,
      markers: ["#service-details", "#service-index", "#residents"],
    },
    {
      path: "/contact",
      heading: /We are here to help/,
      markers: ["#channels", "#before-you-write"],
    },
  ]) {
    await page.goto(config.path);
    await expect(
      page.getByRole("heading", { level: 1, name: config.heading }),
    ).toBeVisible();
    for (const marker of config.markers) {
      await expect(page.locator(marker)).toBeVisible();
    }
  }
});

test("issue browser applies deep search and sorting", async ({ page }) => {
  const requests: string[] = [];

  await page.route("**/api/issues**", async (route) => {
    requests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        statusCode: 200,
        message: "Issues retrieved.",
        data: [],
        meta: { page: 1, limit: 9, total: 0, totalPages: 0 },
      }),
    });
  });

  await page.goto("/issues?search=lamp&sort=priority");

  await expect(page.getByText("0 reports found")).toBeVisible();
  await expect(page.getByText("High priority first")).toBeVisible();

  const url = new URL(requests[0]);
  expect(url.searchParams.get("search")).toBe("lamp");
  expect(url.searchParams.get("sort")).toBe("priority");
});

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });

  await skipLink.focus();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press("Enter");

  await expect(page.locator("#main-content")).toBeFocused();
});

test("login page renders the sign-in form", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
});

test("login page offers Google sign-in when enabled", async ({ page }) => {
  await mockApi(page, { googleEnabled: true });
  await page.goto("/login");

  const googleLink = page.getByRole("link", {
    name: "Continue with Google",
  });
  await expect(googleLink).toBeVisible();
  await expect(googleLink).toHaveAttribute("href", "/api/auth/google");
});

test("Google completion page reports callback failures", async ({ page }) => {
  await page.goto("/auth/google/complete?status=error&reason=failed");

  await expect(
    page.getByRole("heading", { name: "Google sign-in failed." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Back to sign in" }),
  ).toBeVisible();
});

test("forgot password page requests a reset code", async ({ page }) => {
  await page.route("**/api/auth/forgot-password", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        statusCode: 200,
        message: "Reset code sent.",
        data: { expiresIn: 300, expiresAt: "2026-11-23T00:00:00.000Z" },
      }),
    });
  });

  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill("resident@example.com");
  await page.getByRole("button", { name: /Send reset code/i }).click();

  await expect(page.getByText("Check your inbox.")).toBeVisible();
});

test("reset password page submits a new password", async ({ page }) => {
  await page.route("**/api/auth/reset-password", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        statusCode: 200,
        message: "Password reset.",
        data: null,
      }),
    });
  });

  await page.goto("/reset-password");
  await page.getByLabel("Email address").fill("resident@example.com");
  await page.getByLabel("Reset code").fill("123456");
  await page.locator("#new-password").fill("NewPassword123");
  await page.getByLabel("Confirm new password").fill("NewPassword123");
  await page.getByRole("button", { name: /Reset password/i }).click();

  await expect(page).toHaveURL(/\/login$/);
});

test("privacy policy renders its sections", async ({ page }) => {
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { name: "Privacy Policy" }),
  ).toBeVisible();
  await expect(page.getByText("Information we collect")).toBeVisible();
});
