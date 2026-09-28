import { component$, useSignal, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { publish } from "@tractor/events";

/**
 * Spike page. It checks three things:
 * 1. Qwik click handlers resume inside a Web Fragment.
 * 2. Another team's widget can be nested as a <web-fragment src>.
 * 3. A BroadcastChannel event reaches that nested widget.
 */
export default component$(() => {
  const clicks = useSignal(0);

  const sendEvent = $(() => {
    publish({ type: "checkout:cart-updated" });
  });

  return (
    <main data-boundary-page="explore">
      <header data-boundary="explore" class="spike-header">
        <strong>Explore header</strong>
        <web-fragment
          fragment-id="checkout-mini-cart"
          src="/_fragment/checkout/mini-cart"
        />
      </header>

      <h1>Explore home (spike)</h1>

      <p>
        <button id="explore-counter" onClick$={() => clicks.value++}>
          Explore clicks: <span>{clicks.value}</span>
        </button>
      </p>

      <p>
        <button id="explore-publish" onClick$={sendEvent}>
          Publish checkout:cart-updated
        </button>
      </p>

      <p>
        <a href="/checkout/cart">Go to checkout cart page</a>
      </p>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Tractor Store: spike",
};
