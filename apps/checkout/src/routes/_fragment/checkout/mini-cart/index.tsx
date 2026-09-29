import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { subscribe } from "@tractor/events";
import { Button } from "@tractor/ui";

/**
 * Spike widget. Counts "checkout:cart-updated" events received over the
 * BroadcastChannel, and has its own click counter.
 */
export default component$(() => {
  const received = useSignal(0);
  const clicks = useSignal(0);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      cleanup(subscribe("checkout:cart-updated", () => received.value++));
    },
    { strategy: "document-ready" },
  );

  return (
    <div data-boundary="checkout" class="spike-mini-cart">
      <span id="mini-cart-received">events: {received.value}</span>{" "}
      <Button
        id="mini-cart-counter"
        size="small"
        onClick$={() => clicks.value++}
      >
        mini cart clicks: {clicks.value}
      </Button>
    </div>
  );
});
