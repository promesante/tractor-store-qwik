import { expect, test } from "@playwright/test";

test.describe("shell", () => {
  test("serves the static assets", async ({ request }) => {
    for (const path of [
      "/cdn/img/logo.svg",
      "/cdn/font/raleway-regular.woff2",
      "/cdn/js/helper.js",
      "/cdn/img/meta/favicon.ico",
      "/cdn/img/product/400/CL-01-GR.webp",
    ]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
    }
  });

  test("shows the 404 page for unknown paths", async ({ page }) => {
    const res = await page.goto("/nope");
    expect(res?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
  });

  test("shows the 404 page when a team answers 404", async ({ page }) => {
    for (const path of ["/products/nope", "/product/NOPE"]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(404);
      await expect(
        page.getByRole("heading", { name: "Page not found" }),
      ).toBeVisible();
    }
  });

  test("boundary toggle outlines every fragment, including nested ones", async ({
    page,
  }) => {
    await page.goto("/");
    const miniCart = page.locator(".c_MiniCart");
    await expect(miniCart).toBeVisible();
    await expect(page.locator(".i_Recommendations")).toBeVisible();

    const outline = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el, "::before").display);

    const boundaries = [
      '[data-boundary-page="explore"]',
      ".e_Header",
      ".e_Footer",
      ".c_MiniCart",
      ".i_Recommendations",
    ];
    for (const selector of boundaries) {
      expect(await outline(selector), selector).toBe("none");
    }

    await page.locator(".showBoundariesToggle label").click();
    for (const selector of boundaries) {
      expect(await outline(selector), selector).toBe("block");
    }

    // The setting is remembered.
    await page.reload();
    await expect(miniCart).toBeVisible();
    await expect.poll(() => outline(".c_MiniCart")).toBe("block");
  });
});
