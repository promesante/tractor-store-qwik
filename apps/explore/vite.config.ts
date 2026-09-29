/**
 * Base Vite config for the explore team.
 *
 * Routes keep their natural paths, for example "/" or "/checkout/cart".
 * Client build output is served under "/_fragment/explore/", so the shell gateway can
 * route asset requests back to this team.
 */
import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { fileURLToPath } from "node:url";

/** Client output folder. Its path under dist is also its URL path. */
export const CLIENT_OUT_DIR = "dist/_fragment/explore";

export default defineConfig((): UserConfig => {
  return {
    plugins: [
      qwikCity({ trailingSlash: false }),
      qwikVite({ client: { outDir: CLIENT_OUT_DIR } }),
    ],
    resolve: {
      alias: { "~": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: {
      headers: { "Cache-Control": "public, max-age=0" },
    },
  };
});
