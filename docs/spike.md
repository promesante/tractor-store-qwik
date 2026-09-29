# Spike: Qwik inside Web Fragments

Task T2 in [PLAN.md](../PLAN.md). Verified locally on 2026-09-25 with Qwik 1.20.1,
Qwik City 1.20.1, web-fragments 0.8.2, wrangler 4.141 and headless Chromium.

> The spike's pages and widgets were all replaced by the real store: Explore's page in T6, the
> Checkout mini cart in T8 and the cart page in T10.

## Result

Both risks from [spec.md, section 11](../spec.md#11-risks) are resolved. Qwik resumes inside
Web Fragments, and a widget from another team can be nested inside a page fragment.

| Check                                                                     | Result             |
| ------------------------------------------------------------------------- | ------------------ |
| Gateway pierces the Explore page into the shell on a document request     | Works              |
| Qwik click handler resumes in the Explore page fragment                   | Works, after fix 1 |
| Checkout widget nested in the Explore page with `<web-fragment src>`      | Works              |
| Qwik click handler resumes in the nested Checkout widget                  | Works, after fix 1 |
| `BroadcastChannel` event from Explore reaches the Checkout widget         | Works              |
| Link from an Explore page to a Checkout page, and back                    | Works              |
| Client chunks load from the owning team's `/_fragment/<team>/build/` path | Works, after fix 2 |
| Qwik preloader fetches its bundle graph from the team's path              | Works, after fix 3 |

## Fixes that were needed

1. **Qwik must render into a `<div>` container, not `<html>`.** When the container is the
   document element, Qwik looks for its `qwik/json` state script at the end of `<body>`. The
   gateway renames a fragment's `<html>` and `<body>` to `<wf-html>` and `<wf-body>`, so Qwik
   searched the wrong element, and every handler failed with "Cannot read properties of
   undefined". With `containerTagName: "div"` in `entry.ssr.tsx`, Qwik places the state script
   inside the container. The team root no longer renders `<head>` or `<body>`. The shell owns
   the document.
2. **Client output goes to `dist/_fragment/<team>/`.** Setting Vite's `base` would also prefix
   every Qwik City route, and renaming chunks with Rollup options made Qwik double the prefix.
   Setting Qwik's client `outDir` to `dist/_fragment/<team>` keeps routes at their natural paths
   and serves chunks from the team prefix. `entry.ssr.tsx` sets Qwik's `base` to match.
3. **The server build overrides `import.meta.env.BASE_URL`.** Qwik's renderer builds the
   bundle-graph URL from the base URL. The Worker's server build config defines it as
   `/_fragment/<team>/` for the server build only.
4. **Qwik City trailing slashes are off.** Otherwise `/checkout/cart` answers with a redirect to
   `/checkout/cart/`, which the gateway reports as a failed fragment fetch.
5. **Our own Worker entry replaces Qwik's Cloudflare Pages adapter.** Qwik City 1.x only ships a
   Pages adapter. It worked as a build tool, but it also wrote Pages-only files such as
   `_routes.json` and `404.html`, which had to be hidden from Workers static assets. Each team
   app now has `src/entry.worker.ts`, about 80 lines, which connects Qwik City's
   platform-neutral request handler to a Workers `fetch` handler. `vite.worker.config.ts`
   builds it to `server/entry.worker.js`. Behavior in the browser check did not change.

## Other findings

- **One wrangler process per app.** Running several configs in one `wrangler dev` process
  served no static assets for the secondary Workers. Separate processes, connected by
  wrangler's local dev registry, work. `pnpm start` builds everything and starts one process
  per app through Turborepo. Service bindings are used locally too, so the shell has no
  separate "localhost URL" mode.
- **Each app needs its own inspector port** when several wrangler processes run together.
- **One gateway entry per team.** The gateway matches by path first, so one fragment config per
  team covers its pages, widgets and assets. A widget element's `fragment-id` only needs to be
  unique on the page, for example `checkout-mini-cart`.
- **Harmless console warning.** Web Fragments logs "Can't execute script without src or
  textContent!" once per fragment. The script is Qwik City's empty event-anchor `<script>`. It
  has no code, and nothing breaks.
- **Vite 7 needs Node 22.12 or newer.** The root `engines` field requires it.

## How it was verified

With the store running through `pnpm start`, a Playwright script opened http://localhost:3000/
and checked every row of the result table: it clicked both counters, published the event,
followed the cross-team links, and recorded console errors and failed requests. End-to-end
tests that run in CI are planned as task T11.
