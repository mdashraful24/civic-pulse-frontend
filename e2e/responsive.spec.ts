import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const keyPages = [
  "/",
  "/issues",
  "/login",
  "/dashboard/analytics",
  "/dashboard/users",
];

test.describe("responsive layouts", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, { authenticated: true });
  });

  for (const viewport of viewports) {
    test(`${viewport.name} has no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      for (const path of keyPages) {
        await page.goto(path);
        await expect(page.locator("main")).toBeVisible();

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(
          overflow,
          `${path} overflowed at ${viewport.name}`,
        ).toBeLessThanOrEqual(2);
      }
    });
  }

  test("public navigation switches at the desktop breakpoint", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const openNavigation = page.getByRole("button", {
      name: "Open navigation",
    });
    await expect(openNavigation).toBeVisible();
    await openNavigation.click();
    await expect(page.locator("#site-mobile-nav")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#site-mobile-nav")).toBeHidden();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(
      page
        .getByRole("navigation")
        .getByRole("link", { name: "Browse issues" })
        .first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toBeHidden();
  });

  test("dashboard navigation switches between sidebar and drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard/analytics");

    await page.getByRole("button", { name: "Open menu" }).click();
    const drawer = page
      .locator("aside")
      .filter({ has: page.getByRole("button", { name: "Close menu" }) });
    await expect(drawer.getByText("Workspace", { exact: true })).toBeVisible();
    await drawer.getByRole("button", { name: "Close menu" }).click();
    await expect(drawer).toBeHidden();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dashboard/analytics");

    await expect(
      page.locator("aside").first().getByText("Workspace", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  });

  test("people directory switches between table and cards", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/dashboard/users");

    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add photo" })).toBeHidden();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard/users");

    await expect(page.getByRole("table")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Add photo" }).first(),
    ).toBeVisible();
  });
});
