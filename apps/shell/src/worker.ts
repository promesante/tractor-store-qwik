import { FragmentGateway, getWebMiddleware } from "web-fragments/gateway";
import { fragmentConfig, type Team } from "./fragments";
import { shellHtml } from "./shell-html";

interface Env {
  ASSETS: Fetcher;
  EXPLORE: Fetcher;
  DECIDE?: Fetcher;
  CHECKOUT: Fetcher;
  MODE?: "development" | "production";
}

/** Uses a service binding as the fragment endpoint. */
function viaBinding(binding: Fetcher): typeof fetch {
  return ((input: RequestInfo | URL, init?: RequestInit) =>
    binding.fetch(new Request(input, init))) as typeof fetch;
}

function createMiddleware(env: Env) {
  const gateway = new FragmentGateway();
  const bindings: Partial<Record<Team, Fetcher>> = {
    explore: env.EXPLORE,
    decide: env.DECIDE,
    checkout: env.CHECKOUT,
  };
  for (const [team, binding] of Object.entries(bindings)) {
    if (binding) {
      gateway.registerFragment(
        fragmentConfig(team as Team, viaBinding(binding)),
      );
    }
  }
  return {
    gateway,
    middleware: getWebMiddleware(gateway, { mode: env.MODE ?? "production" }),
  };
}

let cached: ReturnType<typeof createMiddleware> | undefined;

export default {
  async fetch(request, env) {
    cached ??= createMiddleware(env);
    const { gateway, middleware } = cached;

    return middleware(request, async () => {
      const url = new URL(request.url);
      const page = gateway.matchRequestToFragment(url.pathname + url.search);
      if (page) {
        return new Response(shellHtml(page.fragmentId), {
          headers: { "content-type": "text/html;charset=UTF-8" },
        });
      }
      return env.ASSETS.fetch(request);
    });
  },
} satisfies ExportedHandler<Env>;
