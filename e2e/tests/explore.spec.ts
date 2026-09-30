import { expect, test } from "@playwright/test";
import { HOME_RECOS, STORES } from "./data";
import { openReady } from "./support";

test.describe("explore pages", () => {
  test("home shows the teasers and recommendations", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".e_HomePage__categoryLink")).toHaveText([
      "Classic Tractors",
      "Autonomous Tractors",
    ]);
    await expect(page.locator(".i_Recommendation_name")).toHaveText(HOME_RECOS);
  });

  test("home page does not jump while widgets load", async ({ page }) => {
    const footerTop = () =>
      page
        .locator(".e_Footer")
        .evaluate((el) => Math.round(el.getBoundingClientRect().top + scrollY));
    await page.goto("/", { waitUntil: "commit" });
    await page.locator(".e_Footer").waitFor();
    // Measure after the Raleway font swap, which moves text by a pixel or two
    // on its own. The test is about widgets, not fonts.
    await page.evaluate(() => document.fonts.ready);
    const before = await footerTop();
    await expect(page.locator(".i_Recommendation_name")).toHaveCount(4);
    await expect(page.locator(".c_MiniCart")).toBeVisible();
    expect(await footerTop()).toBe(before);
  });

  test("category page lists all machines by price", async ({ page }) => {
    await page.goto("/products");
    await expect(
      page.getByRole("heading", { name: "All Machines" }),
    ).toBeVisible();
    await expect(page.locator(".e_CategoryPage__subline p")).toHaveText(
      "23 products",
    );
    await expect(page.locator(".e_Product")).toHaveCount(23);
    await expect(page.locator(".e_Product_name").first()).toHaveText(
      "Sapphire Sunworker 460R",
    );
    await expect(page.locator(".e_Product_price").first()).toHaveText(
      "8500,00 Ø",
    );
    await expect(page.locator(".e_Product_name").last()).toHaveText(
      "TerraFirma AutoCultivator T-300",
    );
    await expect(page.locator(".e_Product_price").last()).toHaveText(
      "1000,00 Ø",
    );
  });

  test("filter narrows the category", async ({ page }) => {
    await openReady(page, "/products", ["explore"]);
    await page.getByRole("link", { name: "Classics" }).click();
    await expect(page).toHaveURL(/\/products\/classic$/);
    await expect(page.locator(".e_CategoryPage__subline p")).toHaveText(
      "15 products",
    );
    await expect(page.locator(".e_Filter__filter--active")).toHaveText(
      "Classics",
    );
  });

  test("stores page lists the stores", async ({ page }) => {
    await page.goto("/stores");
    await expect(
      page.getByRole("heading", { name: "Our Stores" }),
    ).toBeVisible();
    // Each address is "name<br>street<br>city".
    const addresses = await page.locator(".e_Store_address").allInnerTexts();
    expect(addresses.map((a) => a.split("\n")[0].trim())).toEqual(STORES);
  });

  test("header navigation", async ({ page }) => {
    await openReady(page, "/", ["explore"]);
    await page.getByRole("link", { name: "Machines" }).click();
    await expect(page).toHaveURL(/\/products$/);
    await page.getByRole("link", { name: "Stores" }).click();
    await expect(page).toHaveURL(/\/stores$/);
    await page.locator(".e_Header__link").click();
    await expect(page.locator(".e_HomePage__categoryLink")).toHaveCount(2);
  });
});
