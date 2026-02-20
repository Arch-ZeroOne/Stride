import * as saleService from "../services/SalesServices";
import { Request, Response } from "express";

export const addSale = async (req: Request, res: Response) => {
  try {
    const addedSale = await saleService.addSale(req.body);
    //201 = status for product is created
    return res.status(201).json(addedSale);
  } catch (error) {
    console.error("Error adding sale:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
