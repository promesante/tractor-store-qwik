import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { findProduct } from "~/data";
import { src, srcset } from "~/lib/format";
import { VariantOption } from "~/components/variant-option";

/**
 * Team Decide's product page, /product/:id?sku=SKU.
 *
 * It embeds four widgets from other teams as Web Fragments: Explore's header
 * and footer, Inspire's recommendations, and Checkout's add to cart. Changing the
 * variant is a client-side navigation: the page re-renders, and the widgets
 * that depend on the SKU are re-created with the new one, because a
 * <web-fragment> does not react to a changed src.
 */
export const useProduct = routeLoader$(({ params, url, error }) => {
  const product = findProduct(params.id);
  if (!product) throw error(404, "Product not found");
  const sku = url.searchParams.get("sku");
  const variant =
    product.variants.find((v) => v.sku === sku) ?? product.variants[0];
  return { product, variant };
});

export default component$(() => {
  const data = useProduct();
  const { product, variant } = data.value;
  const { name, variants, highlights = [] } = product;

  return (
    <div data-boundary-page="decide">
      <web-fragment
        class="d_Widget d_Widget--header"
        fragment-id="explore-header"
        src="/_fragment/explore/header"
      />
      <main class="d_ProductPage">
        <div class="d_ProductPage__details">
          <img
            class="d_ProductPage__productImage"
            src={src(variant.image, 400)}
            srcset={srcset(variant.image, [400, 800])}
            sizes="400px"
            width={400}
            height={400}
            alt={`${name} - ${variant.name}`}
          />
          <div class="d_ProductPage__productInformation">
            <h2 class="d_ProductPage__title">{name}</h2>
            <ul class="d_ProductPage__highlights">
              {highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <ul class="d_ProductPage__variants">
              {variants.map((v) => (
                <VariantOption
                  key={v.sku}
                  variant={v}
                  selected={v.sku === variant.sku}
                />
              ))}
            </ul>
            <web-fragment
              key={`add-to-cart-${variant.sku}`}
              class="d_Widget d_Widget--addToCart"
              fragment-id={`checkout-add-to-cart-${variant.sku}`}
              src={`/_fragment/checkout/add-to-cart?sku=${variant.sku}`}
            />
          </div>
        </div>
        <web-fragment
          key={`recommendations-${variant.sku}`}
          fragment-id={`inspire-recommendations-${variant.sku}`}
          src={`/_fragment/inspire/recommendations?skus=${variant.sku}`}
        />
      </main>
      <web-fragment
        fragment-id="explore-footer"
        src="/_fragment/explore/footer"
      />
    </div>
  );
});
