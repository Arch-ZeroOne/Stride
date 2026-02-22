import { Router } from "express";
import * as saleController from "../controllers/SaleController";

const router = Router();
router.post("/sales", saleController.addSale);
router.get("/sales/total", saleController.getSales);

export default router;
