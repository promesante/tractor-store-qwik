import { component$ } from "@builder.io/qwik";
import type { RecoItem } from "~/data";
import { src, srcset } from "~/lib/format";

const Recommendation = component$<{ item: RecoItem }>(({ item }) => {
  const { image, url, name } = item;
  return (
    <li class="i_Recommendation">
      <a class="i_Recommendation_link" href={url}>
        <img
          class="i_Recommendation_image"
          src={src(image, 200)}
          srcset={srcset(image, [200, 400])}
          alt=""
          sizes="200px"
          width={200}
          height={200}
        />
        <span class="i_Recommendation_name">{name}</span>
      </a>
    </li>
  );
});

/** Renders nothing when there are no recommendations. */
export const Recommendations = component$<{ recos: RecoItem[] }>(
  ({ recos }) => {
    if (recos.length === 0) return null;
    return (
      <div class="i_Recommendations" data-boundary="inspire">
        <h2>Recommendations</h2>
        <ul class="i_Recommendations_list">
          {recos.map((item) => (
            <Recommendation key={item.sku} item={item} />
          ))}
        </ul>
      </div>
    );
  },
);
