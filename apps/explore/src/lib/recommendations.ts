/**
 * The blueprint's color-based recommendation algorithm: recommend the variants
 * whose color is closest to the average color of the given SKUs.
 */
import { data, type RecoItem } from "~/data";

type Rgb = number[];

const items = data.recommendations;

function averageColor(colors: Rgb[]): Rgb {
  const total = colors.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0],
  );
  return total.map((c) => Math.round(c / colors.length));
}

function colorDistance([r1, g1, b1]: Rgb, [r2, g2, b2]: Rgb): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/** Up to `length` recommendations for the SKUs, excluding the SKUs themselves. */
export function recosForSkus(skus: string[], length = 4): RecoItem[] {
  const colors = skus.filter((sku) => items[sku]).map((sku) => items[sku].rgb);

  // With no known SKUs, for example an empty cart, the blueprint averages zero
  // colors into NaN, every distance becomes NaN, and the sort keeps the data's
  // order. So it shows the first items. This does the same, explicitly.
  if (colors.length === 0) {
    return Object.values(items)
      .filter((item) => !skus.includes(item.sku))
      .slice(0, length);
  }

  const target = averageColor(colors);

  return Object.keys(items)
    .filter((sku) => !skus.includes(sku))
    .map((sku) => ({ sku, distance: colorDistance(target, items[sku].rgb) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, length)
    .map(({ sku }) => items[sku]);
}
