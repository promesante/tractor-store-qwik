/**
 * Waits until every team's Worker answers through the shell.
 *
 * The web server check only knows that the shell is up. The team Workers
 * start in parallel, and until one is ready the shell shows its "not
 * available" notice for that team's pages.
 */
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

const PAGES = ["/", "/product/CL-01", "/checkout/cart"];
const DEADLINE_MS = 120_000;

async function ready(path: string): Promise<boolean> {
  try {
    const res = await fetch(BASE_URL + path, {
      headers: { "sec-fetch-dest": "document" },
    });
    const html = await res.text();
    return res.ok && !html.includes("not available right now");
  } catch {
    return false;
  }
}

export default async function globalSetup(): Promise<void> {
  const start = Date.now();
  for (const path of PAGES) {
    while (!(await ready(path))) {
      if (Date.now() - start > DEADLINE_MS) {
        throw new Error(`The store did not become ready: ${path}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
}
