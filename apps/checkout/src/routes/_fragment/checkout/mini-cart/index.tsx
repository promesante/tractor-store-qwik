import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { subscribe } from "@tractor/events";
import { Button } from "@tractor/ui";
import { cartQuantity, readCart } from "~/lib/cart";

/**
 * Mini cart widget, embedded in Team Explore's header.
 *
 * It listens for "checkout:cart-updated", sent by the add to cart widget, then
 * reads the new quantity from the server and briefly highlights itself.
 */
export const useQuantity = routeLoader$(({ cookie }) =>
  cartQuantity(readCart(cookie)),
);

const fetchQuantity = server$(function () {
  return cartQuantity(readCart(this.cookie));
});

export default component$(() => {
  const quantity = useSignal(useQuantity().value);
  const highlight = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      cleanup(
        subscribe("checkout:cart-updated", async () => {
          quantity.value = await fetchQuantity();
          highlight.value = true;
          setTimeout(() => (highlight.value = false), 600);
        }),
      );
    },
    { strategy: "document-ready" },
  );

  return (
    <div
      class={["c_MiniCart", highlight.value && "c_MiniCart--highlight"]}
      data-boundary="checkout"
    >
      <Button
        variant="secondary"
        rounded
        href="/checkout/cart"
        class="c_MiniCart__button"
        title="View Cart"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="33"
          height="33"
          viewBox="0 0 33 33"
          fill="none"
        >
          <g clip-path="url(#a)">
            <path
              fill="#000"
              d="M2.75 27.5c0 1.5125 1.2375 2.75 2.75 2.75h22c1.5125 0 2.75-1.2375 2.75-2.75V9.625h-6.3188c-.649-3.5145-3.7311-6.1875-7.4312-6.1875-3.7001 0-6.78219 2.673-7.43119 6.1875H2.75V27.5ZM16.5 4.8125c2.9391 0 5.4003 2.06113 6.028 4.8125H10.472c.6277-2.75137 3.0889-4.8125 6.028-4.8125ZM8.9375 11v4.125h1.375V11h12.375v4.125h1.375V11h4.8125v16.5c0 .7583-.6167 1.375-1.375 1.375h-22c-.75831 0-1.375-.6167-1.375-1.375V11h4.8125Z"
            />
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#fff" d="M0 0h33v33H0z" />
            </clipPath>
          </defs>
        </svg>
        <div class="c_MiniCart__quantity">{quantity.value || ""}</div>
      </Button>
    </div>
  );
});
