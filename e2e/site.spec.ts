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

test("login page renders the sign-in form", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
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
