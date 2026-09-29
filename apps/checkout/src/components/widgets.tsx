import { component$ } from "@builder.io/qwik";

/** Team Explore's header, embedded as a Web Fragment. */
export const ExploreHeader = component$(() => (
  <web-fragment
    class="c_Widget c_Widget--header"
    fragment-id="explore-header"
    src="/_fragment/explore/header"
  />
));

/**
 * Team Explore's footer, embedded as a Web Fragment. It needs no reserved
 * space, and its top margin should merge with the content above it, as in
 * the blueprint.
 */
export const ExploreFooter = component$(() => (
  <web-fragment fragment-id="explore-footer" src="/_fragment/explore/footer" />
));
