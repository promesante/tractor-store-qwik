/**
 * Event contract shared by all teams.
 *
 * Web Fragments runs every fragment in its own JavaScript realm, so DOM events on
 * `window` do not cross fragments. A same-origin BroadcastChannel does.
 */
export const CHANNEL_NAME = "tractor-store";

export type TractorEvent =
  /** Checkout changed the cart. Listeners refetch what they show. */
  | { type: "checkout:cart-updated" }
  /** Explore's store picker selected a store. */
  | { type: "explore:store-selected"; storeId: string };

export type TractorEventType = TractorEvent["type"];

/** Sends an event to every other fragment on the page. */
export function publish(event: TractorEvent): void {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage(event);
  channel.close();
}

/**
 * Listens for one event type. Returns a function that stops listening.
 *
 * A BroadcastChannel does not deliver messages to the instance that sent them,
 * so a fragment does not receive its own events.
 */
export function subscribe<T extends TractorEventType>(
  type: T,
  handler: (event: Extract<TractorEvent, { type: T }>) => void,
): () => void {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (message: MessageEvent<TractorEvent>) => {
    if (message.data?.type === type) {
      handler(message.data as Extract<TractorEvent, { type: T }>);
    }
  };
  return () => channel.close();
}
