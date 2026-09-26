import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

/** Spike page, to check navigation between two teams' pages. */
export default component$(() => {
  return (
    <main data-boundary-page="checkout">
      <h1>Checkout cart (spike)</h1>
      <a href="/">Back to explore home</a>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Tractor Store: cart (spike)",
};
