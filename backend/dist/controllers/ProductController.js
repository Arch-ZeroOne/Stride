"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateProduct = exports.activateProduct = exports.updateProduct = exports.addProduct = exports.getProductById = exports.getAllProducts = void 0;
const productService = __importStar(require("../services/ProductServices"));
const getAllProducts = async (req, res) => {
    console.log("getAllProducts called");
    try {
        ("Fetching products from service...");
        const products = await productService.getAllProducts();
        console.log("Products retrieved:", products);
        res.status(200).json(products);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const product = await productService.getProductById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json(product);
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getProductById = getProductById;
const addProduct = async (req, res) => {
    try {
        const addedProduct = await productService.addProduct(req.body);
        //201 = status for product is created
        return res.status(201).json(addedProduct);
    }
    catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.addProduct = addProduct;
const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await productService.updateProduct(req.params.id, req.body);
        console.log("updatedProduct:", updatedProduct);
        return res.status(200).json(updatedProduct);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.updateProduct = updateProduct;
const activateProduct = async (req, res) => {
    try {
        const activatedProduct = await productService.activateProduct(req.params.id);
        return res.status(200).json(activatedProduct);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.activateProduct = activateProduct;
const deactivateProduct = async (req, res) => {
    try {
        const deactivatedProduct = await productService.deactivateProduct(req.params.id);
        return res.status(200).json(deactivatedProduct);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.deactivateProduct = deactivateProduct;
