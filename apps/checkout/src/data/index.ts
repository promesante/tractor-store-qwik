/**
 * Team Checkout's own data, copied from the blueprint's checkout database:
 * every variant with its price and inventory.
 */
import database from "./database.json";

export interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  image: string;
  inventory: number;
}

export const variants = (database as { variants: Variant[] }).variants;

export function findVariant(
  sku: string | null | undefined,
): Variant | undefined {
  return variants.find((v) => v.sku === sku);
}
