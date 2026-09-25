# The Tractor Store: Qwik + Web Fragments

A micro frontends implementation of [The Tractor Store 2.0](https://micro-frontends.org/tractor-store/),
built with [Web Fragments](https://web-fragments.dev/), [Qwik](https://qwik.dev/) and a
[Turborepo](https://turbo.build/) monorepo, deployed to Cloudflare Workers by GitHub Actions.

The task plan lives in [PLAN.md](./PLAN.md).

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

## 3. Reference implementations

| Reference | What we reuse | What we do differently |
| --- | --- | --- |
| `tractor-store-blueprint` | Page and fragment boundaries, markup, CSS, per-team `database.json`, cookie cart format, custom event names, Cloudflare Worker hosting | Real micro frontends instead of a modular monolith |
| `13-spa-tractor-v2-full` (Picard) | One deployable per team, component split per team | Server rendering instead of a client-only SPA; cart persisted in a cookie instead of in memory |

## 4. Decisions

| Aspect | Decision |
| --- | --- |
| Frameworks | Qwik 1.x stable with Qwik City. Qwik 2 is still in beta. |
| Micro frontend framework | `web-fragments` 0.8.x |
| Rendering | Server-side rendering, resumed in the browser by Qwik |
| Application shell | Thin shell Worker running the Web Fragments gateway |
| Server-side integration | Gateway "piercing" of the page fragment that matches the URL |
| Client-side integration | `<web-fragment src="...">` elements for embedded widgets |
| Communication | `BroadcastChannel` events, plus HTML attributes from parent to child |
| Navigation | Multi-page, one page fragment per URL, owned by one team |
| Styling | Plain CSS per team, copied from the blueprint, isolated by shadow DOM |
| Design system | Shared Qwik `Button` in `packages/ui` |
| Static assets | Images, fonts and helper script copied into the shell and served by it |
| Monorepo | Turborepo with pnpm workspaces |
| Deployment | Cloudflare Workers, one Worker per system, connected by service bindings |
| CI/CD | GitHub Actions: checks on every PR, deploy of changed apps on merge to `main` |
| Preview deploys | Not in scope for now |

## 5. System boundaries

Same boundaries as the blueprint. 📄 is a page, 🧩 is a fragment embedded in another team's page.

- 🔴 **Explore**
  - 📄 Home `/`
  - 📄 Category `/products` and `/products/:category`
  - 📄 Stores `/stores`
  - 🧩 Header, on every page except checkout
  - 🧩 Footer, on every page
  - 🧩 Recommendations, on home, product detail and cart
  - 🧩 Store Picker, on the checkout page
- 🟢 **Decide**
  - 📄 Product detail `/product/:id?sku=...`
- 🟡 **Checkout**
  - 📄 Cart `/checkout/cart`
  - 📄 Checkout `/checkout/checkout`
  - 📄 Thank you `/checkout/thanks`
  - 🧩 Mini Cart, inside the header
  - 🧩 Add To Cart, on product detail
- 🟣 **Inspire** (bonus, later milestone)
  - 🧩 Recommendations, moved out of Explore

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
  └── service binding INSPIRE  ──▶ inspire Worker   (bonus)
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

| Team | Page routes | Widget and asset routes |
| --- | --- | --- |
| Explore | `/`, `/products`, `/products/:category`, `/stores` | `/_fragment/explore/*` |
| Decide | `/product/:id` | `/_fragment/decide/*` |
| Checkout | `/checkout/*` | `/_fragment/checkout/*` |
| Inspire | none | `/_fragment/inspire/*` |

- Widget endpoints, for example: `/_fragment/explore/header`, `/_fragment/explore/footer`,
  `/_fragment/explore/recommendations?skus=...`, `/_fragment/explore/store-picker`,
  `/_fragment/checkout/mini-cart`, `/_fragment/checkout/add-to-cart?sku=...`.
- Each Qwik app builds its client assets under its own `/_fragment/<team>/` base path, so asset
  requests route back to the owning team.
- Anything unmatched falls through to the shell's static assets, for example `/cdn/img/...`.

### 6.4 Communication

Web Fragments runs each fragment's JavaScript in its own iframe realm. Realms do not share
`window` or its event listeners, so the blueprint's DOM custom events are replaced by a
same-origin `BroadcastChannel` named `tractor-store`. A tiny `packages/events` package holds
the typed event contract only, with no runtime logic that couples teams.

| Concept | Blueprint | This implementation |
| --- | --- | --- |
| Parent to child: variant change | Full page reload with `?sku=` | Decide re-renders its page and remounts the widgets with a new `src`, for example `?sku=` on add to cart and recommendations |
| Sibling: add to cart to mini cart | `checkout:cart-updated` DOM event | `checkout:cart-updated` on the channel. Mini cart refetches its state. |
| Child to parent: store picker to checkout | `explore:store-selected` DOM event | `explore:store-selected` on the channel, with the store id. The checkout form fills in the store id. |
| Inter-team navigation | Plain links | Plain links. The gateway serves the owning team's page. |

The `<web-fragment>` element does not react to `src` changes, so a parent that needs different
widget input re-creates the element, for example by keying it on the input.

### 6.5 State and data

- Each team keeps its own copy of the blueprint's `database.json` and reads it directly.
- The cart lives in Checkout's `c_cart` cookie, in the blueprint format `SKU_QTY|SKU_QTY`.
  Checkout owns every read and write. Add, remove and place order are Qwik City actions or
  endpoints under `/checkout/*`.
- No other team reads the cart cookie.

### 6.6 Styling and assets

- Each team copies its blueprint CSS with the existing `e_`, `d_` and `c_` prefixes.
- Shadow DOM isolates fragment styles, so each fragment ships its own CSS, including the shared
  Button styles from `packages/ui`.
- The shell declares `@font-face` for Raleway and the global base styles. Inherited properties
  such as `font-family` flow into fragments. Font faces must be declared at document level,
  which is why this lives in the shell.
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
│   └── inspire/      Qwik City app (bonus)
├── packages/
│   ├── ui/           Shared Qwik components (Button)
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

- `pnpm install` then `pnpm dev` starts every app through Turborepo.
- Local ports: shell 3000, explore 3001, decide 3002, checkout 3003, inspire 3004.
- In local development the shell gateway uses the localhost URLs of the team apps as endpoints.
  In production it uses service bindings.
- The store is opened at http://localhost:3000.

## 9. CI/CD

- **Pull requests** run lint, typecheck and build through Turborepo, only for packages affected by
  the change.
- **Merges to `main`** deploy only the apps affected by the change, using the official Cloudflare
  Wrangler GitHub Action. Team Workers deploy before the shell, so the shell never binds to a
  missing Worker.
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

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Qwik resumability inside a fragment realm | Qwik's loader listens on `document`, which Web Fragments patches to point at the fragment's shadow root | Proven in the spike task before any feature work |
| Nested fragments | The header embeds the mini cart, and product detail embeds two other teams' widgets | Proven in the spike task |
| Only the URL-matched page is server-rendered | Widgets render on the client, so they appear after the page | Reserve widget space with piercing styles to avoid layout shift |
| Web Fragments is in beta | API changes between minor versions | Pin the exact version |
