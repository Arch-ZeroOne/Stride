"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateProduct = exports.activateProduct = exports.updateProduct = exports.addProduct = exports.getProductById = exports.getAllProducts = void 0;
const dbconfig_1 = require("../dbconfig");
const getAllProducts = async () => {
    console.log("getAllProducts service called");
    const { rows } = await (0, dbconfig_1.query)("SELECT * FROM product");
    return rows;
};
exports.getAllProducts = getAllProducts;
const getProductById = async (id) => {
    const { rows } = await (0, dbconfig_1.query)("SELECT * FROM product WHERE id = $1", [id]);
    return rows[0];
};
exports.getProductById = getProductById;
const addProduct = async (product) => {
    const verified_at = null;
    let created_at = new Date();
    let updated_at = null;
    const { product_name, barcode, image, price, accession_number, product_category_id, } = product;
    const { rows } = await (0, dbconfig_1.query)("INSERT INTO product (product_name,barcode,image,price,accession_number,created_at,updated_at,product_category_id,status_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *", [
        product_name,
        barcode,
        image,
        price,
        accession_number,
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
    const { product_name, image, price, accession_number, product_category_id, status_id, } = product;
    const { rows } = await (0, dbconfig_1.query)("UPDATE product SET product_name = $1, image = $2, price = $3,updated_at = $4, product_category_id = $5 ,status_id = $6 RETURNING *", [product_name, image, price, updated_at, product_category_id, status_id]);
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
    console.log(rows);
    return rows;
};
exports.deactivateProduct = deactivateProduct;
