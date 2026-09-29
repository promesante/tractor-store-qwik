import { WebFragment, WebFragmentHost } from "web-fragments";
import { supportNestedBoundaries } from "./boundaries";

/**
 * Registers the Web Fragments elements.
 *
 * Same as the library's initializeWebFragments(), plus one style rule. Inside
 * each <web-fragment>, the library's <web-fragment-host> keeps the default
 * inline display. Wrapping a block, an inline element adds an empty line box
 * below it, which makes every nested widget taller than its content. The
 * gateway fixes this only for the page fragment, with a style in the document
 * head, which does not reach into shadow roots.
 */
const hostStyles = new CSSStyleSheet();
hostStyles.replaceSync("web-fragment-host { display: block; }");

class TractorWebFragment extends WebFragment {
  override connectedCallback(): Promise<void> {
    // The library attaches the shadow root synchronously, before its first await.
    const done = super.connectedCallback();
    const shadowRoot = this.shadowRoot;
    if (shadowRoot && !shadowRoot.adoptedStyleSheets.includes(hostStyles)) {
      shadowRoot.adoptedStyleSheets.push(hostStyles);
    }
    return done;
  }
}

customElements.define("web-fragment", TractorWebFragment);
customElements.define("web-fragment-host", WebFragmentHost);
supportNestedBoundaries();
