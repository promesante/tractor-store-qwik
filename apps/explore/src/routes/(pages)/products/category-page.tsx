import { component$ } from "@builder.io/qwik";
import { data, type Product as ProductData } from "~/data";
import { Filter, type FilterOption } from "~/components/filter";
import { Product } from "~/components/product";

export interface CategoryPageData {
  title: string;
  products: ProductData[];
  filters: FilterOption[];
}

/**
 * Builds the category page data. With no category key, it lists all
 * machines. Returns null for an unknown category.
 */
export function categoryPageData(key?: string): CategoryPageData | null {
  const category = key ? data.categories.find((c) => c.key === key) : undefined;
  if (key && !category) return null;

  const products = (
    category ? category.products : data.categories.flatMap((c) => c.products)
  )
    .slice()
    .sort((a, b) => b.startPrice - a.startPrice);

  return {
    title: category ? category.name : "All Machines",
    products,
    filters: [
      { url: "/products", name: "All", active: !category },
      ...data.categories.map((c) => ({
        url: `/products/${c.key}`,
        name: c.name,
        active: c.key === key,
      })),
    ],
  };
}

export const CategoryPage = component$<{ page: CategoryPageData }>(
  ({ page }) => {
    return (
      <main class="e_CategoryPage">
        <h2>{page.title}</h2>
        <div class="e_CategoryPage__subline">
          <p>{page.products.length} products</p>
          <Filter filters={page.filters} />
        </div>
        <ul class="e_CategoryPage_list">
          {page.products.map((product) => (
            <Product key={product.id} product={product} />
          ))}
        </ul>
      </main>
    );
  },
);
