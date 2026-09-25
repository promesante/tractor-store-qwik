# Task Plan

Tasks for building the store described in [spec.md](./spec.md).

- One task is one pull request, except T0, which is committed directly to `main` as the base.
- Claude opens each PR. The repo owner reviews and merges.
- Every merge leaves `main` buildable. From T3 on, every merge also deploys.
- A task whose dependency is not merged yet is stacked on that dependency's branch.
- Branch names follow `t<N>-<slug>`, for example `t1-monorepo-scaffold`.

## Status

| Task | Title | Depends on | Status |
| --- | --- | --- | --- |
| T0 | Spec and plan | none | Done |
| T1 | Monorepo scaffold and CI | T0 | In progress |
| T2 | Spike: Qwik inside Web Fragments | T1 | In progress |
| T3 | Cloudflare Workers and deploy workflow | T2 | To do |
| T4 | Shell: assets, base styles, boundary helper | T3 | To do |
| T5 | Shared UI: Button | T1 | To do |
| T6 | Explore: pages, header and footer | T4, T5 | To do |
| T7 | Explore widgets: recommendations and store picker | T6 | To do |
| T8 | Checkout: cart state, add to cart, mini cart | T4, T5 | To do |
| T9 | Decide: product detail page | T7, T8 | To do |
| T10 | Checkout: cart, checkout and thank-you pages | T7, T8 | To do |
| T11 | End-to-end tests in CI | T9, T10 | To do |
| T12 | Bonus: Inspire team owns recommendations | T11 | To do |
| T13 | Docs: README, tech stack table, footer credits | T11 | To do |

## Phase 0: Foundation

### T0. Spec and plan

- Expand `spec.md` with the agreed architecture.
- Add this plan.
- Create the public repo `promesante/tractor-store-qwik` and push `main`.

### T1. Monorepo scaffold and CI

- pnpm workspaces and Turborepo with `build`, `dev`, `lint`, `typecheck` pipelines.
- `packages/tsconfig` with the shared TypeScript config.
- Prettier and ESLint at the root.
- `.github/workflows/ci.yml` runs lint, typecheck and build on every PR, for affected packages only.
- Node version pinned with `.nvmrc`, pnpm version pinned with `packageManager`.

**Done when** `pnpm install`, `pnpm build`, `pnpm lint` and `pnpm typecheck` pass locally and in CI.

### T2. Spike: Qwik inside Web Fragments

Proves the two open risks in [spec.md, section 11](./spec.md#11-risks) before feature work.

- `apps/shell`: a Worker with the Web Fragments gateway and a minimal shell HTML page.
- `apps/explore`: a Qwik City app with one page at `/` and a counter button.
- `apps/checkout`: a Qwik City app with one widget at `/_fragment/checkout/mini-cart`.
- The explore page embeds the checkout widget as a nested `<web-fragment src>`.
- A `BroadcastChannel` event sent by the explore page updates the checkout widget.
- `packages/events` with the typed event contract.
- Findings written to `docs/spike.md`: what worked, what needed patching, and any change to the spec.

**Done when** the store runs locally through the shell, the page is server-rendered through
piercing, Qwik click handlers work in both fragments, and the event reaches the nested widget.

## Phase 1: Platform

### T3. Cloudflare Workers and deploy workflow

- `wrangler` config for the shell and each team Worker.
- Shell gateway uses service bindings in production and localhost URLs in development.
- `.github/workflows/deploy.yml` deploys affected apps on merge to `main`, team Workers first,
  shell last, with the Cloudflare Wrangler action.
- Repo owner adds `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets.

**Done when** a merge to `main` deploys the spike and it works on the public `workers.dev` URL.

### T4. Shell: assets, base styles, boundary helper

- Copy the blueprint's `public/cdn` folder, about 38 MB, into the shell's static assets.
- Shell HTML with meta tags, favicon links, Raleway `@font-face` and global base styles.
- Load `helper.js` so the team boundary toggle works.
- Gateway error fallbacks and piercing styles that reserve space for widgets.

**Done when** `/cdn/img/...` and `/cdn/js/helper.js` are served by the shell and the boundary
toggle outlines the spike fragments.

### T5. Shared UI: Button

- `packages/ui` with a Qwik `Button` that covers the blueprint's variants: primary, secondary,
  rounded, small, link or button.
- Ships its own CSS so each fragment can include it inside its shadow root.

**Done when** the Button builds and is used by at least one app.

## Phase 2: Teams

### T6. Explore: pages, header and footer

- Import Explore's `database.json` and CSS from the blueprint.
- Pages: home with teasers, category with filter and price sort, stores.
- Header with navigation and footer, as local components on Explore pages.
- Header and footer also exposed as widgets at `/_fragment/explore/header` and `/_fragment/explore/footer`.
- Header embeds the Checkout mini cart widget.

**Done when** the three Explore pages match the blueprint visually.

### T7. Explore widgets: recommendations and store picker

- Recommendations widget at `/_fragment/explore/recommendations?skus=...`, with the blueprint's
  color-distance algorithm.
- Store picker widget at `/_fragment/explore/store-picker` with the dialog, sending
  `explore:store-selected`.
- Home page shows recommendations.

**Done when** both widgets render standalone and inside the home page.

### T8. Checkout: cart state, add to cart, mini cart

- Import Checkout's `database.json` and CSS from the blueprint.
- `c_cart` cookie read and write, in the blueprint format.
- Add to cart widget at `/_fragment/checkout/add-to-cart?sku=...`, with stock info and
  confirmation. Sends `checkout:cart-updated`.
- Mini cart widget at `/_fragment/checkout/mini-cart`. Refetches and highlights on
  `checkout:cart-updated`.

**Done when** adding to cart updates the mini cart without a page reload, and the count survives
a reload.

### T9. Decide: product detail page

- Import Decide's `database.json` and CSS from the blueprint.
- Product page at `/product/:id` with image, highlights and variant options.
- Embeds header, footer, add to cart and recommendations widgets.
- Variant change re-renders the page and remounts the widgets with the new SKU.

**Done when** the product page matches the blueprint and variant change updates the price,
stock and recommendations.

### T10. Checkout: cart, checkout and thank-you pages

- Cart page with line items, remove, total, buttons and recommendations.
- Checkout page with compact header, form validation and the store picker widget. The store id
  is filled from `explore:store-selected`.
- Place order clears the cart and redirects to the thank-you page with confetti.

**Done when** the full journey from home to thank-you works as in the blueprint.

## Phase 3: Quality and bonus

### T11. End-to-end tests in CI

- Playwright tests for the customer journey and each communication concept.
- Run in CI against the locally started store.

### T12. Bonus: Inspire team owns recommendations

- New `apps/inspire` Qwik City app and Worker.
- Move the recommendations widget and its data from Explore to Inspire.
- Update the gateway routes and embedding pages.

### T13. Docs: README, tech stack table, footer credits

- README in the Tractor Store format with the tech stack table and how to run locally.
- Update the footer credits with this implementation's tech stack.
- Lighthouse score of the deployed store.
