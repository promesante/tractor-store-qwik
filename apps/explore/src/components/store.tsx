import { component$ } from "@builder.io/qwik";
import type { Store as StoreData } from "~/data";
import { src, srcset } from "~/lib/format";

export const Store = component$<{ store: StoreData }>(({ store }) => {
  const { name, image, street, city } = store;
  return (
    <li class="e_Store">
      <div class="e_Store_content">
        <img
          class="e_Store_image"
          src={src(image, 200)}
          srcset={srcset(image, [200, 400])}
          width={200}
          height={200}
          alt=""
        />
        <p class="e_Store_address">
          {name}
          <br />
          {street}
          <br />
          {city}
        </p>
      </div>
    </li>
  );
});
