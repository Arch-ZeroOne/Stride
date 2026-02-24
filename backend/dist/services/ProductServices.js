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
exports.getByBarcode = exports.getCategories = exports.markOutOfStock = exports.deactivateProduct = exports.activateProduct = exports.deductProductQuantity = exports.updateProduct = exports.addProduct = exports.getProductById = exports.getAllProducts = void 0;
const dbconfig_1 = require("../dbconfig");
const util = __importStar(require("../util/util"));
// ── Stock Check Helper ────────────────────────────────────────────────────────
// status_id 1 = active, 2 = deactivated, 3 = out of stock
const checkAndUpdateStockStatus = async (id) => {
    const { rows } = await (0, dbconfig_1.query)("SELECT quantity, status_id FROM product WHERE product_id = $1", [id]);
    console.log(rows[0]);
    if (!rows[0])
        return;
    console.log("Checking updatable status");
    const { quantity, status_id } = rows[0];
    // If out of stock and currently active → mark as out of stock (status_id = 3)
    if (quantity <= 0 && status_id === 1) {
        await (0, dbconfig_1.query)("UPDATE product SET status_id = 3 WHERE product_id = $1", [id]);
        console.log(`Product ${id} marked as out of stock`);
    }
    // If back in stock and was out of stock → restore to active (status_id = 1)
    if (quantity > 0 && status_id === 3) {
        await (0, dbconfig_1.query)("UPDATE product SET status_id = 1 WHERE product_id = $1", [id]);
        console.log(`Product ${id} restored to active`);
    }
};
// ── Queries ───────────────────────────────────────────────────────────────────
const getAllProducts = async () => {
    const { rows } = await (0, dbconfig_1.query)("SELECT * FROM product");
    return rows;
};
exports.getAllProducts = getAllProducts;
const getProductById = async (id) => {
    const { rows } = await (0, dbconfig_1.query)("SELECT * FROM product WHERE product_id = $1", [
        id,
    ]);
    return rows[0];
};
exports.getProductById = getProductById;
const addProduct = async (product) => {
    const verified_at = null;
    let created_at = new Date();
    let updated_at = null;
    const barcode = await util.generateProductBarcode();
    let status_id = 1;
    const { product_name, image, price, product_category_id, quantity } = product;
    if (quantity) {
        status_id = quantity > 0 ? 1 : 3;
    }
    const { rows } = await (0, dbconfig_1.query)("INSERT INTO product (product_name,barcode,image,price,created_at,updated_at,product_category_id,status_id,quantity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *", [
        product_name,
        barcode,
        image,
        price,
        created_at,
        updated_at,
        product_category_id,
        status_id, // set out of stock immediately if quantity is 0
        quantity,
    ]);
    return rows;
};
exports.addProduct = addProduct;
const updateProduct = async (id, product) => {
    let updated_at = new Date();
    let { product_name, image, price, product_category_id, status_id, quantity } = product;
    let params = [
        product_name,
        price,
        updated_at,
        product_category_id,
        status_id,
        quantity,
    ];
    console.log("Status ID:" + status_id);
    if (!status_id) {
        status_id = 1;
    }
    let queryString = "UPDATE product SET product_name = $1, price = $2, updated_at = $3, product_category_id = $4, status_id = $5, quantity = $6";
    if (image) {
        queryString += ", image = $7";
        queryString += " WHERE product_id = $8";
        params.push(image);
    }
    else {
        queryString += " WHERE product_id = $7";
    }
    params.push(id);
    const { rows } = await (0, dbconfig_1.query)(`${queryString} RETURNING *`, params);
    // Re-check stock status after update since quantity may have changed
    await checkAndUpdateStockStatus(id);
    return rows;
};
exports.updateProduct = updateProduct;
// Called from your sales service after a successful sale to deduct quantity
const deductProductQuantity = async (product_id, quantity_sold) => {
    const { rows } = await (0, dbconfig_1.query)("UPDATE product SET quantity = quantity - $1 WHERE product_id = $2 RETURNING *", [quantity_sold, product_id]);
    if (!rows[0])
        throw new Error(`Product ${product_id} not found`);
    // Check and auto-update status after deduction
    await checkAndUpdateStockStatus(product_id);
    return rows[0];
};
exports.deductProductQuantity = deductProductQuantity;
const activateProduct = async (id) => {
    // Only allow activation if product has stock
    const { rows: check } = await (0, dbconfig_1.query)("SELECT quantity FROM product WHERE product_id = $1", [id]);
    if (!check[0])
        throw new Error("Product not found");
    if (check[0].quantity <= 0) {
        throw new Error("Cannot activate a product with zero stock");
    }
    const rows = await (0, dbconfig_1.query)("UPDATE product SET status_id = 1 WHERE product_id = $1 RETURNING *", [id]);
    console.log(rows);
    return rows;
};
exports.activateProduct = activateProduct;
const deactivateProduct = async (id) => {
    console.log("deactivateProduct service called with id:", id);
    const rows = await (0, dbconfig_1.query)("UPDATE product SET status_id = 2 WHERE product_id = $1 RETURNING *", [id]);
    return rows;
};
exports.deactivateProduct = deactivateProduct;
const markOutOfStock = async (id) => {
    console.log("deactivateProduct service called with id:", id);
    const rows = await (0, dbconfig_1.query)("UPDATE product SET status_id = 3 WHERE product_id = $1 RETURNING *", [id]);
    return rows;
};
exports.markOutOfStock = markOutOfStock;
const getCategories = async () => {
    const { rows } = await (0, dbconfig_1.query)("SELECT * FROM productcategories");
    return rows;
};
exports.getCategories = getCategories;
const getByBarcode = async (barcode) => {
    const { rows } = await (0, dbconfig_1.query)("SELECT * FROM product WHERE barcode = $1", [
        barcode,
    ]);
    return rows;
};
exports.getByBarcode = getByBarcode;
