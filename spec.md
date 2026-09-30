# The Tractor Store: Qwik + Web Fragments

A micro frontends implementation of [The Tractor Store 2.0](https://micro-frontends.org/tractor-store/),
built with [Web Fragments](https://web-fragments.dev/), [Qwik](https://qwik.dev/) and a
[Turborepo](https://turbo.build/) monorepo, deployed to Cloudflare Workers by GitHub Actions.

The task plan lives in [PLAN.md](./PLAN.md).

The finished store will be submitted to the Implementations list of
[The Tractor Store 2.0](https://micro-frontends.org/tractor-store/). Section 12 lists what that
requires. The site's text is kept in [new-requirements.md](./new-requirements.md).

## 1. Original brief

> I want to start a project here cloning logic and micro frontend architecture, proposed in
> "Tractor Store v2" initiative, https://micro-frontends.org/tractor-store/, implemented here, in the
> "tractor-store-qwik" dir, with:
>
> - web fragments micro frontend framework, https://web-fragments.dev/
> - qwik js, https://qwik.dev/
> - turbo mono repo
> - to be deployed into Cloudflare
>
> we can take as reference the following two implementation, available here in the following
> sibling directories:
>
> - "13-spa-tractor-v2-full": micro frontend implemented with Picard, https://picard.js.org/
> - "tractor-store-blueprint": this initiative's "blueprint"; it's not as micro frontend but a monolith
>
> new requirements:
>
> - when we tackle plan and tasks, we'll have to decide task granularity to trigger push upto
>   Github, and open each corresponding PR there
> - deploy upto Cloudflare should managed by Github Actions

## 2. Goals

- Reproduce every page, fragment and feature of the
  [blueprint](../tractor-store-blueprint/README.md), so the end user sees the same store.
- Keep the three systems, Explore, Decide and Checkout, independently developed and deployed.
- Use Web Fragments as the only integration technique between systems.
- Run the whole store locally with one command.
- Bonus: a shared pattern library with the Button, and a fourth "Inspire" system that owns
  recommendations.
- Get listed as an implementation on the Tractor Store 2.0 site, with a live demo.

### 2.1 Features every implementation must have

From the Tractor Store site. An end user must not be able to tell implementations apart.

| Feature                                                                          | Owner             | Task      |
| -------------------------------------------------------------------------------- | ----------------- | --------- |
| Boundary toggle, to show which team owns what                                    | Shell             | T4        |
| Complete shop: home, category, stores, product detail, cart, checkout, thank-you | All teams         | T6 to T10 |
| Header and footer, the same on every page except checkout                        | Explore           | T6        |
| Recommendations matched by color, from the selected product and cart contents    | Explore           | T7        |
| Shopping cart: add and remove tractors, mini cart updates                        | Checkout          | T8, T10   |
| Checkout form with an embedded store picker owned by Explore                     | Checkout, Explore | T7, T10   |
| Confirmation confetti, powered by an external dependency                         | Checkout          | T10       |

### 2.2 Principles every implementation must follow

- **Team boundaries.** Explore owns home, product lists, stores and recommendations. Decide owns
  the product page. Checkout owns cart, checkout and thanks.
- **Framework-agnostic integration.** Teams must be able to change their tech stack
  independently. Web Fragments isolates each team's JavaScript, so this holds at runtime. Shared
  packages must not force a framework on a team: `packages/events` is plain TypeScript, and a
  team leaving Qwik would stop using the Qwik Button in `packages/ui` and keep only its CSS.
- **Independent deployment.** Each team deploys its own Worker, without touching other teams'
  code.

## 3. Reference implementations

| Reference                         | What we reuse                                                                                                                          | What we do differently                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tractor-store-blueprint`         | Page and fragment boundaries, markup, CSS, per-team `database.json`, cookie cart format, custom event names, Cloudflare Worker hosting | Real micro frontends instead of a modular monolith                                             |
| `13-spa-tractor-v2-full` (Picard) | One deployable per team, component split per team                                                                                      | Server rendering instead of a client-only SPA; cart persisted in a cookie instead of in memory |

## 4. Decisions

| Aspect                   | Decision                                                                      |
| ------------------------ | ----------------------------------------------------------------------------- |
| Frameworks               | Qwik 1.x stable with Qwik City. Qwik 2 is still in beta.                      |
| Micro frontend framework | `web-fragments` 0.8.x                                                         |
| Rendering                | Server-side rendering, resumed in the browser by Qwik                         |
| Application shell        | Thin shell Worker running the Web Fragments gateway                           |
| Server-side integration  | Gateway "piercing" of the page fragment that matches the URL                  |
| Client-side integration  | `<web-fragment src="...">` elements for embedded widgets                      |
| Communication            | `BroadcastChannel` events, plus HTML attributes from parent to child          |
| Navigation               | Multi-page, one page fragment per URL, owned by one team                      |
| Styling                  | Plain CSS per team, copied from the blueprint, isolated by shadow DOM         |
| Design system            | Shared Qwik `Button` in `packages/ui`                                         |
| Static assets            | Images, fonts and helper script copied into the shell and served by it        |
| Monorepo                 | Turborepo with pnpm workspaces                                                |
| Deployment               | Cloudflare Workers, one Worker per system, connected by service bindings      |
| CI/CD                    | GitHub Actions: checks on every PR, deploy of changed apps on merge to `main` |
| Preview deploys          | Not in scope for now                                                          |

## 5. System boundaries

Same boundaries as the blueprint. 📄 is a page, 🧩 is a fragment embedded in another team's page.

- 🔴 **Explore**
  - 📄 Home `/`
  - 📄 Category `/products` and `/products/:category`
  - 📄 Stores `/stores`
  - 🧩 Header, on every page except checkout
  - 🧩 Footer, on every page
  - 🧩 Recommendations, on home, product detail and cart: moved to Inspire in T12
  - 🧩 Store Picker, on the checkout page
- 🟢 **Decide**
  - 📄 Product detail `/product/:id?sku=...`
- 🟡 **Checkout**
  - 📄 Cart `/checkout/cart`
  - 📄 Checkout `/checkout/checkout`
  - 📄 Thank you `/checkout/thanks`
  - 🧩 Mini Cart, inside the header
  - 🧩 Add To Cart, on product detail
- 🟣 **Inspire** (bonus, added in T12)
  - 🧩 Recommendations, on home, product detail and cart, taken over from Explore

Every fragment root keeps the blueprint's `data-boundary="<team>"` attribute, and every page
root keeps `data-boundary-page="<team>"`, so the boundary toggle helper keeps working.

## 6. Architecture

### 6.1 Deployables

```
Browser
  │
  ▼
shell Worker  (Web Fragments gateway, shell HTML, /cdn/* static assets)
  ├── service binding EXPLORE  ──▶ explore Worker   (Qwik City)
  ├── service binding DECIDE   ──▶ decide Worker    (Qwik City)
  ├── service binding CHECKOUT ──▶ checkout Worker  (Qwik City)
  └── service binding INSPIRE  ──▶ inspire Worker   (Qwik City)
```

- Only the shell Worker has a public route. Team Workers are reached only through service
  bindings, which the gateway uses as fetch-function endpoints.
- Everything is served from one origin. That keeps cookies, `BroadcastChannel` and the
  Web Fragments iframe realms working without CORS.

### 6.2 Two kinds of fragments

Web Fragments has two modes, and we use both.

1. **Page fragments are bound to the URL.** The shell contains one `<web-fragment>` without a
   `src`. On a document request, the gateway finds the team whose route patterns match the URL,
   fetches its server-rendered HTML, and pierces it into the shell. Soft navigations inside the
   fragment are fetched by the fragment's own realm.
2. **Widget fragments are unbound.** A page embeds another team's widget with
   `<web-fragment fragment-id="..." src="/_fragment/<team>/<widget>?...">`. The widget is fetched
   and rendered on the client. It does not follow the browser URL.

Pages compose their own chrome, exactly as in the blueprint. Explore pages render the header and
footer as local components. Decide and Checkout pages embed them as Explore widget fragments.
The header embeds the Checkout mini cart as a nested fragment. The shell stays unaware of page
layouts.

### 6.3 Routing

Each team registers its route patterns in the gateway.

| Team     | Page routes                                        | Widget and asset routes |
| -------- | -------------------------------------------------- | ----------------------- |
| Explore  | `/`, `/products`, `/products/:category`, `/stores` | `/_fragment/explore/*`  |
| Decide   | `/product/:id`, and anything under `/product/`     | `/_fragment/decide/*`   |
| Checkout | `/checkout/*`                                      | `/_fragment/checkout/*` |
| Inspire  | none                                               | `/_fragment/inspire/*`  |

- Widget endpoints, for example: `/_fragment/explore/header`, `/_fragment/explore/footer`,
  `/_fragment/explore/recommendations?skus=...`, `/_fragment/explore/store-picker`,
  `/_fragment/checkout/mini-cart`, `/_fragment/checkout/add-to-cart?sku=...`.
- Each Qwik app builds its client assets under its own `/_fragment/<team>/` base path, so asset
  requests route back to the owning team.
- Anything unmatched falls through to the shell's static assets, for example `/cdn/img/...`.
- Unknown paths get the shell's 404 page. So does a page a team answers with 404, such as an
  unknown category: the gateway replaces the whole response with the shell's 404 page.
- The gateway has one fragment config per team, because it matches by path first. A widget
  element's `fragment-id` only has to be unique on the page, for example `checkout-mini-cart`.

### 6.3.1 How a team app is built

These rules come from the [spike](./docs/spike.md) and apply to every Qwik team app.

- Qwik renders into a `<div>` container, and the team root renders no `<html>`, `<head>` or
  `<body>`. The shell owns the document.
- Qwik's client output goes to `dist/_fragment/<team>/`, so chunks are served from
  `/_fragment/<team>/build/` while routes keep their natural paths.
- The server build defines `import.meta.env.BASE_URL` as `/_fragment/<team>/`, so Qwik's
  preloader fetches its bundle graph from the team's path.
- Qwik City trailing slashes are turned off.
- A team's route patterns must also cover Qwik City's data requests for client-side navigation,
  such as `/product/CL-01/q-data.json`. Decide's pattern is therefore `/product/:_*`.
- Each app deploys as a Cloudflare Worker with static assets. Its entry is our own
  `src/entry.worker.ts`, which calls Qwik City's request handler. Qwik's Cloudflare Pages
  adapter is not used, since Cloudflare directs new projects to Workers.

### 6.3.2 Embedding a widget

- Each widget element gets a `fragment-id` that is unique on the page. When a widget depends on
  page state, such as the selected SKU, the SKU is part of its `fragment-id` and Qwik `key`, so
  the element is re-created when the SKU changes.
- Widgets load in the browser after the page. The embedding page reserves their height with
  `min-height`, measured in the browser, and `display: flow-root`, so the page does not jump when
  they arrive.
- The shell registers the Web Fragments elements through a small subclass. It sets
  `web-fragment-host` to `display: block` inside every `<web-fragment>`. The library leaves it
  inline there, which adds an empty line below each nested widget.

### 6.4 Communication

Web Fragments runs each fragment's JavaScript in its own iframe realm. Realms do not share
`window` or its event listeners, so the blueprint's DOM custom events are replaced by a
same-origin `BroadcastChannel` named `tractor-store`. A tiny `packages/events` package holds
the typed event contract plus two thin helpers, `publish` and `subscribe`. It has no state and
no logic that couples teams.

| Concept                                   | Blueprint                          | This implementation                                                                                                          |
| ----------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Parent to child: variant change           | Full page reload with `?sku=`      | Decide re-renders its page and remounts the widgets with a new `src`, for example `?sku=` on add to cart and recommendations |
| Sibling: add to cart to mini cart         | `checkout:cart-updated` DOM event  | `checkout:cart-updated` on the channel. Mini cart refetches its state.                                                       |
| Child to parent: store picker to checkout | `explore:store-selected` DOM event | `explore:store-selected` on the channel, with the store id. The checkout form fills in the store id.                         |
| Inter-team navigation                     | Plain links                        | Plain links. The gateway serves the owning team's page.                                                                      |

The `<web-fragment>` element does not react to `src` changes, so a parent that needs different
widget input re-creates the element, for example by keying it on the input.

### 6.5 State and data

- Each team keeps its own copy of the blueprint's `database.json` and reads it directly.
- The cart lives in Checkout's `c_cart` cookie, in the blueprint format `SKU_QTY|SKU_QTY`. The
  cookie is HTTP-only, with path `/`. Checkout owns every read and write.
- Listeners subscribe shortly after their fragment starts, so an event can come before they
  listen. The mini cart therefore reads the current quantity right after subscribing. The
  checkout form marks itself with `data-listening` once it hears the store picker, and the tests
  wait for that mark.
- Every cart change goes through a Qwik server function: add on the add to cart widget, remove
  on the cart page, and place order on the checkout page. Each one publishes
  `checkout:cart-updated` or navigates on. The mini cart reads the new quantity through another
  server function.
- Qwik City form actions are not used. Their `Form` builds a `FormData` from the form element,
  and inside a Web Fragment the element belongs to the main page's realm, which the fragment
  realm's `FormData` rejects. Forms therefore need JavaScript, as the fragments themselves do.
- No other team reads the cart cookie.

### 6.6 Styling and assets

- Each team copies its blueprint CSS with the existing `e_`, `d_` and `c_` prefixes.
- Shadow DOM isolates fragment styles, so each fragment ships its own CSS, including the shared
  Button styles from `packages/ui`. The Button registers them with Qwik's `useStyles$`, which
  renders them inside the fragment that uses it.
- The shell declares `@font-face` for Raleway and the global base styles. Inherited properties
  such as `font-family` and custom properties such as `--outer-space` flow into fragments. Font
  faces must be declared at document level, which is why this lives in the shell.
- Rules that match elements, such as `* { box-sizing: border-box }` or `p { line-height }`, do
  not cross shadow boundaries. Each team's CSS repeats them for its own fragment.
- The boundary toggle uses the blueprint's `helper.js` unchanged. The shell adds a small script
  that copies the helper's styles into every nested shadow root, because the helper only
  reaches the first level.
- The blueprint's `public/cdn` folder, about 38 MB of images, fonts and `helper.js`, is copied
  into the shell's static assets and served from `/cdn/*`. No hotlinking to the blueprint host.

## 7. Repository layout

```
tractor-store-qwik/
├── apps/
│   ├── shell/        Cloudflare Worker: gateway, shell HTML, /cdn assets
│   ├── explore/      Qwik City app
│   ├── decide/       Qwik City app
│   ├── checkout/     Qwik City app
│   └── inspire/      Qwik City app
├── packages/
│   ├── ui/           Shared Qwik components (Button), consumed as TypeScript source
│   ├── events/       Typed BroadcastChannel event contract
│   └── tsconfig/     Shared TypeScript config
├── .github/workflows/
│   ├── ci.yml        Lint, typecheck, build on PRs
│   └── deploy.yml    Deploy changed apps on merge to main
├── turbo.json
├── pnpm-workspace.yaml
├── spec.md
└── PLAN.md
```

## 8. Local development

- Node 22.12 or newer is required. `engine-strict` in `.npmrc` makes pnpm stop right away on an
  older version.
- `pnpm install` then `pnpm start` builds every app and runs each Worker in its own
  `wrangler dev` process through Turborepo. The store is opened at http://localhost:3000.
- Service bindings work locally through wrangler's dev registry, so the shell uses the same
  bindings locally and in production.
- `pnpm dev` runs each team app with the Vite dev server on its own port, for working on one
  team in isolation. That mode does not go through the shell.
- Local ports: shell 3000, explore 3001, decide 3002, checkout 3003, inspire 3004.

## 9. CI/CD

- **End-to-end tests** in `e2e/` drive the whole store in Chromium with Playwright: the shell,
  the pages of all three teams, the widgets, and the shopping journey from product to order
  confirmation. Expected values come from the live blueprint. CI runs them on every pull request
  and push to `main`, against a store started locally with `pnpm start`.
- **Pull requests** run lint, typecheck, build and a wrangler dry-run deploy through Turborepo,
  only for packages affected by the change. The dry run checks each Worker's config and bundle
  without Cloudflare credentials.
- **Pushes to `main`** deploy only the apps affected since the previous commit on `main`.
  `scripts/deploy-targets.mjs` asks Turborepo which apps changed, and the workflow runs
  `wrangler deploy` for them through Turborepo. A change that touches no app, such as a docs
  change, deploys nothing.
- **Order.** Team Workers deploy before the shell, so the shell never binds to a missing Worker.
- **Full deploy.** Running the Deploy workflow by hand with "all" checked deploys every app.
- **Public URL.** Only the shell Worker is public, on `tractor-shell.<account subdomain>.workers.dev`.
  Team Workers have no public URL and no preview URLs.
- **Secrets** `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set in the GitHub repo
  settings by the repo owner.
- **Preview deploys** per PR are out of scope for now. Service bindings would still point at the
  production team Workers, which would make previews misleading.

## 10. Workflow

- Repository: public GitHub repo `promesante/tractor-store-qwik`.
- One pull request per task in [PLAN.md](./PLAN.md). Claude opens each PR. The repo owner reviews
  and merges.
- Every merge must leave `main` buildable and deployable.
- When a task depends on a PR that is not merged yet, its branch is stacked on that PR's branch.

## 11. Risks

| Risk                                                | Why it matters                                                                                                                                           | Mitigation                                                                           |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Qwik resumability inside a fragment realm           | Qwik's loader listens on `document`, which Web Fragments patches to point at the fragment's shadow root                                                  | Resolved in the [spike](./docs/spike.md), with a `<div>` container                   |
| Nested fragments                                    | The header embeds the mini cart, and product detail embeds two other teams' widgets                                                                      | Resolved in the [spike](./docs/spike.md)                                             |
| Only the URL-matched page is server-rendered        | Widgets render on the client, so they appear after the page                                                                                              | Reserve widget space with piercing styles to avoid layout shift                      |
| Web Fragments is in beta                            | API changes between minor versions                                                                                                                       | Pin the exact version                                                                |
| Fragment code runs in a separate realm from the DOM | Browser APIs that check an element's type, like `FormData`, can reject elements from the main page                                                       | Use server functions instead of form actions. Test every interaction in the browser. |
| Fragment JavaScript starts after the HTML is shown  | A click in the first moments after a page appears can be lost, because Web Fragments starts each fragment's realm after the server-rendered HTML arrives | Accepted for now. Tests wait for each realm's Qwik loader before interacting.        |

## 12. Publishing to the Tractor Store site

The site's
[contribution steps](https://micro-frontends.org/tractor-store/#contribute), applied here.

| Step on the site                                                      | How this project meets it                                                                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Base the repository on an existing Tractor Store repository           | Based on the blueprint: its data, CSS and static assets. The README credits it, and its MIT license notice is kept. |
| Implement every feature                                               | Section 2.1, tracked in [PLAN.md](./PLAN.md)                                                                        |
| Describe the implementation in README.md and fill out the specs table | Task T13                                                                                                            |
| Submit by email with a repository link, plus a live demo              | Task T14. The live demo is the shell Worker's public URL.                                                           |

### 12.1 Specs table

The README uses the same table as the other implementations. Planned values:

| Aspect                     | Solution                                                             |
| -------------------------- | -------------------------------------------------------------------- |
| 🛠️ Frameworks, Libraries   | Qwik, Qwik City, Web Fragments, Vite, Turborepo                      |
| 📝 Rendering               | SSR with resumability                                                |
| 🐚 Application Shell       | Thin shell Worker running the Web Fragments gateway                  |
| 🧩 Client-Side Integration | Web Fragments: isolated JavaScript realm and shadow DOM per fragment |
| 🧩 Server-Side Integration | Web Fragments gateway piercing of the page fragment                  |
| 📣 Communication           | BroadcastChannel events, URL parameters on widget fragments          |
| 🗺️ Navigation              | MPA, one page fragment per URL                                       |
| 🎨 Styling                 | Self-contained CSS per team, isolated by shadow DOM                  |
| 🍱 Design System           | Shared Qwik Button package                                           |
| 🔮 Discovery               | Route table in the gateway, Cloudflare service bindings              |
| 🚚 Deployment              | Serverless (Cloudflare Workers), GitHub Actions                      |
| 👩‍💻 Local Development       | Turborepo and wrangler dev                                           |

### 12.2 Footer

The footer keeps the Tractor Store initiative block untouched, as the blueprint asks. Only its
credits part changes, to name this tech stack and link to this repository.
