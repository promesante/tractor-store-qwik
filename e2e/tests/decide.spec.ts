import { expect, test, type Page } from "@playwright/test";
import { RECOS } from "./data";
import { openReady } from "./support";

/** Top of the product section, to detect the page jumping. */
const mainTop = (page: Page) =>
  page
    .locator(".d_ProductPage")
    .evaluate((el) => Math.round(el.getBoundingClientRect().top));

test.describe("product page", () => {
  test("shows the product and the other teams' widgets", async ({ page }) => {
    await page.goto("/product/CL-01?sku=CL-01-GR");
    await expect(page.locator(".d_ProductPage__title")).toHaveText(
      "Heritage Workhorse",
    );
    await expect(page.locator(".d_ProductPage__highlights li")).toHaveCount(3);
    await expect(page.locator(".d_VariantOption")).toHaveText([
      "Verdant Field",
      "Stormy Sky",
    ]);
    await expect(page.locator(".d_VariantOption strong")).toHaveText(
      "Verdant Field",
    );

    await expect(page.locator(".e_Header")).toBeVisible();
    await expect(page.locator(".c_MiniCart")).toBeVisible();
    await expect(page.locator(".c_AddToCart__information")).toContainText(
      "5700 Ø",
    );
    await expect(page.locator(".i_Recommendation_name")).toHaveText(
      RECOS["CL-01-GR"],
    );
    await expect(page.locator(".e_Footer")).toBeVisible();
  });

  test("does not jump while the widgets load", async ({ page }) => {
    await page.goto("/product/CL-01?sku=CL-01-GR", { waitUntil: "commit" });
    await page.locator(".d_ProductPage").waitFor();
    const before = await mainTop(page);
    await expect(page.locator(".c_AddToCart")).toBeVisible();
    await expect(page.locator(".c_MiniCart")).toBeVisible();
    expect(await mainTop(page)).toBe(before);
    expect(before).toBe(181);
  });

  test("changes the variant without reloading the page", async ({ page }) => {
    await openReady(page, "/product/CL-01?sku=CL-01-GR", ["decide"]);
    await expect(page.locator(".i_Recommendation_name")).toHaveText(
      RECOS["CL-01-GR"],
    );
    await page.evaluate(
      () => ((window as unknown as { marker: string }).marker = "same"),
    );

    await page.getByRole("link", { name: "Stormy Sky", exact: true }).click();
    await expect(page).toHaveURL(/sku=CL-01-GY/);
    await expect(page.locator(".d_VariantOption strong")).toHaveText(
      "Stormy Sky",
    );
    await expect(page.locator(".d_ProductPage__productImage")).toHaveAttribute(
      "src",
      "/cdn/img/product/400/CL-01-GY.webp",
    );
    await expect(page.locator(".i_Recommendation_name")).toHaveText(
      RECOS["CL-01-GY"],
    );
    await expect(page.locator(".c_AddToCart")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => (window as unknown as { marker?: string }).marker,
      ),
    ).toBe("same");

    await page.goBack();
    await expect(page).toHaveURL(/sku=CL-01-GR/);
    await expect(page.locator(".d_VariantOption strong")).toHaveText(
      "Verdant Field",
    );
  });

  test("recommendation links open other products", async ({ page }) => {
    await openReady(page, "/product/CL-01?sku=CL-01-GR", [
      "inspire-recommendations-CL-01-GR",
    ]);
    await page.getByText(RECOS["CL-01-GR"][0], { exact: true }).click();
    await expect(page).toHaveURL(/\/product\/CL-09\?sku=CL-09-GR$/);
    await expect(page.locator(".d_ProductPage__title")).toHaveText(
      "TerraFirma Veneto",
    );
  });
});
