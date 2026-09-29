// Lets Qwik JSX render the Web Fragments custom element.
import type { QwikIntrinsicElements } from "@builder.io/qwik";

declare module "@builder.io/qwik" {
  namespace QwikJSX {
    interface IntrinsicElements {
      "web-fragment": QwikIntrinsicElements["div"] & {
        "fragment-id": string;
        src?: string;
      };
    }
  }
}
