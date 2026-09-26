import {
  renderToStream,
  type RenderToStreamOptions,
} from "@builder.io/qwik/server";
import Root from "./root";

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    ...opts,
    // Client chunks are served from this team's prefix. See vite.config.ts.
    base: import.meta.env.DEV ? opts.base : "/_fragment/explore/build/",
    // A fragment is not a whole document. With an <html> container, Qwik looks
    // for its state at the end of <body>, but the gateway renames <html> and
    // <body>. A <div> container keeps the state script inside the container.
    containerTagName: "div",
    containerAttributes: {
      class: "fragment-root",
      ...opts.containerAttributes,
    },
    serverData: {
      ...opts.serverData,
    },
  });
}
