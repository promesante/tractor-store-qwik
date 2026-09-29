import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { CategoryPage, categoryPageData } from "./category-page";

export const useAllMachines = routeLoader$(() => categoryPageData()!);

export default component$(() => {
  const page = useAllMachines();
  return <CategoryPage page={page.value} />;
});
