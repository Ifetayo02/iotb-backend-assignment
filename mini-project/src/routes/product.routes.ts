import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "../controllers/product.controller.js";
import { requireApiKey } from "../middleware/requireApiKey.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", requireApiKey, createProductHandler);
router.put("/:id", requireApiKey, updateProductHandler);
router.delete("/:id", requireApiKey, deleteProductHandler);

export default router;