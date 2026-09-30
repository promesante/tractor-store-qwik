/**
 * Team Inspire's own data: the recommendable variants with their colors.
 * Moved from Team Explore, which owned recommendations in the blueprint.
 */
import database from "./database.json";

export interface RecoItem {
  name: string;
  sku: string;
  image: string;
  url: string;
  rgb: number[];
}

export const recommendations = (
  database as { recommendations: Record<string, RecoItem> }
).recommendations;
