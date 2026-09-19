import { readFileSync } from "node:fs";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

function loadProducts(): Product[] {
  const raw = readFileSync("data/products.csv", "utf8");
  const lines = raw.split("\n").filter((line) => line.trim().length > 0);
  const [, ...rows] = lines; // skip header

  return rows.map((line, index) => {
    const [, name, category, price, stock] = line.split(",");
    return {
      id: index + 1,
      name,
      category,
      price: Number(price),
      stock: Number(stock),
    };
  });
}

let products: Product[] = loadProducts();
let nextId = products.length + 1;

export function findAllProducts(category?: string): Product[] {
  if (!category) return products;
  return products.filter((p) => p.category === category);
}

export function findProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}

export function createProduct(data: Omit<Product, "id">): Product {
  const product: Product = { id: nextId++, ...data };
  products.push(product);
  return product;
}

export function updateProduct(
  id: number,
  data: Partial<Omit<Product, "id">>
): Product | null {
  const product = products.find((p) => p.id === id);
  if (!product) return null;
  Object.assign(product, data);
  return product;
}

export function deleteProduct(id: number): boolean {
  const before = products.length;
  products = products.filter((p) => p.id !== id);
  return products.length < before;
}