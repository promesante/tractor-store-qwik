/**
 * Team Decide's own data, copied from the blueprint's decide database:
 * products with their variants and highlights.
 *
 * One product in the blueprint's data spells its highlights key
 * "highlightsa", so the blueprint shows no highlights for it. The data is kept
 * as is, so this store shows the same.
 */
import database from "./database.json";

export interface Variant {
  name: string;
  sku: string;
  image: string;
  color: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  highlights?: string[];
  variants: Variant[];
}

export const products = (database as { products: Product[] }).products;

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
