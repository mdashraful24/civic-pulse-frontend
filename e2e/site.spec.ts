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

test("privacy policy renders its sections", async ({ page }) => {
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { name: "Privacy Policy" }),
  ).toBeVisible();
  await expect(page.getByText("Information we collect")).toBeVisible();
});
