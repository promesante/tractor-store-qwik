import { component$ } from "@builder.io/qwik";
import type { Product as ProductData } from "~/data";
import { fmtprice, src, srcset } from "~/lib/format";

export const Product = component$<{ product: ProductData }>(({ product }) => {
  const { name, url, image, startPrice } = product;
  return (
    <li class="e_Product">
      <a class="e_Product_link" href={url}>
        <img
          class="e_Product_image"
          src={src(image, 200)}
          srcset={srcset(image, [200, 400, 800])}
          sizes="300px"
          width={200}
          height={200}
          alt=""
        />
        <span class="e_Product_name">{name}</span>
        <span class="e_Product_price">{fmtprice(startPrice)}</span>
      </a>
    </li>
  );
});
