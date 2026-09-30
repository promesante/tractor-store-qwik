import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Button } from "@tractor/ui";
import { ExploreFooter, ExploreHeader } from "~/components/widgets";

/**
 * Thank-you page, with the blueprint's confetti from canvas-confetti.
 *
 * The confetti draws on a canvas this page owns. Left to itself, the library
 * would size its canvas from the fragment's patched document instead of the
 * browser window.
 */
export default component$(() => {
  const canvas = useSignal<HTMLCanvasElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (!canvas.value) return;
    const { default: confetti } = await import("canvas-confetti");
    const fire = confetti.create(canvas.value, { resize: true });
    const end = Date.now() + 1000;
    const settings = {
      particleCount: 3,
      scalar: 1.5,
      colors: ["#FFDE54", "#FF5A54", "#54FF90"],
      spread: 70,
    };
    const frame = () => {
      fire({ ...settings, angle: 60, origin: { x: 0 } });
      fire({ ...settings, angle: 120, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    // Marks that the confetti fired. It only lasts a second.
    canvas.value.dataset.fired = "";
  });

  return (
    <div data-boundary-page="checkout">
      <ExploreHeader />
      <main class="c_Thanks">
        <h2 class="c_Thanks__title">Thanks for your order!</h2>
        <p class="c_Thanks__text">
          We'll notify you, when its ready for pickup.
        </p>
        <Button href="/" variant="secondary">
          Continue Shopping
        </Button>
      </main>
      <ExploreFooter />
      <canvas
        ref={canvas}
        class="c_Thanks__confetti"
        width={0}
        height={0}
      ></canvas>
    </div>
  );
});
