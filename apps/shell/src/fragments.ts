import type { FragmentConfig } from "web-fragments/gateway";

export type Team = "explore" | "decide" | "checkout";

/**
 * Route patterns per team, in path-to-regexp syntax.
 *
 * Page routes are rendered on the server by piercing. The `/_fragment/<team>/`
 * prefix covers the team's widgets and its client build assets.
 */
export const TEAM_ROUTES: Record<Team, string[]> = {
  explore: [
    "/",
    "/products",
    "/products/:category",
    "/stores",
    "/_fragment/explore/:_*",
  ],
  decide: ["/product/:id", "/_fragment/decide/:_*"],
  checkout: ["/checkout/:_*", "/_fragment/checkout/:_*"],
};

export function fragmentConfig(
  team: Team,
  endpoint: FragmentConfig["endpoint"],
): FragmentConfig {
  return {
    fragmentId: team,
    routePatterns: TEAM_ROUTES[team],
    endpoint,
    onSsrFetchError: () => ({
      response: new Response(
        `<p data-boundary="${team}">Sorry, this part of the store is not available right now.</p>`,
        { headers: { "content-type": "text/html;charset=UTF-8" } },
      ),
    }),
  };
}
