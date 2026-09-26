import { component$ } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";

/**
 * Fragment root. There is no <html>, <head> or <body>, because the shell owns
 * the document. See entry.ssr.tsx.
 */
export default component$(() => {
  return (
    <QwikCityProvider>
      <RouterOutlet />
    </QwikCityProvider>
  );
});
