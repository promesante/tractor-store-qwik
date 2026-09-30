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
    await expect(page.locator(".e_Recommendation_name")).toHaveText(HOME_RECOS);
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
