import * as saleService from "../services/SalesServices";
import { Request, Response } from "express";

export const addSale = async (req: Request, res: Response) => {
  try {
    const addedSale = await saleService.addSale(req.body);

    if (addedSale) {
      return res.status(201).json({ isAdded: true });
    }

    //201 = status for product is created
    return res.status(401).json({ isAdded: false });
  } catch (error) {
    console.error("Error adding sale:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const sales = await saleService.getSales();

    return res.status(200).json({ sales });
  } catch (error) {
    console.error("Error getting total sales:", error);
    return res.status(500).json({ mesage: "Internal Server Error" });
  }
};
