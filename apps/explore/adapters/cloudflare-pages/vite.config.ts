/**
 * Server build for Cloudflare. The output runs as a Worker with static assets.
 */
import { cloudflarePagesAdapter } from "@builder.io/qwik-city/adapters/cloudflare-pages/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config";

export default extendConfig(baseConfig, () => {
  return {
    // Qwik's server renderer builds the preloader's bundle-graph URL from the
    // base URL. Client assets live under this team's prefix, not under "/".
    define: {
      "import.meta.env.BASE_URL": JSON.stringify("/_fragment/explore/"),
    },
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.cloudflare-pages.tsx", "@qwik-city-plan"],
      },
    },
    plugins: [cloudflarePagesAdapter()],
  };
});
