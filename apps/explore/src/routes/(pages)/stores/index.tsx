import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { data } from "~/data";
import { Store } from "~/components/store";

export const useStores = routeLoader$(() => data.stores);

export default component$(() => {
  const stores = useStores();
  return (
    <main class="e_StoresPage">
      <h2>Our Stores</h2>
      <p>
        Want to see our products in person? Visit one of our stores to see our
        products up close and talk to our experts. We have stores in the
        following locations:
      </p>
      <ul class="e_StoresPage_list">
        {stores.value.map((store) => (
          <Store key={store.id} store={store} />
        ))}
      </ul>
    </main>
  );
});
