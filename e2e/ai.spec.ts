import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers";

test("AI workspace renders capabilities and search UI", async ({ page }) => {
  await mockApi(page, { authenticated: true });

  await page.goto("/dashboard/ai");

  await expect(page.getByText("AI workspace")).toBeVisible();
  await expect(page.getByText("Provider: local")).toBeVisible();
  await expect(page.getByText("Smart categorization")).toBeVisible();
  await expect(page.getByText("Semantic issue search").first()).toBeVisible();
});
