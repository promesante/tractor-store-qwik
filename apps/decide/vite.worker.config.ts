/**
 * Server build for the Cloudflare Worker. Produces server/entry.worker.js,
 * which wrangler deploys together with the client assets in dist/.
 */
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "./vite.config";

export default extendConfig(baseConfig, () => {
  return {
    // Qwik's server renderer builds the preloader's bundle-graph URL from the
    // base URL. Client assets live under this team's prefix, not under "/".
    define: {
      "import.meta.env.BASE_URL": JSON.stringify("/_fragment/decide/"),
    },
    resolve: {
      conditions: ["webworker", "worker"],
    },
    ssr: {
      target: "webworker",
      noExternal: true,
      external: ["node:async_hooks"],
    },
    publicDir: false,
    build: {
      ssr: true,
      outDir: "server",
      rollupOptions: {
        input: ["src/entry.worker.ts"],
        output: { format: "es", hoistTransitiveImports: false },
      },
    },
  };
});
