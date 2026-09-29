/**
 * Cart state, kept in the "c_cart" cookie in the blueprint's format:
 * "SKU_QTY|SKU_QTY". Only Team Checkout reads or writes it.
 */
import type { Cookie } from "@builder.io/qwik-city";
import { findVariant, type Variant } from "~/data";

export interface CartItem {
  sku: string;
  quantity: number;
}

const COOKIE = "c_cart";
const ITEM_SEP = "|";
const QTY_SEP = "_";

export function readCart(cookie: Cookie): CartItem[] {
  const value = cookie.get(COOKIE)?.value;
  if (!value) return [];
  return value
    .split(ITEM_SEP)
    .map((item) => {
      const [sku, quantity] = item.split(QTY_SEP);
      return { sku, quantity: parseInt(quantity, 10) };
    })
    .filter((item) => item.sku && item.quantity > 0);
}

export function writeCart(cookie: Cookie, items: CartItem[]): void {
  const value = items
    .map(({ sku, quantity }) => `${sku}${QTY_SEP}${quantity}`)
    .join(ITEM_SEP);
  cookie.set(COOKIE, value, { httpOnly: true, path: "/", sameSite: "lax" });
}

export function addToCart(cookie: Cookie, sku: string): CartItem[] {
  const items = readCart(cookie);
  const item = items.find((i) => i.sku === sku);
  if (item) item.quantity++;
  else items.push({ sku, quantity: 1 });
  writeCart(cookie, items);
  return items;
}

export function cartQuantity(items: CartItem[]): number {
  return items.reduce((total, { quantity }) => total + quantity, 0);
}

export function removeFromCart(cookie: Cookie, sku: string): CartItem[] {
  const items = readCart(cookie).filter((i) => i.sku !== sku);
  writeCart(cookie, items);
  return items;
}

export function clearCart(cookie: Cookie): void {
  writeCart(cookie, []);
}

export interface LineItem extends Variant {
  quantity: number;
  total: number;
}

/** The blueprint's line items: cookie items joined with Checkout's variants. */
export function toLineItems(items: CartItem[]): LineItem[] {
  return items.flatMap(({ sku, quantity }) => {
    const variant = findVariant(sku);
    return variant
      ? [{ ...variant, quantity, total: variant.price * quantity }]
      : [];
  });
}
