import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers";

test.describe("admin dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, { authenticated: true });
  });

  test("analytics shows operational metrics", async ({ page }) => {
    await page.goto("/dashboard/analytics");

    await expect(
      page.locator("main").getByRole("heading", { name: "Analytics" }),
    ).toBeVisible();
    await expect(page.getByText("Reports", { exact: true })).toBeVisible();
    await expect(page.getByText("67%")).toBeVisible();
  });

  test("people page exposes account controls", async ({ page }) => {
    await page.goto("/dashboard/users");

    await expect(page.getByText("Maya Patel").first()).toBeVisible();
    await expect(
      page.getByLabel("Account controls for Maya Patel").first(),
    ).toBeVisible();
  });

  test("people page can add and edit a person", async ({ page }) => {
    await page.goto("/dashboard/users");

    await page.getByRole("button", { name: "Add person" }).click();
    await expect(
      page.getByRole("dialog", { name: "Add a person" }),
    ).toBeVisible();
    await page.getByLabel("Full name").fill("Avery Stone");
    await page.getByLabel("Email address").fill("avery@example.com");
    await page.getByPlaceholder("Secure-1234").fill("Secure-1234");
    await page.getByRole("button", { name: "Create person" }).click();

    await expect(page.getByText("User created.")).toBeVisible();

    await page.getByRole("button", { name: "Edit Maya Patel" }).first().click();
    await expect(
      page.getByRole("dialog", { name: "Edit person" }),
    ).toBeVisible();
    await page.getByLabel("Full name").fill("Maya Updated");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("User updated.")).toBeVisible();
  });

  test("moderation queue shows reported issues", async ({ page }) => {
    await page.goto("/dashboard/moderation");

    await expect(
      page.locator("main").getByRole("heading", { name: "Moderation" }),
    ).toBeVisible();
    await expect(
      page.getByText("Please review this duplicate report"),
    ).toBeVisible();
  });

  test("settings page loads configuration values", async ({ page }) => {
    await page.goto("/dashboard/settings");

    await expect(
      page.locator("main").getByRole("heading", { name: "App settings" }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Key" }).first(),
    ).toHaveValue("site.notice");
    await expect(
      page.getByRole("textbox", { name: "Value" }).first(),
    ).toHaveValue("Report issues in your neighbourhood.");
  });
});
