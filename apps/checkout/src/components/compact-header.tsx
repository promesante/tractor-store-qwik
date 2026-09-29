import { component$ } from "@builder.io/qwik";

/** Team Checkout's own reduced header, used on the checkout page. */
export const CompactHeader = component$(() => {
  return (
    <header class="c_CompactHeader">
      <div class="c_CompactHeader__inner">
        <a class="c_CompactHeader__link" href="/">
          <img
            class="c_CompactHeader__logo"
            src="/cdn/img/logo.svg"
            alt="Micro Frontends - Tractor Store"
            width={175}
            height={50}
          />
        </a>
      </div>
    </header>
  );
});
