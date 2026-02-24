import { query } from "../dbconfig";

export async function generateProductBarcode() {
  const today = new Date();
  const year = today.getFullYear();
  let count = await getProductCount();

  return `PRD-${year}-${String(count + 1).padStart(4, "0")}`;
}
export const getProductCount = async () => {
  const result = await query("SELECT COUNT(*) FROM product");

  const { rows } = result;

  return parseInt(rows[0].count);
};

export const checkProductQuantity = async () => {};

export const markOutOfStock = async () => {};

export const updateProductStock = async () => {};
