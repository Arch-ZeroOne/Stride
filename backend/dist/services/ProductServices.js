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
const dbconfig_1 = require("../dbconfig");
const util = __importStar(require("../util/util"));
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
    console.log(product);
    const { product_name, image, price, product_category_id } = product;
    const { rows } = await (0, dbconfig_1.query)("INSERT INTO product (product_name,barcode,image,price,created_at,updated_at,product_category_id,status_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *", [
        product_name,
        barcode,
        image,
        price,
        created_at,
        updated_at,
        product_category_id,
        1,
    ]);
    return rows;
};
exports.addProduct = addProduct;
const updateProduct = async (id, product) => {
    let updated_at = new Date();
    const { product_name, image, price, product_category_id, status_id } = product;
    const { rows } = await (0, dbconfig_1.query)("UPDATE product SET product_name = $1, image = $2, price = $3,updated_at = $4, product_category_id = $5 ,status_id = $6 WHERE product_id = $7 RETURNING *", [
        product_name,
        image,
        price,
        updated_at,
        product_category_id,
        status_id,
        id,
    ]);
    console.log(rows);
    return rows;
};
exports.updateProduct = updateProduct;
const activateProduct = async (id) => {
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
