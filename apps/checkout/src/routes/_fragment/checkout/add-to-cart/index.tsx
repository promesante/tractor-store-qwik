import { $, component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { publish } from "@tractor/events";
import { Button } from "@tractor/ui";
import { findVariant } from "~/data";
import { addToCart } from "~/lib/cart";

/**
 * Add to cart widget, embedded in Team Decide's product page.
 * Input: ?sku=SKU of the selected variant.
 *
 * After adding, it sends "checkout:cart-updated" so the mini cart updates.
 */
export const useVariant = routeLoader$(({ url, error }) => {
  const variant = findVariant(url.searchParams.get("sku"));
  if (!variant) throw error(404, "Unknown SKU");
  return variant;
});

const addSku = server$(function (sku: string) {
  if (!findVariant(sku)) return false;
  addToCart(this.cookie, sku);
  return true;
});

export default component$(() => {
  const variant = useVariant();
  const added = useSignal(false);
  const { sku, price, inventory } = variant.value;
  const outOfStock = inventory === 0;

  const add = $(async () => {
    if (await addSku(sku)) {
      added.value = true;
      publish({ type: "checkout:cart-updated" });
    }
  });

  return (
    <form
      class="c_AddToCart"
      data-boundary="checkout"
      preventdefault:submit
      onSubmit$={add}
    >
      <div class="c_AddToCart__information">
        <p>{price} Ø</p>
        {outOfStock ? (
          <p class="c_AddToCart__stock c_AddToCart__stock--empty">
            out of stock
          </p>
        ) : (
          <p class="c_AddToCart__stock c_AddToCart__stock--ok">
            {inventory} in stock, free shipping
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={outOfStock}
        class="c_AddToCart__button"
        variant="primary"
      >
        add to basket
      </Button>
      <div
        class={[
          "c_AddToCart__confirmed",
          !added.value && "c_AddToCart__confirmed--hidden",
        ]}
      >
        <p>Tractor was added.</p>
        <a href="/checkout/cart" class="c_AddToCart__link">
          View in basket.
        </a>
      </div>
    </form>
  );
});
