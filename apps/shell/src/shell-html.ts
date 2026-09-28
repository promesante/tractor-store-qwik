/**
 * The application shell. It only hosts the page fragment that matches the URL.
 * The gateway pierces the fragment's server-rendered HTML into <web-fragment>.
 */
export function shellHtml(fragmentId: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tractor Store</title>
    <script type="module" src="/shell/client.js"></script>
  </head>
  <body>
    <web-fragment fragment-id="${fragmentId}"></web-fragment>
  </body>
</html>`;
}
