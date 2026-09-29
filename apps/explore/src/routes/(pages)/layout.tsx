import { component$, Slot } from "@builder.io/qwik";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";

/** Layout of Team Explore's pages. Widget routes under _fragment don't use it. */
export default component$(() => {
  return (
    <div data-boundary-page="explore">
      <Header />
      <Slot />
      <Footer />
    </div>
  );
});
