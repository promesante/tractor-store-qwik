import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import type { Variant } from "~/data";

export const VariantOption = component$<{
  variant: Variant;
  selected: boolean;
}>(({ variant: { sku, name, color }, selected }) => {
  return (
    <li class="d_VariantOption" style={{ "--variant-color": color }}>
      <i class="d_VariantOption__color"></i>
      {selected ? (
        <strong>{name}</strong>
      ) : (
        <Link href={`?sku=${sku}`}>{name}</Link>
      )}
    </li>
  );
});
