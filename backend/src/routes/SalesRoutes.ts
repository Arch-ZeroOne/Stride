import { Router } from "express";
import * as saleController from "../controllers/SaleController";

const router = Router();
router.post("/sales", saleController.addSale);

export default router;
