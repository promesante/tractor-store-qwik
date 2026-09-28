// Bundles the browser script that registers the Web Fragments custom elements.
import { build } from "esbuild";

await build({
  entryPoints: ["src/client.ts"],
  outfile: "public/shell/client.js",
  bundle: true,
  format: "esm",
  minify: true,
  target: "es2022",
});
