import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { CategoryPage, categoryPageData } from "../category-page";

export const useCategory = routeLoader$(({ params, error }) => {
  const page = categoryPageData(params.category);
  if (!page) throw error(404, "Category not found");
  return page;
});

export default component$(() => {
  const page = useCategory();
  return <CategoryPage page={page.value} />;
});
