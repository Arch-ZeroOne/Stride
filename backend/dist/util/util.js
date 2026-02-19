"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductCount = void 0;
exports.generateProductBarcode = generateProductBarcode;
const dbconfig_1 = require("../dbconfig");
async function generateProductBarcode() {
    const today = new Date();
    const year = today.getFullYear();
    let count = await (0, exports.getProductCount)();
    return `PRD-${year}-${String(count + 1).padStart(4, "0")}`;
}
const getProductCount = async () => {
    const result = await (0, dbconfig_1.query)("SELECT COUNT(*) FROM product");
    const { rows } = result;
    return parseInt(rows[0].count);
};
exports.getProductCount = getProductCount;
