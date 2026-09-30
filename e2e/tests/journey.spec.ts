import { expect, test, type BrowserContext } from "@playwright/test";
import { RECOS } from "./data";
import { openReady, waitForFragments } from "./support";

const cartCookie = async (context: BrowserContext) =>
  (await context.cookies()).find((c) => c.name === "c_cart")?.value ?? "";

test.describe("shopping journey", () => {
  test("add to cart updates the mini cart in another tab", async ({
    context,
  }) => {
    const home = await context.newPage();
    await openReady(home, "/", ["checkout-mini-cart"]);
    await expect(home.locator(".c_MiniCart__quantity")).toHaveText("");

    const product = await context.newPage();
    await openReady(product, "/product/CL-01?sku=CL-01-GR", [
      "checkout-add-to-cart-CL-01-GR",
    ]);
    await product.getByRole("button", { name: "add to basket" }).click();

    await expect(product.locator(".c_AddToCart__confirmed")).toBeVisible();
    await expect(home.locator(".c_MiniCart__quantity")).toHaveText("1");
    const cookie = (await context.cookies()).find((c) => c.name === "c_cart");
    expect(cookie).toMatchObject({
      value: "CL-01-GR_1",
      httpOnly: true,
      path: "/",
    });

    await home.reload();
    await expect(home.locator(".c_MiniCart__quantity")).toHaveText("1");
  });

  test("from product to order confirmation", async ({ page, context }) => {
    const addToBasket = async (expected: string) => {
      await page.getByRole("button", { name: "add to basket" }).click();
      await expect(page.locator(".c_MiniCart__quantity")).toHaveText(expected);
    };

    // Add two of one variant and one of another.
    await openReady(page, "/product/CL-01?sku=CL-01-GR", [
      "decide",
      "checkout-mini-cart",
      "checkout-add-to-cart-CL-01-GR",
    ]);
    await addToBasket("1");
    await addToBasket("2");
    await page.getByRole("link", { name: "Stormy Sky", exact: true }).click();
    await expect(page.locator(".c_AddToCart__information")).toContainText(
      "6200 Ø",
    );
    await waitForFragments(page, ["checkout-add-to-cart-CL-01-GY"]);
    await addToBasket("3");
    expect(await cartCookie(context)).toBe("CL-01-GR_2|CL-01-GY_1");

    // Cart, through the mini cart.
    await page.locator(".c_MiniCart__button").click();
    await expect(page).toHaveURL(/\/checkout\/cart$/);
    await waitForFragments(page, ["checkout", "checkout-mini-cart"]);
    await expect(page.locator(".c_LineItem__name")).toHaveText([
      /Verdant Field\s*CL-01-GR/,
      /Stormy Sky\s*CL-01-GY/,
    ]);
    await expect(page.locator(".c_LineItem__quantity > span")).toHaveText([
      "2",
      "1",
    ]);
    await expect(page.locator(".c_LineItem__price")).toHaveText([
      "11400 Ø",
      "6200 Ø",
    ]);
    await expect(page.locator(".c_CartPage__total")).toHaveText(
      "Total: 17600 Ø",
    );
    await expect(page.locator(".i_Recommendation_name")).toHaveText(
      RECOS["CL-01-GR,CL-01-GY"],
    );

    // Remove the second line item.
    await page
      .getByTitle("Remove Heritage Workhorse Stormy Sky from cart")
      .click();
    await expect(page.locator(".c_LineItem")).toHaveCount(1);
    await expect(page.locator(".c_CartPage__total")).toHaveText(
      "Total: 11400 Ø",
    );
    await expect(page.locator(".c_MiniCart__quantity")).toHaveText("2");
    await expect(page.locator(".i_Recommendation_name")).toHaveText(
      RECOS["CL-01-GR"],
    );
    expect(await cartCookie(context)).toBe("CL-01-GR_2");

    // Checkout: place order stays disabled until the form is complete.
    await page.getByRole("link", { name: "Checkout", exact: true }).click();
    await expect(page).toHaveURL(/\/checkout\/checkout$/);
    await waitForFragments(page, ["checkout", "explore-store-picker"]);
    await expect(page.locator(".c_CompactHeader")).toBeVisible();
    await expect(page.locator(".e_Header")).toHaveCount(0);
    const placeOrder = page.getByRole("button", { name: "place order" });
    await expect(placeOrder).toBeDisabled();

    await page.fill("#c_firstname", "Ada");
    await page.fill("#c_lastname", "Lovelace");
    await expect(placeOrder).toBeDisabled();

    await page.getByRole("button", { name: "choose a store" }).click();
    await page.locator('[data-id="store-c"]').click();
    await expect(page.locator("#c_storeId")).toHaveValue("store-c");
    await expect(page.locator(".e_StorePicker_selected")).toContainText(
      "Central Mall",
    );
    await expect(placeOrder).toBeEnabled();

    // Place the order.
    await placeOrder.click();
    await expect(page).toHaveURL(/\/checkout\/thanks$/);
    await expect(
      page.getByRole("heading", { name: "Thanks for your order!" }),
    ).toBeVisible();
    // The confetti library loads after the page, so wait for pixels.
    await expect
      .poll(() =>
        page
          .locator("canvas.c_Thanks__confetti")
          .evaluate((canvas: HTMLCanvasElement) => {
            if (canvas.width === 0 || canvas.height === 0) return 0;
            const ctx = canvas.getContext("2d")!;
            const data = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            ).data;
            let pixels = 0;
            for (let i = 3; i < data.length; i += 4) if (data[i]) pixels++;
            return pixels;
          }),
      )
      .toBeGreaterThan(0);
    await expect(page.locator(".c_MiniCart__quantity")).toHaveText("");
    expect(await cartCookie(context)).toBe("");

    // The cart is empty, and recommends like the blueprint does.
    await page.goto("/checkout/cart");
    await expect(page.locator(".c_LineItem")).toHaveCount(0);
    await expect(page.locator(".c_CartPage__total")).toHaveText("Total: 0 Ø");
    await expect(page.locator(".i_Recommendation_name")).toHaveText(RECOS[""]);
  });
});
