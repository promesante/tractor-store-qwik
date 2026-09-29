/**
 * The application shell. It hosts the page fragment that matches the URL; the
 * gateway pierces the fragment's server-rendered HTML into <web-fragment>.
 *
 * The shell owns the document: meta tags, favicons, the Raleway font and the
 * few base styles that inherit into fragments. Everything else is styled by
 * the teams inside their own shadow roots.
 */
const BASE_STYLES = `
@font-face {
  font-family: "Raleway";
  src: url("/cdn/font/raleway-regular.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
* {
  box-sizing: border-box;
}
html {
  font-family: Raleway, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 16px;
}
body {
  padding: 0;
  margin: 0;
  min-height: 100vh;
  overflow-x: hidden;
}
p {
  line-height: 1.5;
}
:root {
  --outer-space: 1.5rem;
}`;

export function shellHtml(fragmentId: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tractor Store</title>
    <meta name="description" content="a non-trivial micro frontends example project" />
    <link rel="preload" href="/cdn/font/raleway-regular.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="apple-touch-icon" sizes="180x180" href="/cdn/img/meta/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/cdn/img/meta/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/cdn/img/meta/favicon-16x16.png" />
    <link rel="manifest" href="/cdn/img/meta/site.webmanifest" />
    <link rel="mask-icon" href="/cdn/img/meta/safari-pinned-tab.svg" color="#ff5a55" />
    <link rel="shortcut icon" href="/cdn/img/meta/favicon.ico" />
    <meta name="msapplication-TileColor" content="#ffffff" />
    <meta name="msapplication-config" content="/cdn/img/meta/browserconfig.xml" />
    <meta name="theme-color" content="#ffffff" />
    <style>${BASE_STYLES}</style>
    <!-- The boundary toggle helper runs first, then the shell script. -->
    <script type="module" src="/cdn/js/helper.js"></script>
    <script type="module" src="/shell/client.js"></script>
  </head>
  <body>
    <web-fragment fragment-id="${fragmentId}"></web-fragment>
  </body>
</html>`;
}
