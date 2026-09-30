import { expect, type Page } from "@playwright/test";

/**
 * Waits until the named fragments are interactive.
 *
 * The gateway sends the server-rendered HTML first. Web Fragments then starts
 * each fragment's JavaScript in its own iframe realm, named "wf:<fragment-id>".
 * A click that lands before Qwik's loader runs in that realm is lost, so tests
 * wait for the realms they are about to use.
 *
 * Before Qwik's loader runs, `qwikevents` is a plain array that queues event
 * names. The loader replaces it with an object, which marks the realm ready.
 */
export async function waitForFragments(
  page: Page,
  fragmentIds: string[],
): Promise<void> {
  const realmReady = async (id: string): Promise<boolean> => {
    const frame = page.frames().find((f) => f.name() === `wf:${id}`);
    if (!frame) return false;
    try {
      return await frame.evaluate(() => {
        const events = (window as unknown as { qwikevents?: unknown })
          .qwikevents;
        return (
          document.readyState === "complete" &&
          typeof events === "object" &&
          events !== null &&
          !Array.isArray(events)
        );
      });
    } catch {
      return false;
    }
  };

  await expect
    .poll(
      async () =>
        (await Promise.all(fragmentIds.map(realmReady))).every(Boolean),
      {
        timeout: 30_000,
      },
    )
    .toBe(true);
}

/** Opens a page and waits until the named fragments are interactive. */
export async function openReady(
  page: Page,
  url: string,
  fragmentIds: string[],
): Promise<void> {
  await page.goto(url);
  await waitForFragments(page, fragmentIds);
}
