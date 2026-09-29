import { component$ } from "@builder.io/qwik";

export interface FilterOption {
  url: string;
  name: string;
  active: boolean;
}

export const Filter = component$<{ filters: FilterOption[] }>(({ filters }) => {
  return (
    <div class="e_Filter">
      Filter:
      <ul>
        {filters.map((f) =>
          f.active ? (
            <li key={f.url} class="e_Filter__filter--active">
              {f.name}
            </li>
          ) : (
            <li key={f.url}>
              <a href={f.url}>{f.name}</a>
            </li>
          ),
        )}
      </ul>
    </div>
  );
});
