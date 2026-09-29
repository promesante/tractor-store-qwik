import { $, component$, useSignal } from "@builder.io/qwik";
import { publish } from "@tractor/events";
import { Button } from "@tractor/ui";
import type { Store } from "~/data";
import { src, srcset } from "~/lib/format";

const StoreContent = component$<{ store: Store }>(({ store }) => (
  <div class="e_StorePicker_content">
    <img
      class="e_StorePicker_image"
      src={src(store.image, 200)}
      srcset={srcset(store.image, [200, 400])}
      width={200}
      height={200}
      alt=""
    />
    <p class="e_StorePicker_address">
      {store.name}
      <br />
      {store.street}
      <br />
      {store.city}
    </p>
  </div>
));

/**
 * Store picker, embedded in Team Checkout's checkout page.
 *
 * Selecting a store sends "explore:store-selected" with the store ID, which is
 * how the child tells its parent page. See packages/events.
 */
export const StorePicker = component$<{ stores: Store[] }>(({ stores }) => {
  const dialog = useSignal<HTMLDialogElement>();
  const selectedId = useSignal<string>();

  const select = $((storeId: string) => {
    selectedId.value = storeId;
    dialog.value?.close();
    publish({ type: "explore:store-selected", storeId });
  });

  const selected = stores.find((s) => s.id === selectedId.value);

  return (
    <div class="e_StorePicker">
      <div class="e_StorePicker_control" data-boundary="explore">
        <div class="e_StorePicker_selected">
          {selected && <StoreContent store={selected} />}
        </div>
        <Button
          class="e_StorePicker_choose"
          type="button"
          onClick$={() => dialog.value?.showModal()}
        >
          choose a store
        </Button>
      </div>
      <dialog ref={dialog} class="e_StorePicker_dialog" data-boundary="explore">
        <div class="e_StorePicker_wrapper">
          <h2>Stores</h2>
          <ul class="e_StorePicker_list">
            {stores.map((store) => (
              <li key={store.id} class="e_StorePicker_entry">
                <StoreContent store={store} />
                <Button
                  class="e_StorePicker_select"
                  type="button"
                  dataId={store.id}
                  onClick$={() => select(store.id)}
                >
                  select
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </div>
  );
});
