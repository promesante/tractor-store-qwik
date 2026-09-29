# The Tractor Store - Qwik & Web Fragments

A micro frontends implementation of [The Tractor Store](https://micro-frontends.org/tractor-store/),
built with [Qwik](https://qwik.dev/), [Web Fragments](https://web-fragments.dev/) and a
[Turborepo](https://turbo.build/) monorepo, and deployed to Cloudflare Workers. It is based on the
[Tractor Store Blueprint](https://github.com/neuland/tractor-store-blueprint).

**Live Demo:** [tractor-shell.promesante.workers.dev](https://tractor-shell.promesante.workers.dev)

> [!NOTE]
> This is a work in progress. The architecture is in place and deployed, and the store's pages
> are being built team by team. See [PLAN.md](./PLAN.md) for the status of each task.

## What is The Tractor Store?

The Tractor Store is a template to experiment with micro frontend architecture. Its goal is a
real-world application where developers can compare different integration techniques, similar
to what [TodoMVC](http://todomvc.com/) did for JavaScript frameworks. Visit
[micro-frontends.org/tractor-store](https://micro-frontends.org/tractor-store/) to learn more.

## About This Implementation

- **Three teams, three systems.** Explore, Decide and Checkout each own a Qwik City app,
  deployed as its own Cloudflare Worker.
- **Web Fragments integration.** A thin shell Worker runs the Web Fragments gateway. For each
  page, it renders the owning team's fragment on the server and embeds it in the shell. In the
  browser, each fragment's JavaScript runs in its own isolated realm, and its DOM lives in a
  shadow root.
- **Nested fragments.** A page embeds other teams' widgets, such as the mini cart in the header,
  as nested fragments loaded in the browser.
- **Communication.** Teams talk through a `BroadcastChannel`, because isolated realms don't
  share `window` events.

The full architecture is described in [spec.md](./spec.md).

### Technologies

Planned values. They are confirmed as the store is completed.

| Aspect                     | Solution                                                             |
| -------------------------- | -------------------------------------------------------------------- |
| 🛠️ Frameworks, Libraries   | [Qwik], [Qwik City], [Web Fragments], [Vite], [Turborepo]            |
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

[Qwik]: https://qwik.dev/
[Qwik City]: https://qwik.dev/docs/qwikcity/
[Web Fragments]: https://web-fragments.dev/
[Vite]: https://vite.dev/
[Turborepo]: https://turbo.build/

### Repository Layout

```
apps/
  shell/       Cloudflare Worker: Web Fragments gateway, shell page, static assets
  explore/     Team Explore, Qwik City app
  checkout/    Team Checkout, Qwik City app
packages/
  events/      Typed BroadcastChannel event contract
  ui/          Shared Qwik Button
  tsconfig/    Shared TypeScript config
```

Team Decide's app is added in a later task.

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
| checkout | 3003 | Reached through the shell                 |

Code changes need a restart of `pnpm start`, because it serves production builds.

### Work on one team's app

For fast iteration on a single team, run its app alone with the Vite dev server, which reloads
on every change:

```bash
pnpm --filter @tractor/explore dev    # http://localhost:3001
pnpm --filter @tractor/checkout dev   # http://localhost:3003
```

This mode doesn't go through the shell, so other teams' fragments don't appear.

### Checks

These are the same checks that CI runs on every pull request:

```bash
pnpm lint        # ESLint for every package, and Prettier for the whole repository
pnpm typecheck   # TypeScript
pnpm build       # production builds
```

`pnpm format` fixes formatting.

### Troubleshooting

- **`Vite requires Node.js version 20.19+ or 22.12+`** or **`ERR_PNPM_UNSUPPORTED_ENGINE`**: your
  Node version is too old. Run `nvm use`.
- **`pnpm: command not found`** after switching Node versions: install pnpm again for that
  version, as shown above.
- **`Cannot find matching keyid`** from Corepack: the Corepack bundled with some Node 22 releases
  has outdated npm signing keys. Install pnpm with npm instead, as shown above.
- **`Address already in use`**: Workers from a previous run are still running. Stop them, or
  free ports 3000 to 3003.

## Deployment

Every push to `main` deploys the apps it changed to Cloudflare Workers, through the
[Deploy workflow](./.github/workflows/deploy.yml). Team Workers deploy before the shell. Only
the shell has a public URL. The workflow needs the `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` repository secrets. See [spec.md, section 9](./spec.md#9-cicd).

## License

MIT. The data, styles, images, font and boundary helper come from the
[Tractor Store Blueprint](https://github.com/neuland/tractor-store-blueprint) by
[neuland](https://neuland-bfi.de), also under the MIT license. See [LICENSE](./LICENSE).
