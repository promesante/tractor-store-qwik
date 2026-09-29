import { component$ } from "@builder.io/qwik";

export const Footer = component$(() => {
  return (
    <footer class="e_Footer" data-boundary="explore">
      <div class="e_Footer__cutter">
        <div class="e_Footer__inner">
          <div class="e_Footer__initiative">
            {/* The Tractor Store initiative block. Keep it untouched. */}
            <img
              src="/cdn/img/neulandlogo.svg"
              alt="neuland - Büro für Informatik"
              width={45}
              height={40}
            />
            <p>
              based on{" "}
              <a
                href="https://micro-frontends.org/tractor-store/"
                target="_blank"
              >
                the tractor store 2.0
              </a>
              <br />a{" "}
              <a href="https://neuland-bfi.de" target="_blank">
                neuland
              </a>{" "}
              project
            </p>
          </div>

          <div class="e_Footer__credits">
            {/* Details about this implementation. */}
            <h3>techstack</h3>
            <p>
              ssr with resumability, web fragments, qwik, qwik city, turborepo,
              cloudflare workers
            </p>
            <p>
              build by{" "}
              <a href="https://github.com/promesante" target="_blank">
                promesante
              </a>{" "}
              /{" "}
              <a
                href="https://github.com/promesante/tractor-store-qwik"
                target="_blank"
              >
                github
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});
