import type { Request, Response } from "express";
import {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";

export function getAllProducts(req: Request, res: Response) {
  const category = req.query.category as string | undefined;
  const products = findAllProducts(category);
  res.json(products);
}

export function getProductById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const product = findProductById(id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
}

export function createProductHandler(req: Request, res: Response) {
  const { name, category, price, stock } = req.body ?? {};

  if (!name || typeof price !== "number") {
    return res.status(400).json({ error: "name and price are required" });
  }

  const product = createProduct({
    name,
    category: category ?? "uncategorized",
    price,
    stock: typeof stock === "number" ? stock : 0,
  });

  res.status(201).json(product);
}

export function updateProductHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const updated = updateProduct(id, req.body ?? {});

  if (!updated) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(updated);
}

export function deleteProductHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const deleted = deleteProduct(id);

  if (!deleted) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json({ deleted: true, id });
}