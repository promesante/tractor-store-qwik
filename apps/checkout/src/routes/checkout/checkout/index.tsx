import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { server$, useNavigate } from "@builder.io/qwik-city";
import { subscribe } from "@tractor/events";
import { Button } from "@tractor/ui";
import { CompactHeader } from "~/components/compact-header";
import { ExploreFooter } from "~/components/widgets";
import { clearCart } from "~/lib/cart";

interface Order {
  firstname: string;
  lastname: string;
  storeId: string;
}

/**
 * Places the order: checks it, then clears the cart.
 *
 * A server function rather than a Qwik City form action, for the same reason
 * as on the cart page: inside a Web Fragment, the fragment realm's FormData
 * rejects the main page's form element.
 */
const placeOrder = server$(function (order: Order) {
  const complete = [order.firstname, order.lastname, order.storeId].every(
    (value) => typeof value === "string" && value.trim() !== "",
  );
  if (!complete) return false;
  clearCart(this.cookie);
  return true;
});

export default component$(() => {
  const navigate = useNavigate();
  const form = useSignal<HTMLFormElement>();
  const firstname = useSignal("");
  const lastname = useSignal("");
  const storeId = useSignal("");
  const valid = useSignal(false);
  const listening = useSignal(false);

  const submit = $(async () => {
    const ok = await placeOrder({
      firstname: firstname.value,
      lastname: lastname.value,
      storeId: storeId.value,
    });
    if (ok) await navigate("/checkout/thanks");
  });

  const validate = $(() => {
    valid.value = !!form.value?.checkValidity() && storeId.value !== "";
  });

  // The store picker belongs to Team Explore. It tells this page about the
  // chosen store with the "explore:store-selected" event.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      cleanup(
        subscribe("explore:store-selected", ({ storeId: id }) => {
          storeId.value = id;
          validate();
        }),
      );
      // Marks the form once it hears the store picker. The picker cannot be
      // asked about a choice made before this moment.
      listening.value = true;
    },
    { strategy: "document-ready" },
  );

  return (
    <div data-boundary-page="checkout">
      <CompactHeader />
      <main class="c_Checkout">
        <h2>Checkout</h2>
        <form
          ref={form}
          method="post"
          class="c_Checkout__form"
          data-listening={listening.value ? "" : undefined}
          preventdefault:submit
          onSubmit$={submit}
          onInput$={validate}
        >
          <h3>Personal Data</h3>
          <fieldset class="c_Checkout__name">
            <div>
              <label class="c_Checkout__label" for="c_firstname">
                First name
              </label>{" "}
              <input
                class="c_Checkout__input"
                type="text"
                id="c_firstname"
                name="firstname"
                required
                onInput$={(_, el) => (firstname.value = el.value)}
              />
            </div>
            <div>
              <label class="c_Checkout__label" for="c_lastname">
                Last name
              </label>{" "}
              <input
                class="c_Checkout__input"
                type="text"
                id="c_lastname"
                name="lastname"
                required
                onInput$={(_, el) => (lastname.value = el.value)}
              />
            </div>
          </fieldset>

          <h3>Store Pickup</h3>
          <fieldset>
            <div class="c_Checkout__store">
              <web-fragment
                class="c_Widget c_Widget--storePicker"
                fragment-id="explore-store-picker"
                src="/_fragment/explore/store-picker"
              />
            </div>
            <label class="c_Checkout__label" for="c_storeId">
              Store ID
            </label>{" "}
            <input
              class="c_Checkout__input"
              type="text"
              id="c_storeId"
              name="storeId"
              value={storeId.value}
              readOnly
              required
            />
          </fieldset>

          <div class="c_Checkout__buttons">
            <Button type="submit" variant="primary" disabled={!valid.value}>
              place order
            </Button>
            <Button href="/checkout/cart" variant="secondary">
              back to cart
            </Button>
          </div>
        </form>
      </main>
      <ExploreFooter />
    </div>
  );
});
