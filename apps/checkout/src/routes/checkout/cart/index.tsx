import { $, component$, useSignal, type QRL } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { publish } from "@tractor/events";
import { Button } from "@tractor/ui";
import { ExploreFooter, ExploreHeader } from "~/components/widgets";
import {
  readCart,
  removeFromCart,
  toLineItems,
  type LineItem as LineItemData,
} from "~/lib/cart";
import { src, srcset } from "~/lib/format";

export const useLineItems = routeLoader$(({ cookie }) =>
  toLineItems(readCart(cookie)),
);

/**
 * Removes a line item and returns the new line items.
 *
 * A server function rather than a Qwik City form action: the action's Form
 * builds a FormData from the form element, and inside a Web Fragment the
 * element belongs to the main page's realm, which the fragment realm's
 * FormData rejects.
 */
const removeSku = server$(function (sku: string) {
  return toLineItems(removeFromCart(this.cookie, sku));
});

const LineItem = component$<{
  item: LineItemData;
  onRemove$: QRL<(sku: string) => void>;
}>(({ item: { sku, id, name, quantity, total, image }, onRemove$ }) => {
  const url = `/product/${id}?sku=${sku}`;
  return (
    <li class="c_LineItem">
      <a href={url} class="c_LineItem__image">
        <img
          src={src(image, 200)}
          srcset={srcset(image, [200, 400])}
          sizes="200px"
          alt={name}
          width={200}
          height={200}
        />
      </a>
      <div class="c_LineItem__details">
        <a href={url} class="c_LineItem__name">
          <strong>{name}</strong>
          <br />
          {sku}
        </a>
        <div class="c_LineItem__quantity">
          <span>{quantity}</span>
          <form preventdefault:submit onSubmit$={() => onRemove$(sku)}>
            <input type="hidden" name="sku" value={sku} />
            <Button
              variant="secondary"
              rounded
              type="submit"
              value="remove"
              size="small"
              title={`Remove ${name} from cart`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                height="20"
                width="20"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#000"
                  d="m40 5.172-16 16-16-16L5.171 8l16.001 16L5.171 40 8 42.828l16-16 16 16L42.828 40l-16-16 16-16L40 5.172Z"
                />
              </svg>
            </Button>
          </form>
        </div>
        <div class="c_LineItem__price">{total} Ø</div>
      </div>
    </li>
  );
});

export default component$(() => {
  const lineItems = useSignal(useLineItems().value);
  const items = lineItems.value;

  const remove = $(async (sku: string) => {
    lineItems.value = await removeSku(sku);
    publish({ type: "checkout:cart-updated" });
  });
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const skus = items.map((item) => item.sku).join(",");

  return (
    <div data-boundary-page="checkout">
      <ExploreHeader />
      <main class="c_CartPage">
        <h2>Basket</h2>
        <ul class="c_CartPage__lineItems">
          {items.map((item) => (
            <LineItem key={item.sku} item={item} onRemove$={remove} />
          ))}
        </ul>
        <hr />
        <p class="c_CartPage__total">Total: {total} Ø</p>

        <div class="c_CartPage__buttons">
          <Button href="/checkout/checkout" variant="primary">
            Checkout
          </Button>
          <Button href="/" variant="secondary">
            Continue Shopping
          </Button>
        </div>

        <web-fragment
          key={`recommendations-${skus}`}
          fragment-id={`explore-recommendations-${skus || "none"}`}
          src={`/_fragment/explore/recommendations?skus=${skus}`}
        />
      </main>
      <ExploreFooter />
    </div>
  );
});
