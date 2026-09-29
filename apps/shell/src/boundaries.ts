/**
 * Makes the Tractor Store boundary toggle work inside Web Fragments.
 *
 * The blueprint's helper.js adds a <style id="boundaries"> to the document and
 * copies it into shadow roots it can find, but only one level deep. Web
 * Fragments nests shadow roots: <web-fragment>, then <web-fragment-host>, then
 * any widget fragment inside a page. This copies the style into every shadow
 * root, at any depth, including ones created later.
 *
 * The on/off switch is the --boundary-display custom property on <html>,
 * which inherits into shadow roots, so toggling needs no extra work.
 */
const STYLE_ID = "boundaries";
const observed = new WeakSet<ShadowRoot>();

function syncShadowRoots(root: Document | ShadowRoot): void {
  const style = document.getElementById(STYLE_ID);
  if (!style) return;

  for (const element of root.querySelectorAll("*")) {
    const shadowRoot = element.shadowRoot;
    if (!shadowRoot) continue;

    if (!shadowRoot.getElementById(STYLE_ID)) {
      shadowRoot.appendChild(style.cloneNode(true));
    }
    if (!observed.has(shadowRoot)) {
      observed.add(shadowRoot);
      new MutationObserver(() => syncShadowRoots(shadowRoot)).observe(
        shadowRoot,
        {
          childList: true,
          subtree: true,
        },
      );
    }
    syncShadowRoots(shadowRoot);
  }
}

export function supportNestedBoundaries(): void {
  syncShadowRoots(document);
  new MutationObserver(() => syncShadowRoots(document)).observe(
    document.documentElement,
    {
      childList: true,
      subtree: true,
    },
  );
}
