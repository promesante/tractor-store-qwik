# The Tractor Store - Qwik & Web Fragments

A micro frontends implementation of [The Tractor Store](https://micro-frontends.org/tractor-store/),
built with [Qwik](https://qwik.dev/) and [Web Fragments](https://web-fragments.dev/) in a
[Turborepo](https://turbo.build/) monorepo, and deployed to Cloudflare Workers. It is based on the
[Tractor Store Blueprint](https://github.com/neuland/tractor-store-blueprint).

**Live Demo:** [tractor-shell.promesante.workers.dev](https://tractor-shell.promesante.workers.dev)

## What is The Tractor Store?

The Tractor Store is a template to experiment with micro frontend architecture. Its goal is a
real-world application where developers can compare different integration techniques, similar
to what [TodoMVC](http://todomvc.com/) did for JavaScript frameworks. Visit
[micro-frontends.org/tractor-store](https://micro-frontends.org/tractor-store/) to learn more.

## About This Implementation

### Technologies

| Aspect                     | Solution                                                                  |
| -------------------------- | ------------------------------------------------------------------------- |
| 🛠️ Frameworks, Libraries   | [Qwik], [Qwik City], [Web Fragments], [Vite], [Turborepo]                 |
| 📝 Rendering               | SSR with resumability                                                     |
| 🐚 Application Shell       | Thin shell Worker running the Web Fragments gateway                       |
| 🧩 Client-Side Integration | Web Fragments: an isolated JavaScript realm and a shadow DOM per fragment |
| 🧩 Server-Side Integration | Web Fragments gateway "piercing" of the page fragment                     |
| 📣 Communication           | BroadcastChannel events, URL parameters on widget fragments               |
| 🗺️ Navigation              | MPA between teams, client-side navigation for variant changes             |
| 🎨 Styling                 | Self-contained CSS per team, isolated by shadow DOM                       |
| 🍱 Design System           | Shared Qwik Button package                                                |
| 🔮 Discovery               | Route table in the gateway, Cloudflare service bindings                   |
| 🚚 Deployment              | Serverless (Cloudflare Workers), one Worker per team, GitHub Actions      |
| 👩‍💻 Local Development       | Turborepo and wrangler dev, one local Worker per team                     |

[Qwik]: https://qwik.dev/
[Qwik City]: https://qwik.dev/docs/qwikcity/
[Web Fragments]: https://web-fragments.dev/
[Vite]: https://vite.dev/
[Turborepo]: https://turbo.build/

### Architecture

```
Browser
  │
  ▼
shell Worker   Web Fragments gateway, shell page, images and fonts (public)
  ├── explore Worker    home, category, stores, header, footer, store picker
  ├── decide Worker     product page
  ├── checkout Worker   cart, checkout, thank you, mini cart, add to cart
  └── inspire Worker    recommendations
```

- **One Qwik City app per team**, each deployed as its own Cloudflare Worker. Only the shell is
  public. It reaches the team Workers through service bindings.
- **Pages are pierced on the server.** For each request, the gateway finds the team that owns
  the URL, fetches its server-rendered page and embeds it in the shell's HTML.
- **Widgets are nested fragments.** A page embeds other teams' widgets as
  `<web-fragment src="...">` elements, which load in the browser. Nesting goes three levels
  deep: Decide's product page contains Explore's header, which contains Checkout's mini cart.
- **Every fragment is isolated.** Its JavaScript runs in its own iframe realm and its DOM lives
  in a shadow root. Teams don't share `window`, so they talk through a `BroadcastChannel`:
  "cart updated" from add to cart to the mini cart, and "store selected" from Explore's store
  picker to Checkout's form.
- **Qwik resumes instead of hydrating.** A fragment ships almost no JavaScript until the user
  interacts with it.

The full design, with every decision and its reasons, is in [spec.md](./spec.md). The build
history, task by task, is in [PLAN.md](./PLAN.md).

### Both bonus objectives

- **Shared UI components.** The Button lives in `packages/ui` and is used by every team. It
  registers its CSS with the component, so the styles render inside each fragment's shadow root.
- **Team Inspire.** A fourth team took over recommendations from Explore: the widget, the
  algorithm, the styles and the data. Recommendations show Inspire's purple boundary.

### What is special about this take

Web Fragments isolates teams more strongly than most micro frontend techniques: separate
JavaScript realms, not just separate bundles. Making Qwik work inside that took a handful of
findings, documented in [docs/spike.md](./docs/spike.md) and [spec.md](./spec.md):

- **Qwik renders into a `<div>` container.** The gateway renames a fragment's `<html>` and
  `<body>`, and with an `<html>` container Qwik could not find its state.
- **Each team serves its assets under its own prefix**, `/_fragment/<team>/`, while its routes
  keep their natural paths. That's how the gateway routes asset requests to the right team.
- **Qwik City form actions are not used.** Their `Form` builds a `FormData` from the form element,
  which belongs to the main page's realm, and the fragment realm's `FormData` rejects it. Cart
  changes use server functions instead.
- **The shell registers the Web Fragments elements through a small subclass.** The library leaves
  an internal element inline inside nested fragments, which added an empty line under every
  widget.
- **Widgets have reserved space.** They load after the page, so each embedding page reserves their
  height, measured in the browser, and nothing jumps.
- **End-to-end tests compare with the blueprint.** 25 Playwright tests check pages, widgets and
  the whole shopping journey against values taken from the live blueprint. CI runs them on every
  pull request.

### Limitations

- **Very early clicks can be lost.** The gateway sends the page's HTML first, and each fragment's
  JavaScript realm starts right after. A click in those first moments does nothing.
- **Forms need JavaScript**, because cart changes use server functions rather than form posts.
  The fragments need JavaScript anyway.
- **Widgets render in the browser.** Only the page fragment is rendered on the server. Widgets
  such as the header or the recommendations appear once their fragment has loaded.
- **Mobile performance pays for isolation.** The Web Fragments runtime costs about a second of
  script time on Lighthouse's throttled phone profile.
- **Web Fragments is in beta** and uses a deprecated `unload` listener, which costs points in
  Lighthouse's best practices.
- **Local development runs production builds** through the shell. For hot reload, run one team's
  app on its own with the Vite dev server.
- **Blueprint quirks are kept on purpose.** One product's highlights are missing because of a typo
  in the blueprint's data, and an empty cart shows the first four recommendations, as in the
  blueprint.

### Performance

[Lighthouse](https://developer.chrome.com/docs/lighthouse/) 13.5 on the live demo, measured on
2026-09-29. Scores are performance / accessibility / best practices / SEO.

| Page         | Mobile             | Desktop              |
| ------------ | ------------------ | -------------------- |
| Home         | 85 / 93 / 81 / 100 | 100 / 100 / 81 / 100 |
| Product page | 77 / 94 / 81 / 100 | 100 / 100 / 81 / 100 |

Cumulative layout shift is 0 on mobile, and at most 0.02 on desktop.

### Repository Layout

```
apps/
  shell/       Cloudflare Worker: Web Fragments gateway, shell page, static assets
  explore/     Team Explore, Qwik City app
  decide/      Team Decide, Qwik City app
  checkout/    Team Checkout, Qwik City app
  inspire/     Team Inspire, Qwik City app with the recommendations
e2e/           Playwright end-to-end tests
packages/
  events/      Typed BroadcastChannel event contract
  ui/          Shared Qwik Button
  tsconfig/    Shared TypeScript config
```

## How To Run Locally

### Prerequisites

- **Node.js 22.12 or newer.** Vite 7 requires it. The repository's `.nvmrc` selects Node 22, and
  `engine-strict` makes pnpm stop right away on an older version. With
  [nvm](https://github.com/nvm-sh/nvm):

  ```bash
  nvm install 22
  nvm use
  ```

- **pnpm 10.33.2**, the version pinned in `package.json`:

  ```bash
  npm install -g pnpm@10.33.2
  ```

  nvm keeps global packages per Node version, so install pnpm again after switching to a new
  Node version.

### Run the whole store

Clone the repository, install dependencies and start the store:

```bash
git clone https://github.com/promesante/tractor-store-qwik.git
cd tractor-store-qwik
pnpm install
pnpm start
```

Open http://localhost:3000 in your browser.

`pnpm start` builds every app, then starts one local Cloudflare Worker per app with
`wrangler dev`. The Workers are connected by service bindings, just as in production:

| App      | Port | Role                                      |
| -------- | ---- | ----------------------------------------- |
| shell    | 3000 | The store. Open this one in your browser. |
| explore  | 3001 | Reached through the shell                 |
| decide   | 3002 | Reached through the shell                 |
| checkout | 3003 | Reached through the shell                 |
| inspire  | 3004 | Reached through the shell                 |

Code changes need a restart of `pnpm start`, because it serves production builds.

### Work on one team's app

For fast iteration on a single team, run its app alone with the Vite dev server, which reloads
on every change:

```bash
pnpm --filter @tractor/explore dev    # http://localhost:3001
pnpm --filter @tractor/decide dev     # http://localhost:3002
pnpm --filter @tractor/checkout dev   # http://localhost:3003
pnpm --filter @tractor/inspire dev    # http://localhost:3004
```

This mode doesn't go through the shell, so other teams' fragments don't appear.

### Checks

These are the same checks that CI runs on every pull request:

```bash
pnpm lint        # ESLint for every package, and Prettier for the whole repository
pnpm typecheck   # TypeScript
pnpm build       # production builds
pnpm test:e2e    # end-to-end tests in Chromium, against the whole store
```

The end-to-end tests start the store themselves, or reuse one already running on port 3000.
Install their browser once with `pnpm --filter @tractor/e2e exec playwright install chromium`.

`pnpm format` fixes formatting.

### Troubleshooting

- **`Vite requires Node.js version 20.19+ or 22.12+`** or **`ERR_PNPM_UNSUPPORTED_ENGINE`**: your
  Node version is too old. Run `nvm use`.
- **`pnpm: command not found`** after switching Node versions: install pnpm again for that
  version, as shown above.
- **`Cannot find matching keyid`** from Corepack: the Corepack bundled with some Node 22 releases
  has outdated npm signing keys. Install pnpm with npm instead, as shown above.
- **`Address already in use`**: Workers from a previous run are still running. Stop them, or
  free ports 3000 to 3004.

## Deployment

Every push to `main` deploys the apps it changed to Cloudflare Workers, through the
[Deploy workflow](./.github/workflows/deploy.yml). Team Workers deploy before the shell. Only
the shell has a public URL. The workflow needs the `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` repository secrets. See [spec.md, section 9](./spec.md#9-cicd).

## About the Author

Built by [promesante](https://github.com/promesante).

## License

MIT. The data, styles, images, font and boundary helper come from the
[Tractor Store Blueprint](https://github.com/neuland/tractor-store-blueprint) by
[neuland](https://neuland-bfi.de), also under the MIT license. See [LICENSE](./LICENSE).
