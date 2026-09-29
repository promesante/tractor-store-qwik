import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { data } from "~/data";
import { src, srcset } from "~/lib/format";
import { recosForSkus } from "~/lib/recommendations";
import { Recommendations } from "~/components/recommendations";

export const useTeasers = routeLoader$(() => data.teaser);

/** The blueprint's home page recommendations. */
export const useHomeRecos = routeLoader$(() =>
  recosForSkus(["CL-01-GY", "AU-07-MT"]),
);

export default component$(() => {
  const teasers = useTeasers();
  const recos = useHomeRecos();
  return (
    <main class="e_HomePage">
      {teasers.value.map(({ title, image, url }) => (
        <a key={url} class="e_HomePage__categoryLink" href={url}>
          <img
            src={src(image, 500)}
            srcset={srcset(image, [500, 1000])}
            sizes="100vw, (min-width: 500px) 50vw"
            width={1000}
            height={560}
            alt=""
          />
          {title}
        </a>
      ))}
      <div class="e_HomePage__recommendations">
        <Recommendations recos={recos.value} />
      </div>
    </main>
  );
});
