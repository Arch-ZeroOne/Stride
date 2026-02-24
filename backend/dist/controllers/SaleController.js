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
exports.getSales = exports.addSale = void 0;
const saleService = __importStar(require("../services/SalesServices"));
const addSale = async (req, res) => {
    try {
        const addedSale = await saleService.addSale(req.body);
        if (addedSale) {
            return res.status(201).json({ isAdded: true });
        }
        //201 = status for product is created
        return res.status(401).json({ isAdded: false });
    }
    catch (error) {
        console.error("Error adding sale:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.addSale = addSale;
const getSales = async (req, res) => {
    try {
        const sales = await saleService.getSales();
        return res.status(200).json({ sales });
    }
    catch (error) {
        console.error("Error getting total sales:", error);
        return res.status(500).json({ mesage: "Internal Server Error" });
    }
};
exports.getSales = getSales;
