import * as productService from "../services/ProductServices";
import { Request, Response } from "express";
import { ProductParams } from "../types/RequestParams";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();

    res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProductById = async (
  req: Request<ProductParams>,
  res: Response,
) => {
  try {
    const id = parseInt(req.params.id);
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const addedProduct = await productService.addProduct(req.body);
    //201 = status for product is created
    return res.status(201).json(addedProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProduct = async (
  req: Request<ProductParams>,
  res: Response,
) => {
  try {
    const updatedProduct = await productService.updateProduct(
      req.params.id,
      req.body,
    );

    console.log("updatedProduct:", updatedProduct);
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.log("Error Updating Product", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const activateProduct = async (
  req: Request<ProductParams>,
  res: Response,
) => {
  try {
    const activatedProduct = await productService.activateProduct(
      req.params.id,
    );
    return res.status(200).json(activatedProduct);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deactivateProduct = async (
  req: Request<ProductParams>,
  res: Response,
) => {
  try {
    const deactivatedProduct = await productService.deactivateProduct(
      req.params.id,
    );
    return res.status(200).json(deactivatedProduct);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markOutOfStock = async (
  req: Request<ProductParams>,
  res: Response,
) => {
  try {
    const markedStock = await productService.markOutOfStock(req.params.id);
    return res.status(200).json(markedStock);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await productService.getCategories();
    console.log(categories);
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getByBarcode = async (
  req: Request<ProductParams>,
  res: Response,
) => {
  let barcode;
  try {
    if (req.params.barcode) {
      barcode = req.params.barcode;
      const barcodeScanned = await productService.getByBarcode(barcode);
      return res.status(200).json(barcodeScanned);
    }
    res.status(404).json({ message: "Product Not Found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
