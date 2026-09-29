import { component$, useStyles$ } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import globalStyles from "./styles/global.css?inline";

/**
 * Fragment root. There is no <html>, <head> or <body>, because the shell owns
 * the document. See entry.ssr.tsx.
 *
 * useStyles$ renders the team's styles inside the fragment, which is the only
 * place they apply: the fragment lives in its own shadow root.
 */
export default component$(() => {
  useStyles$(globalStyles);
  return (
    <QwikCityProvider>
      <RouterOutlet />
    </QwikCityProvider>
  );
});
