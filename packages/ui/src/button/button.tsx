import { component$, Slot, useStyles$, type QRL } from "@builder.io/qwik";
import styles from "./button.css?inline";

export interface ButtonProps {
  /** Renders a link instead of a button. */
  href?: string;
  type?: "button" | "submit" | "reset";
  name?: string;
  value?: string;
  disabled?: boolean;
  /** A circle, sized for an icon. */
  rounded?: boolean;
  variant?: "primary" | "secondary";
  size?: "normal" | "small";
  title?: string;
  id?: string;
  /** Extra classes, for the owning team's layout. */
  class?: string;
  /** Rendered as the data-id attribute. */
  dataId?: string;
  onClick$?: QRL<(event: MouseEvent, element: HTMLElement) => void>;
}

/**
 * The shared Tractor Store button, bonus objective 1 of the Tractor Store.
 *
 * Its styles are registered with useStyles$, so Qwik renders them inside the
 * fragment that uses the button. That matters with Web Fragments, where every
 * fragment lives in its own shadow root and document styles don't reach it.
 */
export const Button = component$<ButtonProps>(
  ({
    href,
    type,
    name,
    value,
    disabled,
    rounded,
    variant = "secondary",
    size = "normal",
    title,
    id,
    class: className,
    dataId,
    onClick$,
  }) => {
    useStyles$(styles);

    const classes = [
      "ui_Button",
      `ui_Button--${variant}`,
      `ui_Button--size-${size}`,
      rounded && "ui_Button--rounded",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const inner = (
      <div class="ui_Button__inner">
        <Slot />
      </div>
    );

    if (href) {
      return (
        <a
          href={href}
          id={id}
          class={classes}
          title={title}
          data-id={dataId}
          onClick$={onClick$}
        >
          {inner}
        </a>
      );
    }

    return (
      <button
        type={type}
        name={name}
        value={value}
        disabled={disabled}
        id={id}
        class={classes}
        title={title}
        data-id={dataId}
        onClick$={onClick$}
      >
        {inner}
      </button>
    );
  },
);
