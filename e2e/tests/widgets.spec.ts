import { expect, test } from "@playwright/test";
import { RECOS } from "./data";
import { openReady } from "./support";

test.describe("widgets", () => {
  for (const [skus, expected] of Object.entries(RECOS)) {
    test(`recommendations for "${skus}"`, async ({ page }) => {
      await page.goto(`/_fragment/explore/recommendations?skus=${skus}`);
      await expect(page.locator(".e_Recommendation_name")).toHaveText(expected);
    });
  }

  test("store picker selects a store and tells the page", async ({ page }) => {
    await openReady(page, "/_fragment/explore/store-picker", ["explore"]);
    await page.evaluate(() => {
      const w = window as unknown as { events: unknown[] };
      w.events = [];
      new BroadcastChannel("tractor-store").onmessage = (m) =>
        w.events.push(m.data);
    });
    const dialog = page.locator("dialog.e_StorePicker_dialog");
    await expect(dialog).not.toBeVisible();

    await page.getByRole("button", { name: "choose a store" }).click();
    await expect(dialog).toBeVisible();
    await page.locator('[data-id="store-b"]').click();
    await expect(dialog).not.toBeVisible();

    await expect(page.locator(".e_StorePicker_selected")).toContainText(
      "Big Micro Machines",
    );
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { events: unknown[] }).events,
        ),
      )
      .toEqual([{ type: "explore:store-selected", storeId: "store-b" }]);
  });

  test("add to cart shows price and stock", async ({ page }) => {
    await page.goto("/_fragment/checkout/add-to-cart?sku=CL-01-GR");
    await expect(page.locator(".c_AddToCart__information")).toContainText(
      "5700 Ø",
    );
    await expect(page.locator(".c_AddToCart__stock")).toHaveText(
      "8 in stock, free shipping",
    );
    await expect(
      page.getByRole("button", { name: "add to basket" }),
    ).toBeEnabled();
  });

  test("add to cart is disabled when out of stock", async ({ page }) => {
    await page.goto("/_fragment/checkout/add-to-cart?sku=CL-04-TQ");
    await expect(page.locator(".c_AddToCart__stock")).toHaveText(
      "out of stock",
    );
    await expect(
      page.getByRole("button", { name: "add to basket" }),
    ).toBeDisabled();
  });

  test("add to cart answers 404 for an unknown SKU", async ({ request }) => {
    const res = await request.get("/_fragment/checkout/add-to-cart?sku=NOPE");
    expect(res.status()).toBe(404);
  });
});
