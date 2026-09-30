import type { FragmentConfig } from "web-fragments/gateway";

export type Team = "explore" | "decide" | "checkout" | "inspire";

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
  // "/product/:_*" also covers Qwik City's data requests for client-side
  // navigation, such as /product/CL-01/q-data.json.
  decide: ["/product/:_*", "/_fragment/decide/:_*"],
  checkout: ["/checkout/:_*", "/_fragment/checkout/:_*"],
  // Team Inspire has no pages, only its recommendations widget.
  inspire: ["/_fragment/inspire/:_*"],
};

/**
 * Gateway config for one team.
 *
 * When a team answers a page request with 404, the whole response becomes the
 * shell's 404 page. Any other failure keeps the shell and shows a short notice
 * where the team's page would be.
 */
export function fragmentConfig(
  team: Team,
  endpoint: FragmentConfig["endpoint"],
  notFound: () => Promise<Response>,
): FragmentConfig {
  return {
    fragmentId: team,
    routePatterns: TEAM_ROUTES[team],
    endpoint,
    onSsrFetchError: async (_req, failed) => {
      if (failed instanceof Response && failed.status === 404) {
        const page = await notFound();
        return {
          response: new Response(page.body, {
            status: 404,
            headers: { "content-type": "text/html;charset=UTF-8" },
          }),
          overrideResponse: true,
        };
      }
      return {
        response: new Response(
          `<p data-boundary="${team}">Sorry, this part of the store is not available right now.</p>`,
          { headers: { "content-type": "text/html;charset=UTF-8" } },
        ),
      };
    },
  };
}
