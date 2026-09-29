import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { Recommendations } from "~/components/recommendations";
import { recosForSkus } from "~/lib/recommendations";

/**
 * Recommendations widget. Input: ?skus=SKU1,SKU2 from the embedding page,
 * for example the selected variant on the product page or the cart contents.
 */
export const useRecos = routeLoader$(({ url }) => {
  const skus = (url.searchParams.get("skus") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return recosForSkus(skus);
});

export default component$(() => {
  const recos = useRecos();
  return <Recommendations recos={recos.value} />;
});
