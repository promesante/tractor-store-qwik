import { component$ } from "@builder.io/qwik";
import { Navigation } from "./navigation";

/**
 * Team Explore's header. It embeds Team Checkout's mini cart as a nested
 * Web Fragment, so the cart stays owned by Checkout.
 */
export const Header = component$(() => {
  return (
    <header class="e_Header" data-boundary="explore">
      <div class="e_Header__cutter">
        <div class="e_Header__inner">
          <a class="e_Header__link" href="/">
            <img
              class="e_Header__logo"
              src="/cdn/img/logo.svg"
              alt="Micro Frontends - Tractor Store"
              width={270}
              height={77}
            />
          </a>
          <div class="e_Header__navigation">
            <Navigation />
          </div>
          <div class="e_Header__cart">
            <web-fragment
              fragment-id="checkout-mini-cart"
              src="/_fragment/checkout/mini-cart"
            />
          </div>
        </div>
      </div>
    </header>
  );
});
