import { Router } from "express";
import * as productController from "../controllers/ProductController";

const router = Router();
router.get("/products", productController.getAllProducts);
router.get("/products/categories", productController.getCategories);
router.get("/products/:id", productController.getProductById);
router.get("/products/get/:barcode", productController.getByBarcode);

router.post("/products", productController.addProduct);
router.patch("/products/:id", productController.updateProduct);
router.patch("/products/activate/:id", productController.activateProduct);
router.patch("/products/mark/:id", productController.markOutOfStock);
router.patch("/products/deactivate/:id", productController.deactivateProduct);

export default router;
