/**
 * Team Explore's own data, copied from the blueprint's explore database.
 * Read on the server only, through route loaders.
 */
import database from "./database.json";

export interface Teaser {
  title: string;
  image: string;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  url: string;
  startPrice: number;
}

export interface Category {
  key: string;
  name: string;
  products: Product[];
}

export interface Store {
  id: string;
  name: string;
  street: string;
  city: string;
  image: string;
}

export interface RecoItem {
  name: string;
  sku: string;
  image: string;
  url: string;
  rgb: number[];
}

interface Database {
  teaser: Teaser[];
  categories: Category[];
  stores: Store[];
  recommendations: Record<string, RecoItem>;
}

export const data = database as Database;
