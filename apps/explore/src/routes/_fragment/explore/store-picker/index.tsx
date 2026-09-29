import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { StorePicker } from "~/components/store-picker";
import { data } from "~/data";

/** Store picker widget, for Team Checkout's checkout page. */
export const useStores = routeLoader$(() => data.stores);

export default component$(() => {
  const stores = useStores();
  return <StorePicker stores={stores.value} />;
});
